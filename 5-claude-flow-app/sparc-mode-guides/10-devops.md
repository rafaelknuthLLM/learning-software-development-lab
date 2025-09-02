# 🚀 DevOps Mode

## Purpose

DevOps mode is the deployment and infrastructure specialist that transforms code into running, scalable, and reliable production systems. It handles CI/CD pipelines, infrastructure as code, containerization, monitoring, and ensures your application runs smoothly from development to production.

## Non-Technical Analogy

Think of DevOps mode like the **crew chief and pit crew of a racing team**. They:
- Prepare the car for race day (build and package)
- Transport it safely to the track (deployment)
- Monitor performance during the race (observability)
- Make quick adjustments without stopping (rolling updates)
- Have backup plans for failures (disaster recovery)
- Optimize for speed and reliability (performance tuning)
- Keep detailed logs of everything (logging and metrics)

Just as a pit crew ensures the race car performs optimally, DevOps ensures your application runs flawlessly in production.

## When to Use This Mode

✅ **Use DevOps when:**
- Setting up CI/CD pipelines
- Deploying to cloud platforms
- Containerizing applications
- Creating infrastructure as code
- Setting up monitoring and alerting
- Implementing auto-scaling
- Managing secrets and configuration
- Setting up development environments
- Creating backup strategies
- Implementing disaster recovery

❌ **Skip this mode when:**
- Working on pure application logic
- Creating documentation
- Designing UI/UX
- Writing unit tests only

## Typical Workflow

### 1. **Infrastructure Planning** (20-30 minutes)
```bash
# Start DevOps setup
npx claude-flow sparc run devops "Deploy Node.js app to AWS with auto-scaling and monitoring"
```

The mode will:
- Analyze application requirements
- Choose appropriate infrastructure
- Design deployment architecture
- Plan scaling strategy
- Set up monitoring approach
- Define backup procedures
- Create security measures

### 2. **Container Configuration**

#### Dockerfile Creation
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
```

#### Docker Compose for Development
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres:5432/myapp
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    command: npm run dev

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

### 3. **CI/CD Pipeline**

#### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  AWS_REGION: 'us-east-1'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: myapp
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster production \
            --service myapp-service \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster production \
            --services myapp-service
```

### 4. **Infrastructure as Code**

#### Terraform Configuration
```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "myapp-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  
  name = "${var.app_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = true
  enable_dns_hostnames = true
  
  tags = var.common_tags
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = module.vpc.public_subnets
  
  enable_deletion_protection = true
  enable_http2              = true
  
  tags = var.common_tags
}

# Auto Scaling
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "${var.app_name}-cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70
  }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  identifier     = "${var.app_name}-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  storage_encrypted    = true
  storage_type         = "gp3"
  
  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  skip_final_snapshot = false
  final_snapshot_identifier = "${var.app_name}-db-final-snapshot-${formatdate("YYYY-MM-DD", timestamp())}"
  
  tags = var.common_tags
}
```

### 5. **Kubernetes Deployment**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myregistry/myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 6. **Monitoring & Observability**

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: 'myapp'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

#### Alert Rules
```yaml
# alerts.yml
groups:
  - name: myapp
    rules:
      - alert: HighCPUUsage
        expr: rate(process_cpu_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% (current value: {{ $value }})"
      
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 500000000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 500MB (current value: {{ $value }})"
      
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 5% (current value: {{ $value }})"
```

## Example Usage

### Cloud Deployment
```bash
npx claude-flow sparc run devops "Deploy to AWS with ECS, RDS, and CloudWatch"
```

### Kubernetes Setup
```bash
npx claude-flow sparc run devops "Create Kubernetes manifests with auto-scaling and monitoring"
```

### CI/CD Pipeline
```bash
npx claude-flow sparc run devops "Set up GitHub Actions with testing, building, and deployment"
```

### Infrastructure as Code
```bash
npx claude-flow sparc run devops "Create Terraform configuration for multi-region deployment"
```

## Output Structure

DevOps mode generates:

```
/.github/workflows/
  - ci.yml                    # CI pipeline
  - cd.yml                    # CD pipeline

/docker/
  - Dockerfile               # Multi-stage Docker build
  - docker-compose.yml       # Local development
  - docker-compose.prod.yml  # Production compose

/kubernetes/
  - deployment.yml          # K8s deployment
  - service.yml            # K8s service
  - configmap.yml          # Configuration
  - secrets.yml            # Secret management
  - ingress.yml           # Ingress rules

/terraform/
  - main.tf               # Main configuration
  - variables.tf          # Variable definitions
  - outputs.tf           # Output values
  - modules/             # Reusable modules

/scripts/
  - deploy.sh            # Deployment script
  - rollback.sh         # Rollback script
  - backup.sh           # Backup script

/monitoring/
  - prometheus.yml       # Prometheus config
  - grafana/            # Grafana dashboards
  - alerts.yml          # Alert rules
```

## Best Practices

### ✅ DO:
- Use infrastructure as code
- Implement CI/CD pipelines
- Container-based deployments
- Automated testing before deploy
- Blue-green or canary deployments
- Monitor everything
- Automate rollbacks
- Use secrets management
- Implement proper logging
- Regular backups

### ❌ DON'T:
- Deploy manually
- Hardcode secrets
- Skip testing in CI
- Ignore monitoring alerts
- Deploy on Fridays
- Use latest tags in production
- Run containers as root
- Forget about backups
- Skip documentation
- Ignore security updates

## Integration with Other Modes

DevOps connects to:

1. **← All Modes**: Deploys code from all modes
2. **← Security-Review**: Implements security measures
3. **← Integration**: Deploys integration infrastructure
4. **→ Debug**: When deployment issues occur
5. **→ Monitoring**: Sets up observability

## Memory Integration

DevOps configurations are stored:
```bash
# Store deployment strategies
npx claude-flow memory store devops_strategy "Blue-green deployment with ECS"

# Store infrastructure decisions
npx claude-flow memory store devops_infra "Using Terraform for IaC"

# Query DevOps history
npx claude-flow memory query devops
```

## Tips for Success

1. **Automate Everything**: If you do it twice, automate it
2. **Fail Fast**: Catch issues early in the pipeline
3. **Monitor Proactively**: Don't wait for users to report issues
4. **Document Runbooks**: Clear procedures for incidents
5. **Practice Disasters**: Regular disaster recovery drills
6. **Version Everything**: Including infrastructure
7. **Security First**: Build security into the pipeline
8. **Keep It Simple**: Complex systems fail in complex ways

## Conclusion

DevOps mode is your **deployment and operations expert** that ensures your code doesn't just work on your machine but thrives in production. It bridges the gap between development and operations, creating reliable, scalable, and maintainable systems.

Remember: **DevOps is not just about tools, it's about culture. Automate the mundane so humans can focus on the creative!**