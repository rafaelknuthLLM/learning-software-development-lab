#!/bin/bash

# Comprehensive test runner for Docker environment
# Runs all test suites with proper coordination and reporting

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="/app/test-results"
SHARED_DIR="/app/docker-test/volumes/shared"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Ensure directories exist
mkdir -p "$TEST_DIR" "$SHARED_DIR"

# Logging function
log() {
    echo -e "${1}" | tee -a "$TEST_DIR/test-runner-$TIMESTAMP.log"
}

# Function to run test suite
run_test_suite() {
    local suite_name="$1"
    local test_command="$2"
    local output_file="$TEST_DIR/${suite_name}-${TIMESTAMP}.log"
    
    log "${YELLOW}🧪 Running $suite_name tests...${NC}"
    
    if eval "$test_command" > "$output_file" 2>&1; then
        log "${GREEN}✅ $suite_name tests passed${NC}"
        return 0
    else
        log "${RED}❌ $suite_name tests failed${NC}"
        cat "$output_file"
        return 1
    fi
}

# Function to check service health
check_service_health() {
    local service_name="$1"
    local health_url="$2"
    local max_attempts=30
    local attempt=0
    
    log "${BLUE}🔍 Checking $service_name health...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f "$health_url" >/dev/null 2>&1; then
            log "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    log "${RED}❌ $service_name health check failed${NC}"
    return 1
}

# Main test execution
main() {
    log "${BLUE}🚀 Starting comprehensive test suite...${NC}"
    log "${BLUE}📅 Started at: $(date)${NC}"
    
    local failed_tests=0
    
    # Unit tests
    if ! run_test_suite "unit" "npm run test:unit -- --verbose --coverage"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # Integration tests
    if ! run_test_suite "integration" "npm run test:integration -- --verbose"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # CLI tests
    if ! run_test_suite "cli" "npm run test:cli -- --verbose"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # Swarm coordination tests
    if ! run_test_suite "swarm" "npm run test:swarm -- --verbose"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # MCP integration tests
    if ! run_test_suite "mcp" "npm run test:mcp -- --verbose"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # Memory system tests
    if ! run_test_suite "memory" "npm run test:memory -- --verbose"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # Performance tests
    if ! run_test_suite "performance" "npm run test:performance -- --verbose"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # E2E tests
    if ! run_test_suite "e2e" "npm run test:e2e -- --verbose"; then
        failed_tests=$((failed_tests + 1))
    fi
    
    # Generate test report
    cat > "$TEST_DIR/test-summary-$TIMESTAMP.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "total_suites": 8,
  "passed_suites": $((8 - failed_tests)),
  "failed_suites": $failed_tests,
  "success_rate": $(echo "scale=2; $((8 - failed_tests)) * 100 / 8" | bc -l)%,
  "environment": "docker",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)"
}
EOF
    
    # Store results in shared volume
    cp "$TEST_DIR/test-summary-$TIMESTAMP.json" "$SHARED_DIR/"
    
    if [ $failed_tests -eq 0 ]; then
        log "${GREEN}🎉 All test suites passed!${NC}"
        exit 0
    else
        log "${RED}❌ $failed_tests test suite(s) failed${NC}"
        exit 1
    fi
}

# Execute main function
main "$@"