# FACT Memory MCP API Specification

## Overview

The FACT Memory System provides full compatibility with the Mem0 MCP (Model Context Protocol) API while offering enhanced capabilities through its prompt cache-based architecture.

## MCP Server Configuration

### Server Initialization

```python
# Python MCP Server
from fact_memory.mcp import FactMemoryMCPServer

server = FactMemoryMCPServer(
    host="0.0.0.0",
    port=8080,
    memory_config=memory_config
)

# Start server
server.start()
```

```javascript
// Node.js MCP Server
const { FactMemoryMCPServer } = require('@fact/memory-mcp');

const server = new FactMemoryMCPServer({
    host: '0.0.0.0',
    port: 8080,
    memoryConfig: memoryConfig
});

server.start();
```

### Environment Configuration

```bash
# Required environment variables
FACT_MEMORY_API_KEY=your_api_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional configuration
FACT_MEMORY_HOST=0.0.0.0
FACT_MEMORY_PORT=8080
FACT_MEMORY_MAX_MEMORIES_PER_USER=1000
FACT_MEMORY_CACHE_TTL_SECONDS=3600
```

## MCP Tools

### 1. add-memory

Stores a new memory for a specific user.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "string",
      "description": "The memory content to store",
      "minLength": 1,
      "maxLength": 10240
    },
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user",
      "pattern": "^[a-zA-Z0-9_-]+$",
      "minLength": 1,
      "maxLength": 64
    },
    "memoryType": {
      "type": "string",
      "enum": ["preference", "fact", "context", "behavior", "instruction"],
      "description": "Type of memory being stored",
      "default": "fact"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "maxLength": 32
      },
      "maxItems": 10,
      "description": "Optional tags for memory categorization"
    },
    "metadata": {
      "type": "object",
      "description": "Optional metadata for the memory",
      "additionalProperties": true
    }
  },
  "required": ["content", "userId"],
  "additionalProperties": false
}
```

#### Usage Example

```typescript
const result = await server.tool("add-memory", {
  content: "User prefers dark mode interface with high contrast",
  userId: "alice",
  memoryType: "preference",
  tags: ["ui", "accessibility"],
  metadata: {
    "source": "settings_page",
    "confidence": 0.95
  }
});
```

#### Response Schema

```json
{
  "content": [
    {
      "type": "text",
      "text": "Memory added successfully. ID: mem_abc123xyz"
    }
  ],
  "metadata": {
    "memoryId": "mem_abc123xyz",
    "userId": "alice",
    "memoryType": "preference",
    "tokenCount": 45,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 2. search-memories

Searches for relevant memories based on a query.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query for finding relevant memories",
      "minLength": 1,
      "maxLength": 512
    },
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user",
      "pattern": "^[a-zA-Z0-9_-]+$"
    },
    "memoryType": {
      "type": "string",
      "enum": ["preference", "fact", "context", "behavior", "instruction"],
      "description": "Filter by memory type"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 50,
      "default": 10,
      "description": "Maximum number of memories to return"
    },
    "minRelevance": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "default": 0.1,
      "description": "Minimum relevance score for results"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Filter by specific tags"
    }
  },
  "required": ["query", "userId"],
  "additionalProperties": false
}
```

#### Usage Example

```typescript
const results = await server.tool("search-memories", {
  query: "What are the user's interface preferences?",
  userId: "alice",
  memoryType: "preference",
  limit: 5,
  minRelevance: 0.3
});
```

#### Response Schema

```json
{
  "content": [
    {
      "type": "text",
      "text": "Memory: User prefers dark mode interface with high contrast\nRelevance: 0.95\nType: preference\nTags: ui, accessibility\nCreated: 2024-01-15T10:30:00Z\n---\nMemory: User uses large font sizes for better readability\nRelevance: 0.78\nType: preference\nTags: accessibility, fonts\nCreated: 2024-01-14T15:20:00Z\n---"
    }
  ],
  "metadata": {
    "totalResults": 2,
    "searchTime": "45ms",
    "cacheHit": true,
    "query": "What are the user's interface preferences?",
    "userId": "alice"
  }
}
```

### 3. get-memories

Retrieves all memories for a specific user.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user",
      "pattern": "^[a-zA-Z0-9_-]+$"
    },
    "memoryType": {
      "type": "string",
      "enum": ["preference", "fact", "context", "behavior", "instruction"],
      "description": "Filter by memory type"
    },
    "limit": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100,
      "default": 20,
      "description": "Maximum number of memories to return"
    },
    "offset": {
      "type": "integer",
      "minimum": 0,
      "default": 0,
      "description": "Number of memories to skip for pagination"
    },
    "sortBy": {
      "type": "string",
      "enum": ["created", "accessed", "relevance"],
      "default": "created",
      "description": "Sort order for results"
    },
    "sortOrder": {
      "type": "string",
      "enum": ["asc", "desc"],
      "default": "desc",
      "description": "Sort direction"
    }
  },
  "required": ["userId"],
  "additionalProperties": false
}
```

#### Usage Example

```typescript
const memories = await server.tool("get-memories", {
  userId: "alice",
  memoryType: "preference",
  limit: 10,
  sortBy: "accessed"
});
```

### 4. delete-memory

Deletes a specific memory.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "memoryId": {
      "type": "string",
      "description": "Unique identifier for the memory to delete",
      "pattern": "^mem_[a-zA-Z0-9]+$"
    },
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user (for authorization)",
      "pattern": "^[a-zA-Z0-9_-]+$"
    }
  },
  "required": ["memoryId", "userId"],
  "additionalProperties": false
}
```

#### Usage Example

```typescript
const result = await server.tool("delete-memory", {
  memoryId: "mem_abc123xyz",
  userId: "alice"
});
```

### 5. update-memory

Updates an existing memory (FACT Memory enhancement).

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "memoryId": {
      "type": "string",
      "description": "Unique identifier for the memory to update",
      "pattern": "^mem_[a-zA-Z0-9]+$"
    },
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user",
      "pattern": "^[a-zA-Z0-9_-]+$"
    },
    "content": {
      "type": "string",
      "description": "Updated memory content",
      "minLength": 1,
      "maxLength": 10240
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Updated tags"
    },
    "metadata": {
      "type": "object",
      "description": "Updated metadata"
    }
  },
  "required": ["memoryId", "userId"],
  "additionalProperties": false
}
```

### 6. get-memory-stats

Retrieves memory statistics for a user (FACT Memory enhancement).

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user",
      "pattern": "^[a-zA-Z0-9_-]+$"
    }
  },
  "required": ["userId"],
  "additionalProperties": false
}
```

#### Response Example

```json
{
  "content": [
    {
      "type": "text",
      "text": "Memory Statistics for user: alice\nTotal memories: 45\nMemory types:\n- Preferences: 12\n- Facts: 18\n- Context: 8\n- Behavior: 5\n- Instructions: 2\nTotal storage: 125.4 KB\nCache hit rate: 94.2%\nAverage access time: 28ms"
    }
  ],
  "metadata": {
    "userId": "alice",
    "totalMemories": 45,
    "memoryByType": {
      "preference": 12,
      "fact": 18,
      "context": 8,
      "behavior": 5,
      "instruction": 2
    },
    "totalSizeBytes": 128409,
    "cacheHitRate": 0.942,
    "avgAccessTimeMs": 28
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "MEMORY_NOT_FOUND",
    "message": "Memory with ID mem_abc123xyz not found for user alice",
    "details": {
      "memoryId": "mem_abc123xyz",
      "userId": "alice",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_REQUEST` | Request validation failed | 400 |
| `UNAUTHORIZED` | Invalid or missing API key | 401 |
| `FORBIDDEN` | User not authorized for operation | 403 |
| `MEMORY_NOT_FOUND` | Requested memory does not exist | 404 |
| `USER_QUOTA_EXCEEDED` | User memory limit exceeded | 409 |
| `CONTENT_TOO_LARGE` | Memory content exceeds size limit | 413 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Internal server error | 500 |
| `SERVICE_UNAVAILABLE` | Memory service temporarily unavailable | 503 |

## Performance Guarantees

### Response Time Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| add-memory | < 50ms | 25ms |
| search-memories (cached) | < 30ms | 18ms |
| search-memories (uncached) | < 100ms | 65ms |
| get-memories | < 40ms | 22ms |
| delete-memory | < 20ms | 12ms |
| update-memory | < 45ms | 28ms |

### Throughput Targets

- **Concurrent Users**: 1000+ simultaneous users
- **Requests per Second**: 10,000+ RPS per server instance
- **Memory Operations**: 50,000+ operations per minute
- **Search Queries**: 25,000+ searches per minute

## Migration from Mem0

### API Compatibility

The FACT Memory System is designed to be a drop-in replacement for Mem0's MCP server. Existing client code should work without modification for the core operations:

```typescript
// This code works with both Mem0 and FACT Memory
await server.tool("add-memory", {
  content: "User prefers dark mode",
  userId: "alice"
});

const results = await server.tool("search-memories", {
  query: "user interface preferences",
  userId: "alice"
});
```

### Enhanced Features

FACT Memory provides additional capabilities beyond Mem0:

1. **Memory Types**: Structured memory categorization
2. **Tags and Metadata**: Rich memory annotation
3. **Performance Stats**: Detailed performance metrics
4. **Cache Optimization**: Superior performance through prompt caching
5. **Advanced Search**: Enhanced relevance scoring and filtering

### Configuration Migration

```bash
# Mem0 configuration
MEM0_API_KEY=your_key_here

# FACT Memory configuration (backward compatible)
FACT_MEMORY_API_KEY=your_key_here  # Or use MEM0_API_KEY
ANTHROPIC_API_KEY=your_anthropic_key_here
```

## Security Considerations

### Authentication

```typescript
// API Key authentication (header-based)
const headers = {
  'Authorization': `Bearer ${FACT_MEMORY_API_KEY}`,
  'Content-Type': 'application/json'
};
```

### Data Privacy

1. **User Isolation**: Strict separation of user data
2. **Content Validation**: Input sanitization and validation
3. **Access Logging**: Comprehensive audit trails
4. **Data Retention**: Configurable memory expiration
5. **Encryption**: Optional content encryption at rest

### Rate Limiting

```typescript
// Rate limit headers in responses
{
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "999",
  "X-RateLimit-Reset": "1640995200"
}
```

## Monitoring and Observability

### Health Check Endpoint

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "72h15m32s",
  "memory": {
    "cacheHitRate": 0.94,
    "avgResponseTime": "28ms",
    "activeUsers": 1247,
    "totalMemories": 156789
  }
}
```

### Metrics Endpoint

```bash
GET /metrics
```

Returns Prometheus-compatible metrics for monitoring integration.

This MCP API specification ensures full compatibility with existing Mem0 clients while providing enhanced capabilities and superior performance through the FACT SDK's prompt caching infrastructure.