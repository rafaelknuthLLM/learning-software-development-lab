# Deployment and Infrastructure Architecture

## Overview

This document outlines the deployment strategy, infrastructure requirements, and operational considerations for the REST API system.

## Infrastructure Architecture

### Production Environment

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (AWS ALB/ELB) │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │   API Gateway   │
                    │   (Kong/Nginx)  │
                    └─────────┬───────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │  API Server   │ │  API Server   │ │  API Server   │
    │   Instance    │ │   Instance    │ │   Instance    │
    └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Database    │     │     Cache     │     │   Message     │
│ (PostgreSQL)  │     │   (Redis)     │     │   Queue       │
│   Cluster     │     │   Cluster     │     │ (Redis/RabbitMQ)│
└───────────────┘     └───────────────┘     └───────────────┘
```

## Containerization Strategy

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Build the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set correct permissions
USER app

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/app.js"]
```

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src:/app/src:ro
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: rest_api_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass redispassword
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/private
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### Namespace and ConfigMap

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: rest-api
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: rest-api
data:
  NODE_ENV: "production"
  DB_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
  JWT_EXPIRES_IN: "15m"
  LOG_LEVEL: "info"
```

### Secret Management

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
  namespace: rest-api
type: Opaque
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-jwt-secret>
  JWT_REFRESH_SECRET: <base64-encoded-refresh-secret>
  ENCRYPTION_KEY: <base64-encoded-encryption-key>
```

### Application Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: rest-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: rest-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: api-config
              key: NODE_ENV
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: DB_PASSWORD
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: JWT_SECRET
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
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: app-logs
          mountPath: /app/logs
      volumes:
      - name: app-logs
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: rest-api
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### Database Deployment

```yaml
# k8s/postgres-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-deployment
  namespace: rest-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: "rest_api_db"
        - name: POSTGRES_USER
          value: "postgres"
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: DB_PASSWORD
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: rest-api
spec:
  selector:
    app: postgres
  ports:
  - protocol: TCP
    port: 5432
    targetPort: 5432
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: rest-api
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
          
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

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
    
    - name: Run type checking
      run: npm run typecheck
    
    - name: Run tests
      run: npm test
      env:
        NODE_ENV: test
        DB_HOST: localhost
        DB_PORT: 5432
        DB_NAME: test_db
        DB_USERNAME: postgres
        DB_PASSWORD: postgres
        REDIS_HOST: localhost
        REDIS_PORT: 6379
        JWT_SECRET: test-secret
        JWT_REFRESH_SECRET: test-refresh-secret
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix=sha-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Add deployment script here

  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production environment"
        # Add deployment script here
```

## Infrastructure as Code (Terraform)

### AWS Infrastructure

```hcl
# infrastructure/main.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "rest-api-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "rest-api-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "rest-api-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = 2

  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "rest-api-public-${count.index + 1}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "rest-api-private-${count.index + 1}"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "rest-api-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "rest-api-db"

  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_type            = "gp2"
  engine                  = "postgres"
  engine_version          = "15.3"
  instance_class          = "db.t3.micro"
  
  db_name  = "rest_api_db"
  username = "postgres"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  skip_final_snapshot = true
  deletion_protection = false

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  tags = {
    Name = "rest-api-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "rest-api-redis-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "rest-api-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  port                 = 6379
  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "rest-api-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "rest-api-alb"
  }
}
```

## Monitoring and Observability

### Health Check Endpoints

```typescript
// routes/health.routes.ts
import express from 'express';
import { DatabaseConnection } from '../config/database.config';
import { redisClient } from '../config/redis.config';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await DatabaseConnection.query('SELECT 1');
    
    // Check Redis connection
    await redisClient.ping();
    
    res.status(200).json({
      status: 'Ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'OK',
        redis: 'OK'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'Not Ready',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: {
        database: 'FAILED',
        redis: 'FAILED'
      }
    });
  }
});

router.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    timestamp: new Date().toISOString(),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    },
    uptime: process.uptime(),
    cpu: process.cpuUsage()
  });
});

export { router as healthRoutes };
```

## Environment Configuration

### Environment Variables Template

```bash
# .env.example

# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rest_api_db
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_ISSUER=rest-api
JWT_AUDIENCE=api-users

# Encryption
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# External Services
EMAIL_SERVICE_URL=https://api.mailgun.net/v3
EMAIL_API_KEY=your_email_api_key

# Monitoring
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
SENTRY_DSN=your_sentry_dsn

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIRECTORY=./uploads

# Security
BCRYPT_SALT_ROUNDS=12
SESSION_TIMEOUT=86400
```

This deployment architecture provides a robust, scalable, and maintainable infrastructure for the REST API system with proper CI/CD, monitoring, and security considerations.