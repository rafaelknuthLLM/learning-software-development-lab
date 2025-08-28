# FACT System - API Reference

## Overview

The FACT system provides both internal APIs for component communication and external APIs for client integration. This reference covers the most commonly used endpoints for developers.

## Base Configuration

```yaml
Base URL: http://localhost:8000/api/v1
Content-Type: application/json
Authentication: Bearer Token
Rate Limit: 100 requests/minute
API Version: v1
```

## Authentication

### Token Generation

Generate an access token for API authentication.

**Endpoint:** `POST /api/v1/auth/token`

**Request:**
```http
POST /api/v1/auth/token
Content-Type: application/json

{
  "grant_type": "client_credentials",
  "client_id": "fact_client_123",
  "client_secret": "your_secret_key",
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

### Token Validation

Validate an existing access token.

**Endpoint:** `GET /api/v1/auth/validate`

**Request:**
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
    "expires_at": "2025-05-23T13:58:29Z"
  }
}
```

## Query Processing

### Process Query

Submit a natural language query for processing.

**Endpoint:** `POST /api/v1/query`

**Request:**
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
  }
}
```

**Response:**
```json
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

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language query to process |
| `user_id` | string | Yes | Unique identifier for the user |
| `context` | object | No | Additional context for query processing |
| `cache_options` | object | No | Cache behavior configuration |

### Query Status

Check the status of a submitted query.

**Endpoint:** `GET /api/v1/query/{query_id}/status`

**Request:**
```http
GET /api/v1/query/query_456/status
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
  "created_at": "2025-05-23T12:58:29Z",
  "completed_at": "2025-05-23T12:58:29Z"
}
```

## System Information

### Health Check

Check system health and component status.

**Endpoint:** `GET /api/v1/health`

**Request:**
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
    }
  },
  "timestamp": "2025-05-23T12:58:29Z"
}
```

### System Metrics

Get detailed system performance metrics.

**Endpoint:** `GET /api/v1/metrics`

**Request:**
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
      {"name": "SQL.QueryReadonly", "count": 8500}
    ]
  },
  "timestamp": "2025-05-23T12:58:29Z"
}
```

## Tool Management

### List Tools

Get available tools and their configurations.

**Endpoint:** `GET /api/v1/tools`

**Request:**
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

### Tool Details

Get detailed information about a specific tool.

**Endpoint:** `GET /api/v1/tools/{tool_name}`

**Request:**
```http
GET /api/v1/tools/SQL.QueryReadonly
Authorization: Bearer {token}
```

**Response:**
```json
{
  "name": "SQL.QueryReadonly",
  "description": "Execute SELECT queries on the finance database",
  "version": "1.0.0",
  "status": "active",
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

### Execute Tool

Execute a specific tool with parameters.

**Endpoint:** `POST /api/v1/tools/{tool_name}/execute`

**Request:**
```http
POST /api/v1/tools/SQL.QueryReadonly/execute
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

## Cache Management

### Cache Status

Get current cache status and performance metrics.

**Endpoint:** `GET /api/v1/cache/status`

**Request:**
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

### Cache Warming

Pre-populate cache with common queries.

**Endpoint:** `POST /api/v1/cache/warm`

**Request:**
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

## Error Handling

### Error Response Format

All API errors follow a consistent format:

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

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_QUERY` | 400 | Query format or content is invalid |
| `QUERY_TOO_LONG` | 400 | Query exceeds maximum length |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `TOOL_NOT_FOUND` | 404 | Requested tool does not exist |
| `RATE_LIMITED` | 429 | Request rate limit exceeded |
| `TOOL_EXECUTION_FAILED` | 500 | Tool execution encountered an error |
| `CACHE_UNAVAILABLE` | 503 | Cache service temporarily unavailable |

### Rate Limiting

API responses include rate limiting headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1716467909
X-RateLimit-Window: 60
```

## SDK Examples

### Python SDK

```python
import asyncio
from fact_sdk import FACTClient

async def main():
    # Initialize client
    client = FACTClient(
        api_key="your_api_key",
        base_url="http://localhost:8000/api/v1"
    )
    
    # Process a query
    result = await client.query(
        "What was TechCorp's Q1 2025 revenue?",
        user_id="analyst@company.com"
    )
    
    print(f"Response: {result.response}")
    print(f"Cache hit: {result.metadata.cache_status == 'hit'}")
    
    # Get system metrics
    metrics = await client.get_metrics()
    print(f"Cache hit rate: {metrics.cache_metrics.hit_rate}%")
    
    # List available tools
    tools = await client.list_tools()
    for tool in tools:
        print(f"Tool: {tool.name} - {tool.description}")
    
    await client.close()

# Run the example
asyncio.run(main())
```

### JavaScript SDK

```javascript
const { FACTClient } = require('fact-sdk');

async function main() {
  // Initialize client
  const client = new FACTClient({
    apiKey: 'your_api_key',
    baseUrl: 'http://localhost:8000/api/v1'
  });

  try {
    // Process a query
    const result = await client.query({
      query: "What was TechCorp's Q1 2025 revenue?",
      userId: 'analyst@company.com'
    });

    console.log('Response:', result.response);
    console.log('Cache hit:', result.metadata.cacheStatus === 'hit');

    // Get system health
    const health = await client.getHealth();
    console.log('System status:', health.status);

  } catch (error) {
    console.error('API Error:', error.message);
  } finally {
    await client.close();
  }
}

main();
```

### cURL Examples

#### Basic Query
```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "query": "What companies are in the technology sector?",
    "user_id": "user@example.com"
  }'
```

#### Get System Metrics
```bash
curl -X GET "http://localhost:8000/api/v1/metrics" \
  -H "Authorization: Bearer your_token"
```

#### Execute Tool
```bash
curl -X POST "http://localhost:8000/api/v1/tools/SQL.QueryReadonly/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "arguments": {
      "statement": "SELECT name FROM companies WHERE sector = '\''Technology'\''"
    },
    "user_id": "user@example.com"
  }'
```

## Webhooks

### Query Completion Webhook

Configure webhooks to receive notifications when queries complete.

**Configuration:**
```json
{
  "webhook_url": "https://your-app.com/webhooks/fact",
  "events": ["query.completed", "query.failed"],
  "secret": "your_webhook_secret"
}
```

**Webhook Payload:**
```json
{
  "event": "query.completed",
  "query_id": "query_456",
  "user_id": "user@example.com",
  "result": {
    "response": "Query result here",
    "metadata": {
      "latency_ms": 45,
      "cache_status": "hit"
    }
  },
  "timestamp": "2025-05-23T12:58:29Z"
}
```

## Best Practices

### API Usage

1. **Authentication**: Always use Bearer tokens for authentication
2. **Rate Limiting**: Respect rate limits and implement exponential backoff
3. **Error Handling**: Check status codes and parse error responses
4. **Timeouts**: Set appropriate timeouts for long-running queries
5. **Caching**: Leverage cache warming for frequently used queries

### Performance Optimization

1. **Batch Queries**: Group related queries to improve cache efficiency
2. **Query Optimization**: Use specific, focused queries for better performance
3. **Connection Management**: Reuse connections and implement connection pooling
4. **Monitoring**: Track API usage and performance metrics

### Security

1. **Token Management**: Rotate API tokens regularly
2. **Input Validation**: Validate all inputs before sending to API
3. **Secure Storage**: Store API keys securely, never in code
4. **HTTPS**: Always use HTTPS in production environments

## Next Steps

- **Advanced Usage**: Explore [Advanced Usage Guide](7_advanced_usage.md)
- **Tool Development**: Learn [Tool Creation](docs/tool-execution-framework.md)
- **Performance**: Check [Performance Optimization](docs/performance-optimization.md)
- **Security**: Review [Security Guidelines](docs/security-guidelines.md)

---

**Need help?** Check the [Troubleshooting Guide](8_troubleshooting_guide.md) for common issues and solutions.