# FACT Memory System - MCP Integration Patterns

## Overview

This document outlines proven integration patterns for developing MCP servers within the FACT Memory System, based on validation of the Hello World implementation.

## Validated Architecture Patterns

### 1. Server Structure Pattern

```python
from fastmcp import FastMCP, Context
from typing import Dict, Any, Optional

# Initialize FastMCP with clear configuration
mcp = FastMCP(
    name="FACT [Component] Server",
    instructions="""
    Clear description of server capabilities and usage patterns.
    
    Available tools:
    - tool1(): Description
    - tool2(param): Description with parameters
    
    Available resources:
    - resource1: Resource description
    """
)

# Tool implementation pattern
@mcp.tool()
async def tool_name(
    param: str,
    ctx: Context = None
) -> Dict[str, Any]:
    """
    Comprehensive docstring describing tool functionality.
    
    Args:
        param: Parameter description with validation requirements
        ctx: FastMCP context for logging and resource access
    
    Returns:
        Structured dictionary with consistent response format
    """
    if ctx:
        await ctx.info(f"Executing {tool_name.__name__} with param: {param}")
    
    # Input validation
    if not param or not param.strip():
        if ctx:
            await ctx.error("Invalid parameter provided")
        return {
            "error": "Parameter validation failed",
            "status": "error"
        }
    
    # Processing logic
    result = {
        "data": "processed_result",
        "timestamp": datetime.now().isoformat(),
        "server": mcp.name,
        "status": "success"
    }
    
    if ctx:
        await ctx.info(f"Tool {tool_name.__name__} completed successfully")
    
    return result

# Resource implementation pattern
@mcp.resource("fact://component/resource_name")
async def get_resource_info() -> Dict[str, Any]:
    """
    Resource providing component metadata and capabilities.
    
    Returns:
        Comprehensive metadata dictionary
    """
    return {
        "name": "Component Name",
        "version": "1.0.0",
        "capabilities": {
            "tools": [...],
            "resources": [...]
        },
        "status": {
            "running": True,
            "health": "healthy"
        },
        "integration": {
            "fact_memory_compatible": True,
            "mcp_version": "2024-11-05"
        }
    }
```

### 2. Server Class Pattern

```python
class FACTComponentMCPServer:
    """
    Component MCP Server class for lifecycle management.
    """
    
    def __init__(
        self,
        name: str = "FACT Component Server",
        debug: bool = False,
        config: Optional[Dict] = None
    ):
        self.name = name
        self.debug = debug
        self.config = config or {}
        self.mcp = mcp
        self._setup_logging()
        self._initialize_component()
    
    def _setup_logging(self):
        """Configure structured logging."""
        level = logging.DEBUG if self.debug else logging.INFO
        logging.getLogger().setLevel(level)
    
    def _initialize_component(self):
        """Initialize component-specific resources."""
        # Initialize FACT cache connection
        # Setup authentication
        # Configure resource access
        pass
    
    def run_stdio(self):
        """Standard MCP STDIO transport."""
        logger.info(f"Starting {self.name} with STDIO transport")
        try:
            self.mcp.run()
        except Exception as e:
            logger.error(f"STDIO server failed: {e}")
            raise
    
    def start_http(self, host: str = "localhost", port: int = 8080):
        """Development HTTP transport."""
        logger.info(f"Starting {self.name} on {host}:{port}")
        try:
            self.mcp.run(
                transport="streamable-http",
                host=host,
                port=port
            )
        except Exception as e:
            logger.error(f"HTTP server failed: {e}")
            raise
    
    async def test_tools(self):
        """Self-testing for development."""
        # Implement comprehensive tool testing
        pass
```

## FACT Memory Integration Points

### 1. User Context Integration

```python
@mcp.tool()
async def memory_store(
    content: str,
    user_id: str,
    ctx: Context = None
) -> Dict[str, Any]:
    """Store user memory with proper scoping."""
    
    # Validate user context
    if not user_id or not is_valid_user(user_id):
        return {"error": "Invalid user context", "status": "error"}
    
    # Use FACT cache with user scoping
    cache_key = f"user:{user_id}:memory:{generate_id()}"
    
    memory_entry = {
        "content": content,
        "user_id": user_id,
        "timestamp": datetime.now().isoformat(),
        "metadata": extract_metadata(content)
    }
    
    # Store in FACT cache
    await fact_cache.set(cache_key, memory_entry)
    
    return {
        "memory_id": cache_key,
        "status": "stored",
        "user_id": user_id
    }
```

### 2. Cache Integration Pattern

```python
from src.cache.manager import CacheManager

class FACTMemoryMCPServer:
    def __init__(self):
        # Initialize FACT cache integration
        self.cache_manager = CacheManager()
        self.cache_manager.configure_redis_connection()
    
    async def _store_memory(self, user_id: str, content: str) -> str:
        """Store memory using FACT cache system."""
        cache_key = f"memory:{user_id}:{uuid4()}"
        
        memory_data = {
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "vector": await self._generate_embedding(content)
        }
        
        await self.cache_manager.set(
            cache_key,
            memory_data,
            ttl=86400  # 24 hours
        )
        
        return cache_key
    
    async def _search_memories(self, user_id: str, query: str) -> List[Dict]:
        """Search user memories using semantic similarity."""
        query_vector = await self._generate_embedding(query)
        
        # Use FACT cache for vector search
        pattern = f"memory:{user_id}:*"
        memories = await self.cache_manager.scan(pattern)
        
        # Implement semantic similarity search
        similar_memories = []
        for memory_key, memory_data in memories:
            similarity = cosine_similarity(query_vector, memory_data["vector"])
            if similarity > 0.7:  # Similarity threshold
                similar_memories.append({
                    "memory_id": memory_key,
                    "content": memory_data["content"],
                    "similarity": similarity,
                    "timestamp": memory_data["timestamp"]
                })
        
        return sorted(similar_memories, key=lambda x: x["similarity"], reverse=True)
```

### 3. Security Integration Pattern

```python
@mcp.tool()
async def secure_operation(
    data: str,
    user_token: str,
    ctx: Context = None
) -> Dict[str, Any]:
    """Secure operation with authentication."""
    
    # Validate authentication token
    user_context = await authenticate_user(user_token)
    if not user_context:
        return {
            "error": "Authentication failed",
            "status": "unauthorized"
        }
    
    # Validate authorization
    if not authorize_operation(user_context, "secure_operation"):
        return {
            "error": "Insufficient permissions",
            "status": "forbidden"
        }
    
    # Sanitize inputs
    clean_data = sanitize_input(data)
    
    # Audit logging
    await audit_log(
        user_id=user_context["user_id"],
        operation="secure_operation",
        data_hash=hash(clean_data),
        timestamp=datetime.now().isoformat()
    )
    
    # Process with user context
    result = await process_secure_data(clean_data, user_context)
    
    return {
        "result": result,
        "user_id": user_context["user_id"],
        "status": "success"
    }
```

## Error Handling Patterns

### 1. Structured Error Responses

```python
def create_error_response(
    error_type: str,
    message: str,
    details: Optional[Dict] = None
) -> Dict[str, Any]:
    """Create standardized error response."""
    return {
        "error": {
            "type": error_type,
            "message": message,
            "details": details or {},
            "timestamp": datetime.now().isoformat()
        },
        "status": "error"
    }

# Usage examples:
return create_error_response(
    "validation_error",
    "Invalid input parameter",
    {"parameter": "name", "value": "", "requirement": "non-empty"}
)

return create_error_response(
    "authentication_error",
    "Invalid user token",
    {"token_expired": True}
)
```

### 2. Exception Handling Pattern

```python
@mcp.tool()
async def robust_tool(param: str, ctx: Context = None) -> Dict[str, Any]:
    """Tool with comprehensive error handling."""
    
    try:
        # Input validation
        if not param:
            raise ValueError("Parameter cannot be empty")
        
        # Processing
        result = await process_data(param)
        
        return {
            "result": result,
            "status": "success"
        }
        
    except ValueError as e:
        if ctx:
            await ctx.error(f"Validation error: {e}")
        return create_error_response("validation_error", str(e))
        
    except AuthenticationError as e:
        if ctx:
            await ctx.error(f"Authentication error: {e}")
        return create_error_response("authentication_error", str(e))
        
    except Exception as e:
        if ctx:
            await ctx.error(f"Unexpected error: {e}")
        return create_error_response(
            "internal_error",
            "An unexpected error occurred",
            {"error_id": str(uuid4())}
        )
```

## Testing Patterns

### 1. Comprehensive Test Suite

```python
class TestFACTMCPServer:
    """Test suite for FACT MCP server components."""
    
    async def test_tool_functionality(self):
        """Test tool direct functionality."""
        result = await tool_function("test_input")
        assert result["status"] == "success"
        assert "result" in result
    
    async def test_error_handling(self):
        """Test error conditions."""
        error_result = await tool_function("")
        assert error_result["status"] == "error"
        assert "error" in error_result
    
    async def test_mcp_integration(self):
        """Test MCP protocol integration."""
        async with Client(mcp) as client:
            response = await client.call_tool("tool_name", {"param": "value"})
            assert response is not None
    
    async def test_performance(self):
        """Test performance characteristics."""
        start_time = time.time()
        tasks = [tool_function(f"input_{i}") for i in range(100)]
        results = await asyncio.gather(*tasks)
        duration = time.time() - start_time
        
        assert len(results) == 100
        assert duration < 1.0  # Should complete in under 1 second
        assert all(r["status"] == "success" for r in results)
```

### 2. Integration Testing Pattern

```python
async def test_fact_integration():
    """Test integration with FACT Memory System."""
    
    # Test cache integration
    cache_manager = CacheManager()
    await cache_manager.set("test_key", {"data": "test"})
    result = await cache_manager.get("test_key")
    assert result["data"] == "test"
    
    # Test user scoping
    user_id = "test_user"
    memory_id = await store_user_memory(user_id, "test memory")
    retrieved = await get_user_memory(user_id, memory_id)
    assert retrieved["content"] == "test memory"
    
    # Test search functionality
    search_results = await search_user_memories(user_id, "test")
    assert len(search_results) > 0
    assert search_results[0]["memory_id"] == memory_id
```

## Deployment Patterns

### 1. Docker Configuration

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy source code
COPY . .

# Configure environment
ENV PYTHONPATH=/app
ENV FACT_CACHE_URL=redis://redis:6379
ENV FACT_LOG_LEVEL=INFO

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Run server
CMD ["python", "server.py", "--mode", "stdio"]
```

### 2. MCP Client Configuration

```json
{
  "mcpServers": {
    "fact-memory": {
      "command": "python",
      "args": ["/app/fact_memory_server.py"],
      "env": {
        "FACT_CACHE_URL": "redis://localhost:6379",
        "FACT_USER_AUTH": "enabled",
        "FACT_LOG_LEVEL": "INFO"
      }
    },
    "fact-search": {
      "command": "python", 
      "args": ["/app/fact_search_server.py"],
      "env": {
        "FACT_EMBEDDING_MODEL": "sentence-transformers/all-MiniLM-L6-v2",
        "FACT_SEARCH_INDEX": "fact_memories"
      }
    }
  }
}
```

### 3. Production Configuration

```python
class ProductionFACTServer(FACTMemoryMCPServer):
    """Production-ready FACT MCP server."""
    
    def __init__(self):
        super().__init__()
        self._setup_monitoring()
        self._setup_rate_limiting()
        self._setup_health_checks()
    
    def _setup_monitoring(self):
        """Configure production monitoring."""
        # Metrics collection
        # Performance monitoring
        # Error tracking
        pass
    
    def _setup_rate_limiting(self):
        """Configure rate limiting."""
        # Per-user rate limits
        # Global rate limits
        # Burst handling
        pass
    
    def _setup_health_checks(self):
        """Configure health monitoring."""
        # Database connectivity
        # Cache availability
        # Service dependencies
        pass
```

## Best Practices Summary

### 1. Code Quality
- ✅ Use comprehensive type hints
- ✅ Implement structured error handling
- ✅ Follow async/await patterns consistently
- ✅ Document all tools and resources thoroughly
- ✅ Validate all inputs and sanitize outputs

### 2. Security
- ✅ Implement user authentication and authorization
- ✅ Use structured logging without sensitive data
- ✅ Sanitize all user inputs
- ✅ Implement proper error messages
- ✅ Use secure communication patterns

### 3. Performance
- ✅ Design for concurrent operations
- ✅ Implement efficient caching strategies
- ✅ Use connection pooling for databases
- ✅ Monitor and optimize critical paths
- ✅ Implement graceful degradation

### 4. Integration
- ✅ Follow FACT Memory System patterns
- ✅ Use standardized cache interfaces
- ✅ Implement consistent user scoping
- ✅ Support multiple transport modes
- ✅ Enable comprehensive testing

This pattern library provides a foundation for developing robust, secure, and high-performance MCP servers within the FACT Memory System ecosystem.