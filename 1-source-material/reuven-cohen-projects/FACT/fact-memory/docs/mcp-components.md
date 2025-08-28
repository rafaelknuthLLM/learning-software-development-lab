# FACT Memory MCP Components

## Overview

This document outlines the Model Context Protocol (MCP) integration for the FACT Memory System, incorporating best practices from FastMCP framework and modern cookiecutter template patterns for robust MCP server development.

## MCP Architecture

### FastMCP Integration

Based on research of the FastMCP framework, our FACT Memory system will leverage the modern, Pythonic approach to MCP server development:

```python
from fastmcp import FastMCP

# Core server instance
mcp = FastMCP(
    name="FACT Memory Server",
    instructions="""
    This server provides intelligent memory management capabilities.
    Use add_memory() to store new memories with automatic categorization.
    Use search_memories() to find relevant memories with semantic ranking.
    Use get_memory() to retrieve specific memories by ID.
    """
)
```

### Server Structure

```
src/memory/mcp/
├── __init__.py
├── server.py              # Main FastMCP server implementation
├── tools.py               # MCP tool definitions
├── handlers.py            # Request handlers and business logic
├── responses.py           # Response formatting and validation
├── context.py             # Context management for tool interactions
├── validation.py          # Input validation and sanitization
└── templates/             # Cookiecutter templates for extensions
    ├── cookiecutter.json  # Template configuration
    ├── {{cookiecutter.tool_name}}/
    │   ├── tool.py        # Tool implementation template
    │   └── tests.py       # Test template
    └── hooks/
        ├── pre_gen_project.py
        └── post_gen_project.py
```

## MCP Tools Implementation

### Core Memory Tools

Based on FastMCP best practices, each tool follows a consistent pattern:

```python
from fastmcp import FastMCP, Context
from typing import Dict, List, Optional, Any
import asyncio

mcp = FastMCP("FACT Memory Server")

@mcp.tool()
async def add_memory(
    content: str,
    user_id: str,
    memory_type: str = "general",
    tags: Optional[List[str]] = None,
    ctx: Context = None
) -> Dict[str, Any]:
    """
    Add a new memory to the user's memory store.
    
    Args:
        content: The memory content to store
        user_id: User identifier
        memory_type: Type of memory (general, conversation, fact, preference)
        tags: Optional tags for categorization
        ctx: FastMCP context for logging and resource access
    
    Returns:
        Dictionary with memory_id and confirmation
    """
    await ctx.info(f"Adding memory for user {user_id}")
    
    # Implementation with FACT cache integration
    memory_manager = await ctx.get_resource("memory://manager")
    result = await memory_manager.add_memory(
        content=content,
        user_id=user_id,
        memory_type=memory_type,
        tags=tags or []
    )
    
    await ctx.info(f"Memory added successfully: {result['memory_id']}")
    return result

@mcp.tool()
async def search_memories(
    query: str,
    user_id: str,
    memory_type: Optional[str] = None,
    limit: int = 10,
    ctx: Context = None
) -> List[Dict[str, Any]]:
    """
    Search through user's memories using semantic similarity.
    
    Args:
        query: Search query
        user_id: User identifier
        memory_type: Optional filter by memory type
        limit: Maximum number of results
        ctx: FastMCP context
    
    Returns:
        List of relevant memories with relevance scores
    """
    await ctx.info(f"Searching memories for user {user_id}: '{query}'")
    
    search_engine = await ctx.get_resource("memory://search")
    results = await search_engine.search(
        query=query,
        user_id=user_id,
        memory_type=memory_type,
        limit=limit
    )
    
    await ctx.info(f"Found {len(results)} relevant memories")
    return results

@mcp.tool()
async def get_memory(
    memory_id: str,
    user_id: str,
    ctx: Context = None
) -> Dict[str, Any]:
    """
    Retrieve a specific memory by ID.
    
    Args:
        memory_id: Unique memory identifier
        user_id: User identifier for security validation
        ctx: FastMCP context
    
    Returns:
        Memory details or error if not found/unauthorized
    """
    await ctx.info(f"Retrieving memory {memory_id} for user {user_id}")
    
    memory_manager = await ctx.get_resource("memory://manager")
    memory = await memory_manager.get_memory(memory_id, user_id)
    
    if not memory:
        await ctx.error(f"Memory {memory_id} not found or unauthorized")
        raise ValueError(f"Memory {memory_id} not found")
    
    return memory

@mcp.tool()
async def update_memory(
    memory_id: str,
    user_id: str,
    content: Optional[str] = None,
    tags: Optional[List[str]] = None,
    ctx: Context = None
) -> Dict[str, Any]:
    """
    Update an existing memory.
    
    Args:
        memory_id: Memory to update
        user_id: User identifier
        content: New content (optional)
        tags: New tags (optional)
        ctx: FastMCP context
    
    Returns:
        Updated memory details
    """
    await ctx.info(f"Updating memory {memory_id} for user {user_id}")
    
    memory_manager = await ctx.get_resource("memory://manager")
    result = await memory_manager.update_memory(
        memory_id=memory_id,
        user_id=user_id,
        content=content,
        tags=tags
    )
    
    await ctx.info(f"Memory {memory_id} updated successfully")
    return result

@mcp.tool()
async def delete_memory(
    memory_id: str,
    user_id: str,
    ctx: Context = None
) -> Dict[str, bool]:
    """
    Delete a memory.
    
    Args:
        memory_id: Memory to delete
        user_id: User identifier
        ctx: FastMCP context
    
    Returns:
        Deletion confirmation
    """
    await ctx.info(f"Deleting memory {memory_id} for user {user_id}")
    
    memory_manager = await ctx.get_resource("memory://manager")
    success = await memory_manager.delete_memory(memory_id, user_id)
    
    if success:
        await ctx.info(f"Memory {memory_id} deleted successfully")
    else:
        await ctx.error(f"Failed to delete memory {memory_id}")
    
    return {"deleted": success}

@mcp.tool()
async def get_memory_stats(
    user_id: str,
    ctx: Context = None
) -> Dict[str, Any]:
    """
    Get user's memory statistics.
    
    Args:
        user_id: User identifier
        ctx: FastMCP context
    
    Returns:
        Memory usage statistics
    """
    await ctx.info(f"Retrieving memory stats for user {user_id}")
    
    memory_manager = await ctx.get_resource("memory://manager")
    stats = await memory_manager.get_user_stats(user_id)
    
    return stats
```

### Advanced Tools

```python
@mcp.tool()
async def categorize_memories(
    user_id: str,
    memory_type: Optional[str] = None,
    ctx: Context = None
) -> Dict[str, List[str]]:
    """
    Automatically categorize memories using LLM analysis.
    
    Args:
        user_id: User identifier
        memory_type: Optional filter by memory type
        ctx: FastMCP context
    
    Returns:
        Categorized memory groups
    """
    await ctx.info(f"Categorizing memories for user {user_id}")
    
    # Use context to request LLM analysis
    memories = await search_memories("", user_id, memory_type, limit=100, ctx=ctx)
    
    categorization_prompt = f"""
    Analyze and categorize the following memories:
    {[m['content'] for m in memories]}
    
    Group them into logical categories and return as JSON.
    """
    
    analysis = await ctx.sample(categorization_prompt)
    categories = analysis.json()
    
    await ctx.info(f"Categorized {len(memories)} memories into {len(categories)} groups")
    return categories

@mcp.tool()
async def summarize_memories(
    user_id: str,
    memory_type: Optional[str] = None,
    time_range: Optional[str] = None,
    ctx: Context = None
) -> Dict[str, str]:
    """
    Generate a summary of user's memories.
    
    Args:
        user_id: User identifier
        memory_type: Optional filter by memory type
        time_range: Optional time range filter
        ctx: FastMCP context
    
    Returns:
        Memory summary and insights
    """
    await ctx.info(f"Generating memory summary for user {user_id}")
    
    memory_manager = await ctx.get_resource("memory://manager")
    memories = await memory_manager.get_memories_by_criteria(
        user_id=user_id,
        memory_type=memory_type,
        time_range=time_range
    )
    
    summary_prompt = f"""
    Create a comprehensive summary of these memories:
    {[m['content'] for m in memories]}
    
    Include:
    - Key themes and patterns
    - Important facts and preferences
    - Behavioral insights
    - Recommendations for future interactions
    """
    
    summary = await ctx.sample(summary_prompt)
    
    return {
        "summary": summary.text,
        "memory_count": len(memories),
        "time_range": time_range or "all time"
    }
```

## MCP Resources

FastMCP resources provide access to underlying system components:

```python
@mcp.resource("memory://manager")
async def get_memory_manager():
    """Provide access to the core memory manager."""
    from ..manager import MemoryManager
    return MemoryManager()

@mcp.resource("memory://search")
async def get_search_engine():
    """Provide access to the search engine."""
    from ..search import SearchEngine
    return SearchEngine()

@mcp.resource("memory://cache")
async def get_cache_manager():
    """Provide access to the FACT cache system."""
    from ...cache.manager import CacheManager
    return CacheManager()

@mcp.resource("memory://stats/{user_id}")
async def get_user_statistics(user_id: str):
    """Provide real-time user statistics."""
    memory_manager = await get_memory_manager()
    return await memory_manager.get_user_stats(user_id)
```

## Server Configuration

### FastMCP Server Setup

```python
# src/memory/mcp/server.py
from fastmcp import FastMCP
from typing import Optional
import asyncio

# Import all tools and resources
from .tools import *
from .handlers import *

class FACTMemoryMCPServer:
    def __init__(
        self,
        name: str = "FACT Memory Server",
        host: str = "localhost",
        port: int = 8080
    ):
        self.mcp = FastMCP(
            name=name,
            instructions=self._get_instructions()
        )
        self.host = host
        self.port = port
        self._setup_server()
    
    def _get_instructions(self) -> str:
        return """
        FACT Memory Server provides intelligent memory management capabilities:
        
        Core Operations:
        - add_memory(): Store new memories with automatic categorization
        - search_memories(): Find relevant memories using semantic search
        - get_memory(): Retrieve specific memories by ID
        - update_memory(): Modify existing memories
        - delete_memory(): Remove memories
        
        Advanced Features:
        - get_memory_stats(): View usage statistics
        - categorize_memories(): Auto-categorize memories
        - summarize_memories(): Generate memory summaries
        
        All operations are user-scoped and secure.
        """
    
    def _setup_server(self):
        """Configure server with error handling and middleware."""
        
        @self.mcp.middleware
        async def auth_middleware(request, call_next):
            """Validate API keys and user permissions."""
            # Implementation depends on FACT auth system
            return await call_next(request)
        
        @self.mcp.middleware
        async def rate_limit_middleware(request, call_next):
            """Apply rate limiting."""
            # Implementation with FACT cache
            return await call_next(request)
    
    async def start(self):
        """Start the MCP server."""
        await self.mcp.run(
            transport="streamable-http",
            host=self.host,
            port=self.port
        )
    
    def run_stdio(self):
        """Run server with STDIO transport for CLI integration."""
        self.mcp.run()  # Default STDIO transport

# Main entry point
if __name__ == "__main__":
    server = FACTMemoryMCPServer()
    server.run_stdio()
```

### Development and Testing

Following FastMCP testing patterns:

```python
# tests/test_mcp_server.py
import pytest
from fastmcp import Client
from src.memory.mcp.server import FACTMemoryMCPServer

@pytest.fixture
async def mcp_server():
    """Create test server instance."""
    server = FACTMemoryMCPServer(name="TestServer")
    return server.mcp

async def test_add_memory(mcp_server):
    """Test memory addition functionality."""
    async with Client(mcp_server) as client:
        result = await client.call_tool("add_memory", {
            "content": "Test memory content",
            "user_id": "test_user",
            "memory_type": "test",
            "tags": ["test", "example"]
        })
        
        assert result[0].text
        memory_data = result[0].json()
        assert "memory_id" in memory_data
        assert memory_data["success"] == True

async def test_search_memories(mcp_server):
    """Test memory search functionality."""
    async with Client(mcp_server) as client:
        # First add a memory
        await client.call_tool("add_memory", {
            "content": "Python programming tips",
            "user_id": "test_user",
            "memory_type": "knowledge"
        })
        
        # Then search for it
        result = await client.call_tool("search_memories", {
            "query": "Python programming",
            "user_id": "test_user",
            "limit": 5
        })
        
        memories = result[0].json()
        assert len(memories) > 0
        assert any("Python" in m["content"] for m in memories)

# Performance tests
async def test_concurrent_operations(mcp_server):
    """Test server under concurrent load."""
    async with Client(mcp_server) as client:
        tasks = []
        for i in range(100):
            task = client.call_tool("add_memory", {
                "content": f"Concurrent memory {i}",
                "user_id": f"user_{i % 10}",
                "memory_type": "load_test"
            })
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        assert len(results) == 100
        assert all(r[0].json()["success"] for r in results)
```

## Cookiecutter Templates

### MCP Tool Template

Create reusable templates for extending the MCP server:

```json
// templates/cookiecutter.json
{
    "tool_name": "my_custom_tool",
    "tool_description": "A custom tool for FACT Memory",
    "author_name": "Your Name",
    "author_email": "your.email@example.com",
    "requires_context": true,
    "requires_auth": true,
    "is_async": true,
    "parameters": [
        {
            "name": "user_id",
            "type": "str", 
            "required": true,
            "description": "User identifier"
        }
    ],
    "__prompts__": {
        "tool_name": "Enter the tool name (snake_case)",
        "tool_description": "Brief description of the tool",
        "author_name": "Your full name",
        "author_email": "Your email address",
        "requires_context": "Does this tool need FastMCP context?",
        "requires_auth": "Does this tool require authentication?",
        "is_async": "Is this tool asynchronous?"
    }
}
```

### Tool Implementation Template

```python
# templates/{{cookiecutter.tool_name}}/tool.py
from fastmcp import FastMCP{% if cookiecutter.requires_context %}, Context{% endif %}
from typing import Dict, Any{% if cookiecutter.is_async %}, Awaitable{% endif %}

{% if cookiecutter.requires_auth %}
from ..validation import validate_user_access
{% endif %}

mcp = FastMCP("{{ cookiecutter.tool_name.replace('_', ' ').title() }} Extension")

@mcp.tool()
{% if cookiecutter.is_async %}async {% endif %}def {{ cookiecutter.tool_name }}(
    {% for param in cookiecutter.parameters -%}
    {{ param.name }}: {{ param.type }}{% if not param.required %} = None{% endif %},
    {% endfor -%}
    {% if cookiecutter.requires_context %}ctx: Context = None{% endif %}
) -> Dict[str, Any]:
    """
    {{ cookiecutter.tool_description }}
    
    Args:
        {% for param in cookiecutter.parameters -%}
        {{ param.name }}: {{ param.description }}
        {% endfor -%}
        {% if cookiecutter.requires_context %}ctx: FastMCP context for logging and resource access{% endif %}
    
    Returns:
        Tool execution result
    """
    {% if cookiecutter.requires_context -%}
    {% if cookiecutter.is_async %}await {% endif %}ctx.info(f"Executing {{ cookiecutter.tool_name }}")
    {% endif %}
    
    {% if cookiecutter.requires_auth -%}
    # Validate user access
    {% if cookiecutter.is_async %}await {% endif %}validate_user_access(user_id)
    {% endif %}
    
    # TODO: Implement tool logic here
    result = {
        "success": True,
        "message": "{{ cookiecutter.tool_name }} executed successfully",
        "data": {}
    }
    
    {% if cookiecutter.requires_context -%}
    {% if cookiecutter.is_async %}await {% endif %}ctx.info(f"{{ cookiecutter.tool_name }} completed")
    {% endif %}
    
    return result
```

### Hook Scripts

```python
# templates/hooks/pre_gen_project.py
import re
import sys

tool_name = "{{ cookiecutter.tool_name }}"

# Validate tool name follows snake_case convention
if not re.match(r'^[a-z][a-z0-9_]*$', tool_name):
    print(f"ERROR: '{tool_name}' is not a valid tool name!")
    print("Tool names must be snake_case (lowercase with underscores)")
    sys.exit(1)

# Validate no spaces in tool name
if ' ' in tool_name:
    print(f"ERROR: Tool name '{tool_name}' cannot contain spaces!")
    sys.exit(1)

print(f"✓ Generating tool: {tool_name}")
```

```python
# templates/hooks/post_gen_project.py
import os
import subprocess

tool_name = "{{ cookiecutter.tool_name }}"

print(f"✓ Tool '{tool_name}' generated successfully!")
print(f"📁 Location: ./{tool_name}/")
print()
print("Next steps:")
print(f"1. cd {tool_name}")
print("2. Implement the tool logic in tool.py")
print("3. Run tests: pytest tests.py")
print("4. Register tool with main MCP server")
print()
print("Documentation:")
print("- FastMCP: https://github.com/jlowin/fastmcp")
print("- FACT Memory: ../docs/")
```

## CLI Integration

### FastMCP CLI Commands

```bash
# Development server with inspector
fastmcp dev src/memory/mcp/server.py

# Production server
fastmcp run src/memory/mcp/server.py --transport streamable-http --port 8080

# Install as system service
fastmcp install src/memory/mcp/server.py --name "FACT Memory" --env-var FACT_API_KEY=xyz

# Generate new tool from template
cookiecutter fact-memory/templates/mcp-tool/

# Run tests
fastmcp test src/memory/mcp/server.py
```

### Integration with FACT CLI

```bash
# FACT CLI extensions
fact memory-server start --port 8080
fact memory-server dev --inspector
fact memory-server install --production
fact memory-tool create --name custom_analyzer
fact memory-tool test --tool add_memory
```

## Performance Considerations

### Caching Strategy

```python
# Integration with FACT cache system
from src.cache.manager import CacheManager

class MemoryMCPCache:
    def __init__(self):
        self.cache = CacheManager()
    
    async def cache_tool_result(self, tool_name: str, params: Dict, result: Any):
        """Cache tool results for performance."""
        cache_key = f"mcp:tool:{tool_name}:{hash(str(params))}"
        await self.cache.set(cache_key, result, ttl=300)  # 5 minutes
    
    async def get_cached_result(self, tool_name: str, params: Dict):
        """Retrieve cached tool result."""
        cache_key = f"mcp:tool:{tool_name}:{hash(str(params))}"
        return await self.cache.get(cache_key)
```

### Response Optimization

```python
# Implement response compression and pagination
@mcp.tool()
async def search_memories_paginated(
    query: str,
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    ctx: Context = None
) -> Dict[str, Any]:
    """Paginated memory search for large result sets."""
    
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Perform search with pagination
    search_engine = await ctx.get_resource("memory://search")
    results = await search_engine.search_paginated(
        query=query,
        user_id=user_id,
        offset=offset,
        limit=page_size
    )
    
    return {
        "memories": results["memories"],
        "total_count": results["total"],
        "page": page,
        "page_size": page_size,
        "has_next": results["total"] > offset + page_size
    }
```

## Security Implementation

### Authentication & Authorization

```python
from fastmcp import FastMCP
from ..security import validate_api_key, check_user_permissions

@mcp.middleware
async def security_middleware(request, call_next):
    """Comprehensive security middleware."""
    
    # Extract API key from headers
    api_key = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    # Validate API key
    user_id = await validate_api_key(api_key)
    if not user_id:
        raise PermissionError("Invalid API key")
    
    # Check user permissions for the requested tool
    tool_name = request.method
    if not await check_user_permissions(user_id, tool_name):
        raise PermissionError(f"User {user_id} not authorized for {tool_name}")
    
    # Add user context to request
    request.user_id = user_id
    
    return await call_next(request)
```

## Deployment Configurations

### Docker Integration

```dockerfile
# Dockerfile for FACT Memory MCP Server
FROM python:3.11-slim

WORKDIR /app

# Install FastMCP and dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy server code
COPY src/ ./src/
COPY fact-memory/ ./fact-memory/

# Expose MCP server port
EXPOSE 8080

# Run with FastMCP
CMD ["fastmcp", "run", "src/memory/mcp/server.py", "--transport", "streamable-http", "--port", "8080"]
```

### Kubernetes Deployment

```yaml
# k8s/mcp-server-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fact-memory-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fact-memory-mcp
  template:
    metadata:
      labels:
        app: fact-memory-mcp
    spec:
      containers:
      - name: mcp-server
        image: fact-memory:latest
        ports:
        - containerPort: 8080
        env:
        - name: FACT_API_KEY
          valueFrom:
            secretKeyRef:
              name: fact-secrets
              key: api-key
        - name: MCP_SERVER_PORT
          value: "8080"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

This comprehensive MCP components documentation integrates FastMCP best practices with cookiecutter templating for a robust, scalable, and maintainable FACT Memory MCP server implementation.