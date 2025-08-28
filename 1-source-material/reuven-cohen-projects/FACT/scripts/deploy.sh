#!/bin/bash
# FACT System Deployment Script
# Supports Docker Compose and Kubernetes deployments

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"

# Default values
ENVIRONMENT="development"
DEPLOYMENT_TYPE="docker"
VERSION="latest"
NAMESPACE="fact-system"
FORCE_REBUILD=false
SKIP_TESTS=false
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Usage function
usage() {
    cat << EOF
FACT System Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENVIRONMENT    Deployment environment (development|staging|production)
    -t, --type TYPE                  Deployment type (docker|kubernetes)
    -v, --version VERSION            Application version/tag to deploy
    -n, --namespace NAMESPACE        Kubernetes namespace (for k8s deployments)
    -f, --force-rebuild             Force rebuild of Docker images
    -s, --skip-tests                Skip running tests before deployment
    --verbose                       Enable verbose output
    -h, --help                      Show this help message

EXAMPLES:
    # Deploy to development with Docker Compose
    $0 -e development -t docker

    # Deploy to production with Kubernetes
    $0 -e production -t kubernetes -v v1.0.0

    # Force rebuild and deploy to staging
    $0 -e staging -t docker -f

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -t|--type)
                DEPLOYMENT_TYPE="$2"
                shift 2
                ;;
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -f|--force-rebuild)
                FORCE_REBUILD=true
                shift
                ;;
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

# Validation functions
validate_environment() {
    case $ENVIRONMENT in
        development|staging|production)
            log_info "Deploying to environment: $ENVIRONMENT"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

validate_deployment_type() {
    case $DEPLOYMENT_TYPE in
        docker|kubernetes)
            log_info "Using deployment type: $DEPLOYMENT_TYPE"
            ;;
        *)
            log_error "Invalid deployment type: $DEPLOYMENT_TYPE"
            log_error "Valid types: docker, kubernetes"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if running from project root
    if [[ ! -f "$PROJECT_ROOT/requirements.txt" ]]; then
        log_error "Must run from FACT project root directory"
        exit 1
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    # Check Docker Compose for docker deployments
    if [[ "$DEPLOYMENT_TYPE" == "docker" ]]; then
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            log_error "Docker Compose is not installed or not in PATH"
            exit 1
        fi
    fi

    # Check kubectl for Kubernetes deployments
    if [[ "$DEPLOYMENT_TYPE" == "kubernetes" ]]; then
        if ! command -v kubectl &> /dev/null; then
            log_error "kubectl is not installed or not in PATH"
            exit 1
        fi
        
        # Check cluster connectivity
        if ! kubectl cluster-info &> /dev/null; then
            log_error "Cannot connect to Kubernetes cluster"
            exit 1
        fi
    fi

    log_success "Prerequisites check passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Skipping tests as requested"
        return 0
    fi

    log_info "Running tests..."
    cd "$PROJECT_ROOT"

    # Run unit tests
    if ! python -m pytest tests/unit/ -v --tb=short; then
        log_error "Unit tests failed"
        exit 1
    fi

    # Run integration tests for non-production environments
    if [[ "$ENVIRONMENT" != "production" ]]; then
        if ! python -m pytest tests/integration/ -v --tb=short; then
            log_error "Integration tests failed"
            exit 1
        fi
    fi

    log_success "Tests passed"
}

# Docker deployment functions
deploy_docker() {
    log_info "Deploying with Docker Compose..."
    cd "$DEPLOYMENT_DIR/docker"

    local compose_file="docker-compose.yml"
    if [[ "$ENVIRONMENT" == "production" ]]; then
        compose_file="docker-compose.prod.yml"
    fi

    # Set environment variables
    export VERSION="$VERSION"
    export ENVIRONMENT="$ENVIRONMENT"

    # Build or pull images
    if [[ "$FORCE_REBUILD" == "true" ]] || [[ "$ENVIRONMENT" == "development" ]]; then
        log_info "Building Docker images..."
        docker-compose -f "$compose_file" build --no-cache
    else
        log_info "Pulling Docker images..."
        docker-compose -f "$compose_file" pull
    fi

    # Deploy services
    log_info "Starting services..."
    docker-compose -f "$compose_file" up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    for i in {1..30}; do
        if docker-compose -f "$compose_file" ps | grep -q "Up (healthy)"; then
            break
        fi
        if [[ $i -eq 30 ]]; then
            log_error "Services failed to become healthy"
            docker-compose -f "$compose_file" logs
            exit 1
        fi
        sleep 10
    done

    log_success "Docker deployment completed"
}

# Kubernetes deployment functions
deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."
    cd "$DEPLOYMENT_DIR/kubernetes"

    # Create namespace if it doesn't exist
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Creating namespace: $NAMESPACE"
        kubectl apply -f namespace.yaml
    fi

    # Update image version in deployment manifest
    if [[ -f "deployment.yaml" ]]; then
        log_info "Updating image version to: $VERSION"
        sed -i.bak "s|image: .*fact-system:.*|image: ghcr.io/fact-system:$VERSION|g" deployment.yaml
    fi

    # Apply manifests in order
    log_info "Applying Kubernetes manifests..."
    
    kubectl apply -f namespace.yaml
    kubectl apply -f secrets.yaml
    kubectl apply -f configmap.yaml
    
    if [[ -f "pvc.yaml" ]]; then
        kubectl apply -f pvc.yaml
    fi
    
    if [[ -f "deployment.yaml" ]]; then
        kubectl apply -f deployment.yaml
    fi
    
    if [[ -f "service.yaml" ]]; then
        kubectl apply -f service.yaml
    fi
    
    if [[ -f "ingress.yaml" ]]; then
        kubectl apply -f ingress.yaml
    fi

    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    if kubectl get deployment fact-app -n "$NAMESPACE" &> /dev/null; then
        kubectl rollout status deployment/fact-app -n "$NAMESPACE" --timeout=600s
    fi

    log_success "Kubernetes deployment completed"
}

# Health check function
health_check() {
    log_info "Performing health check..."
    
    local health_url
    case $DEPLOYMENT_TYPE in
        docker)
            health_url="http://localhost:8000/health"
            ;;
        kubernetes)
            # Port forward for health check
            kubectl port-forward -n "$NAMESPACE" service/fact-app 8080:8000 &
            local port_forward_pid=$!
            sleep 5
            health_url="http://localhost:8080/health"
            ;;
    esac

    # Try health check
    for i in {1..10}; do
        if curl -f "$health_url" &> /dev/null; then
            log_success "Health check passed"
            if [[ "$DEPLOYMENT_TYPE" == "kubernetes" ]]; then
                kill $port_forward_pid 2>/dev/null || true
            fi
            return 0
        fi
        log_info "Health check attempt $i/10 failed, retrying..."
        sleep 10
    done

    log_error "Health check failed"
    if [[ "$DEPLOYMENT_TYPE" == "kubernetes" ]]; then
        kill $port_forward_pid 2>/dev/null || true
    fi
    exit 1
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    case $DEPLOYMENT_TYPE in
        docker)
            cd "$DEPLOYMENT_DIR/docker"
            docker-compose down
            ;;
        kubernetes)
            kubectl rollout undo deployment/fact-app -n "$NAMESPACE"
            kubectl rollout status deployment/fact-app -n "$NAMESPACE"
            ;;
    esac
    
    log_success "Rollback completed"
}

# Main deployment function
main() {
    log_info "Starting FACT System deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Type: $DEPLOYMENT_TYPE"
    log_info "Version: $VERSION"

    # Set verbose mode
    if [[ "$VERBOSE" == "true" ]]; then
        set -x
    fi

    # Validation
    validate_environment
    validate_deployment_type
    check_prerequisites

    # Run tests
    run_tests

    # Deploy based on type
    case $DEPLOYMENT_TYPE in
        docker)
            deploy_docker
            ;;
        kubernetes)
            deploy_kubernetes
            ;;
    esac

    # Health check
    health_check

    log_success "FACT System deployment completed successfully!"
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    # Show access information
    case $DEPLOYMENT_TYPE in
        docker)
            log_info "Application URL: http://localhost:8000"
            log_info "Grafana Dashboard: http://localhost:3000"
            log_info "Prometheus Metrics: http://localhost:9090"
            ;;
        kubernetes)
            log_info "Use kubectl to access services in namespace: $NAMESPACE"
            log_info "Port forward example: kubectl port-forward -n $NAMESPACE service/fact-app 8000:8000"
            ;;
    esac
}

# Trap for cleanup on script exit
trap 'log_error "Deployment failed. Check logs above for details."' ERR

# Parse arguments and run main function
parse_args "$@"
main

log_success "Deployment script completed successfully!"