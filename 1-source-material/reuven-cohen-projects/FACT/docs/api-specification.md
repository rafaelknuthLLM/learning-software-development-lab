# FACT System API Specification

## 1. API Overview

The FACT system exposes both internal APIs for component communication and external APIs for client interaction. This specification defines all API interfaces, data formats, and communication protocols.

### 1.1 API Architecture Principles
- **RESTful Design**: HTTP-based APIs following REST conventions
- **Async-First**: All APIs designed for asynchronous operation
- **Schema Validation**: Strict input/output validation
- **Error Handling**: Consistent error response format
- **Security**: Authentication and authorization on all endpoints

### 1.2 Base Configuration
```yaml
# API Configuration
base_url: "http://localhost:8000"
api_version: "v1"
content_type: "application/json"
authentication: "Bearer Token"
rate_limiting: "100 requests/minute"
```

## 2. Core Driver API

### 2.1 Query Processing Endpoint

#### Process User Query
```http
POST /api/v1/query
Content-Type: application/json
Authorization: Bearer {token}

{
  "query": "What was Q1-2025 net revenue?",
  "user_id": "user@example.com",
  "context": {
    "session_id": "session_123",
    "preferences": {
      "format": "detailed",
      "include_metadata": true
    }
  },
  "cache_options": {
    "use_cache": true,
    "cache_prefix": "fact_v1"
  }
}
```

**Response Format:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "query_id": "query_456",
  "response": "Q1-2025 net revenue was $1,234,567.89 based on the latest financial data.",
  "metadata": {
    "latency_ms": 45,
    "cache_status": "hit",
    "token_cost": 150,
    "cost_savings_percent": 90,
    "tools_used": ["SQL.QueryReadonly"],
    "confidence_score": 0.95
  },
  "sources": [
    {
      "type": "database",
      "table": "revenue",
      "query": "SELECT value FROM revenue WHERE quarter = 'Q1-2025'",
      "timestamp": "2025-05-23T12:58:29Z"
    }
  ],
  "status": "success"
}
```

**Error Response:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "INVALID_QUERY",
    "message": "Query cannot be empty",
    "details": {
      "field": "query",
      "constraint": "min_length",
      "value": ""
    }
  },
  "query_id": "query_456",
  "timestamp": "2025-05-23T12:58:29Z",
  "status": "error"
}
```

#### Query Status Check
```http
GET /api/v1/query/{query_id}/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "query_id": "query_456",
  "status": "completed",
  "progress": {
    "current_step": "tool_execution",
    "total_steps": 3,
    "completion_percent": 100
  },
  "estimated_completion": null,
  "created_at": "2025-05-23T12:58:29Z",
  "completed_at": "2025-05-23T12:58:29Z"
}
```

### 2.2 System Information Endpoints

#### Health Check
```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 3600,
  "components": {
    "cache": {
      "status": "healthy",
      "hit_rate": 85.5,
      "total_entries": 1250
    },
    "tools": {
      "status": "healthy",
      "registered_count": 5,
      "available_count": 5
    },
    "database": {
      "status": "healthy",
      "connection_pool": {
        "active": 2,
        "idle": 8,
        "max": 10
      }
    },
    "external_services": {
      "anthropic_api": "healthy",
      "arcade_gateway": "healthy"
    }
  },
  "timestamp": "2025-05-23T12:58:29Z"
}
```

#### System Metrics
```http
GET /api/v1/metrics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "performance": {
    "queries_per_minute": 45.2,
    "average_latency_ms": 62,
    "cache_hit_rate": 85.5,
    "error_rate": 0.2
  },
  "cache_metrics": {
    "total_entries": 1250,
    "memory_usage_mb": 128,
    "hit_count": 8550,
    "miss_count": 1450,
    "cost_savings_total": 890.50
  },
  "tool_metrics": {
    "total_executions": 10000,
    "success_rate": 99.5,
    "average_execution_time_ms": 8.5,
    "most_used": [
      {"name": "SQL.QueryReadonly", "count": 8500},
      {"name": "FileSystem.ReadFile", "count": 1200}
    ]
  },
  "timestamp": "2025-05-23T12:58:29Z"
}
```

## 3. Cache Management API

### 3.1 Cache Operations

#### Cache Status
```http
GET /api/v1/cache/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "cache_prefix": "fact_v1",
  "total_entries": 1250,
  "memory_usage": {
    "current_mb": 128,
    "max_mb": 512,
    "utilization_percent": 25
  },
  "performance": {
    "hit_rate": 85.5,
    "average_hit_latency_ms": 12,
    "average_miss_latency_ms": 145
  },
  "cost_savings": {
    "total_saved": 890.50,
    "currency": "USD",
    "savings_percent": 87
  }
}
```

#### Cache Warming
```http
POST /api/v1/cache/warm
Authorization: Bearer {token}
Content-Type: application/json

{
  "queries": [
    "What is the latest quarterly revenue?",
    "Show me the annual financial summary",
    "What are the key performance indicators?"
  ],
  "priority": "high",
  "async": true
}
```

**Response:**
```json
{
  "warming_job_id": "warm_789",
  "status": "initiated",
  "total_queries": 3,
  "estimated_completion_time": "2025-05-23T13:05:29Z",
  "progress_url": "/api/v1/cache/warm/warm_789/status"
}
```

#### Cache Invalidation
```http
DELETE /api/v1/cache/entries
Authorization: Bearer {token}
Content-Type: application/json

{
  "invalidation_type": "selective",
  "criteria": {
    "prefix": "fact_v1",
    "age_days": 7,
    "pattern": "revenue_*"
  },
  "reason": "Data schema updated"
}
```

**Response:**
```json
{
  "invalidation_id": "inv_101",
  "entries_affected": 45,
  "status": "completed",
  "freed_memory_mb": 12.5,
  "timestamp": "2025-05-23T12:58:29Z"
}
```

## 4. Tool Management API

### 4.1 Tool Registry Operations

#### List Available Tools
```http
GET /api/v1/tools
Authorization: Bearer {token}
```

**Response:**
```json
{
  "tools": [
    {
      "name": "SQL.QueryReadonly",
      "description": "Execute SELECT queries on the finance database",
      "version": "1.0.0",
      "status": "active",
      "requires_auth": false,
      "parameters": {
        "statement": {
          "type": "string",
          "required": true,
          "description": "SQL SELECT statement"
        }
      },
      "usage_stats": {
        "total_calls": 8500,
        "success_rate": 99.8,
        "average_execution_time_ms": 8.2
      }
    }
  ],
  "total_count": 5,
  "active_count": 5,
  "timestamp": "2025-05-23T12:58:29Z"
}
```

#### Tool Details
```http
GET /api/v1/tools/{tool_name}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "name": "SQL.QueryReadonly",
  "description": "Execute SELECT queries on the finance database",
  "version": "1.0.0",
  "status": "active",
  "created_at": "2025-05-01T10:00:00Z",
  "last_updated": "2025-05-15T14:30:00Z",
  "configuration": {
    "timeout_seconds": 30,
    "max_result_size_mb": 10,
    "rate_limit_per_minute": 100
  },
  "parameters": {
    "statement": {
      "type": "string",
      "required": true,
      "pattern": "^\\s*SELECT\\s+.*",
      "max_length": 1000,
      "description": "SQL SELECT statement to execute"
    }
  },
  "security": {
    "requires_authorization": false,
    "scopes": [],
    "input_validation": true,
    "output_sanitization": true
  },
  "usage_statistics": {
    "total_calls": 8500,
    "successful_calls": 8485,
    "failed_calls": 15,
    "average_execution_time_ms": 8.2,
    "last_24h_calls": 450
  }
}
```

#### Register Tool
```http
POST /api/v1/tools
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Math.Calculator",
  "description": "Perform basic mathematical calculations",
  "version": "1.0.0",
  "function_code": "base64_encoded_function",
  "parameters": {
    "expression": {
      "type": "string",
      "required": true,
      "description": "Mathematical expression to evaluate"
    }
  },
  "security": {
    "requires_authorization": false,
    "scopes": [],
    "sandbox": true
  },
  "configuration": {
    "timeout_seconds": 5,
    "memory_limit_mb": 64
  }
}
```

**Response:**
```json
{
  "tool_id": "tool_201",
  "name": "Math.Calculator",
  "status": "registered",
  "registration_time": "2025-05-23T12:58:29Z",
  "arcade_tool_id": "arcade_301",
  "validation_results": {
    "syntax_check": "passed",
    "security_scan": "passed",
    "parameter_validation": "passed"
  }
}
```

### 4.2 Tool Execution API

#### Execute Tool
```http
POST /api/v1/tools/{tool_name}/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "arguments": {
    "statement": "SELECT quarter, value FROM revenue WHERE quarter LIKE '2025%'"
  },
  "user_id": "user@example.com",
  "execution_options": {
    "timeout_seconds": 30,
    "priority": "normal",
    "async": false
  }
}
```

**Response:**
```json
{
  "execution_id": "exec_567",
  "tool_name": "SQL.QueryReadonly",
  "status": "completed",
  "result": {
    "rows": [
      {"quarter": "Q1-2025", "value": 1234567.89}
    ],
    "row_count": 1,
    "columns": ["quarter", "value"],
    "execution_time_ms": 8,
    "status": "success"
  },
  "metadata": {
    "user_id": "user@example.com",
    "started_at": "2025-05-23T12:58:29Z",
    "completed_at": "2025-05-23T12:58:29Z",
    "resource_usage": {
      "cpu_time_ms": 5,
      "memory_peak_mb": 2.1
    }
  }
}
```

#### Tool Execution Status
```http
GET /api/v1/tools/executions/{execution_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "execution_id": "exec_567",
  "tool_name": "SQL.QueryReadonly",
  "status": "running",
  "progress": {
    "stage": "executing",
    "completion_percent": 75,
    "estimated_remaining_ms": 2000
  },
  "started_at": "2025-05-23T12:58:29Z",
  "user_id": "user@example.com"
}
```

## 5. Security and Authorization API

### 5.1 Authentication

#### Token Generation
```http
POST /api/v1/auth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "fact_client_123",
  "client_secret": "secret_key",
  "scope": "query tools cache"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "query tools cache",
  "issued_at": "2025-05-23T12:58:29Z"
}
```

#### Token Validation
```http
GET /api/v1/auth/validate
Authorization: Bearer {token}
```

**Response:**
```json
{
  "valid": true,
  "token_info": {
    "client_id": "fact_client_123",
    "scopes": ["query", "tools", "cache"],
    "expires_at": "2025-05-23T13:58:29Z",
    "issued_at": "2025-05-23T12:58:29Z"
  },
  "user_info": {
    "user_id": "user@example.com",
    "permissions": ["read", "execute"]
  }
}
```

### 5.2 OAuth Tool Authorization

#### Initiate Authorization
```http
POST /api/v1/auth/tools/{tool_name}/authorize
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": "user@example.com",
  "scopes": ["read", "write"],
  "callback_url": "https://app.example.com/callback"
}
```

**Response:**
```json
{
  "authorization_flow_id": "flow_789",
  "authorization_url": "https://oauth.arcade.dev/authorize?client_id=...&scope=read+write&state=flow_789",
  "expires_at": "2025-05-23T13:08:29Z",
  "status": "pending"
}
```

#### Complete Authorization
```http
POST /api/v1/auth/tools/callback
Content-Type: application/json

{
  "flow_id": "flow_789",
  "authorization_code": "auth_code_abc123",
  "state": "flow_789"
}
```

**Response:**
```json
{
  "authorization_id": "auth_456",
  "user_id": "user@example.com",
  "tool_name": "GitHub.Repository",
  "scopes": ["read", "write"],
  "status": "active",
  "expires_at": "2025-06-23T12:58:29Z",
  "created_at": "2025-05-23T12:58:29Z"
}
```

## 6. WebSocket Real-time API

### 6.1 Real-time Query Processing

#### WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/api/v1/ws');

// Authentication
ws.send(JSON.stringify({
  type: 'auth',
  token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}));

// Query subscription
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'query_updates',
  user_id: 'user@example.com'
}));
```

#### Real-time Query Updates
```json
{
  "type": "query_progress",
  "query_id": "query_456",
  "status": "tool_execution",
  "progress": {
    "current_step": 2,
    "total_steps": 3,
    "completion_percent": 67,
    "current_operation": "Executing SQL.QueryReadonly"
  },
  "timestamp": "2025-05-23T12:58:29Z"
}
```

#### System Events
```json
{
  "type": "system_event",
  "event": "cache_hit_rate_threshold",
  "data": {
    "current_rate": 75.5,
    "threshold": 80.0,
    "recommendation": "Consider cache warming for common queries"
  },
  "timestamp": "2025-05-23T12:58:29Z"
}
```

## 7. Error Handling

### 7.1 Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "field_name",
      "constraint": "validation_rule",
      "provided_value": "invalid_value"
    },
    "trace_id": "trace_123456",
    "documentation_url": "https://docs.fact-system.com/errors/ERROR_CODE"
  },
  "timestamp": "2025-05-23T12:58:29Z",
  "status": "error"
}
```

### 7.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_QUERY` | 400 | Query format or content is invalid |
| `QUERY_TOO_LONG` | 400 | Query exceeds maximum length |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `TOOL_NOT_FOUND` | 404 | Requested tool does not exist |
| `QUERY_NOT_FOUND` | 404 | Query ID not found |
| `RATE_LIMITED` | 429 | Request rate limit exceeded |
| `TOOL_EXECUTION_FAILED` | 500 | Tool execution encountered an error |
| `CACHE_UNAVAILABLE` | 503 | Cache service temporarily unavailable |
| `EXTERNAL_SERVICE_ERROR` | 503 | External service (Claude, Arcade) unavailable |

### 7.3 Rate Limiting Headers
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1716467909
X-RateLimit-Window: 60
```

## 8. API Versioning and Compatibility

### 8.1 Versioning Strategy
- **URL Versioning**: `/api/v1/`, `/api/v2/`
- **Backward Compatibility**: Maintained for 2 major versions
- **Deprecation Notice**: 6 months advance notice
- **Migration Guide**: Provided for breaking changes

### 8.2 Content Negotiation
```http
Accept: application/json
Accept: application/xml
Accept-Version: v1
Accept-Encoding: gzip, deflate
```

### 8.3 API Documentation
- **OpenAPI 3.0 Specification**: Complete API documentation
- **Interactive Documentation**: Swagger UI available at `/docs`
- **SDK Generation**: Client libraries for Python, JavaScript, Java
- **Postman Collection**: Pre-configured API testing collection

This API specification provides comprehensive coverage of all FACT system interfaces, ensuring consistent communication between components and external clients.