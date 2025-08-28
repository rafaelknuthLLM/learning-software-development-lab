# FACT Hello World MCP Server

A demonstration FastMCP server implementation for the FACT Memory System, showcasing basic MCP patterns and best practices.

## Overview

This server provides a simple introduction to FastMCP development with:

- **Hello Tool**: Returns a basic greeting message
- **Greet Tool**: Returns a personalized greeting with name parameter
- **Server Info Resource**: Provides server metadata and capabilities
- **Multiple Transport Modes**: STDIO (standard MCP) and HTTP
- **Comprehensive Testing**: Built-in test mode for development

## Features

### Tools

1. **`hello()`**
   - Returns a simple hello message with timestamp
   - No parameters required
   - Demonstrates basic tool structure

2. **`greet(name: str)`**
   - Returns a personalized greeting
   - Validates and sanitizes input
   - Demonstrates parameter handling and validation

### Resources

1. **`fact://server_info`**
   - Provides comprehensive server information
   - Lists available tools and their parameters
   - Shows server status and capabilities

## Installation

1. Install FastMCP:
```bash
pip install fastmcp
```

2. Or install from requirements:
```bash
pip install -r requirements.txt
```

## Usage

### Test Mode (Development)

Test all tools and resources:
```bash
python hello_mcp_server.py --mode test
```

Enable debug logging:
```bash
python hello_mcp_server.py --mode test --debug
```

### STDIO Mode (Standard MCP)

Run as a standard MCP server for client integration:
```bash
python hello_mcp_server.py --mode stdio
```

This is the default mode and standard way to run MCP servers.

### HTTP Mode (Development/Testing)

Run with HTTP transport for web-based testing:
```bash
python hello_mcp_server.py --mode http --host localhost --port 8080
```

Access at: `http://localhost:8080`

## Example Output

### Hello Tool
```json
{
  "message": "Hello from FACT Memory MCP Server!",
  "timestamp": "2025-05-26T20:28:51.191320",
  "server": "FACT Hello World Server",
  "status": "active"
}
```

### Greet Tool
```json
{
  "message": "Hello, John! Welcome to the FACT Memory System.",
  "greeting_for": "John",
  "timestamp": "2025-05-26T20:28:51.191385",
  "server": "FACT Hello World Server",
  "status": "success"
}
```

### Server Info Resource
```json
{
  "name": "FACT Hello World Server",
  "version": "1.0.0",
  "description": "A demonstration MCP server for the FACT Memory System",
  "framework": "FastMCP",
  "capabilities": {
    "tools": [
      {
        "name": "hello",
        "description": "Returns a simple hello message",
        "parameters": []
      },
      {
        "name": "greet",
        "description": "Returns a personalized greeting",
        "parameters": [
          {
            "name": "name",
            "type": "string",
            "required": true,
            "description": "Name to include in greeting"
          }
        ]
      }
    ],
    "resources": [
      {
        "name": "server_info",
        "description": "Server information and metadata"
      }
    ]
  },
  "status": {
    "running": true,
    "uptime_start": "2025-05-26T20:28:51.191430",
    "health": "healthy"
  },
  "integration": {
    "fact_memory_compatible": true,
    "mcp_version": "1.0",
    "transport": "stdio"
  }
}
```

## Development

### Code Structure

The server follows FastMCP best practices:

- **Decorators**: `@mcp.tool()` and `@mcp.resource()` for registration
- **Type Hints**: Full typing support for parameters and returns
- **Context Support**: Optional FastMCP context for logging and resource access
- **Error Handling**: Proper validation and error responses
- **Documentation**: Comprehensive docstrings for all functions

### Key Patterns

1. **Tool Definition**:
```python
@mcp.tool()
async def my_tool(param: str, ctx: Context = None) -> Dict[str, Any]:
    """Tool description with parameters and return type."""
    if ctx:
        await ctx.info("Tool executing...")
    
    # Tool logic here
    return {"result": "success"}
```

2. **Resource Definition**:
```python
@mcp.resource("scheme://resource_name")
async def get_resource() -> Dict[str, Any]:
    """Resource description."""
    return {"data": "resource_data"}
```

3. **Server Configuration**:
```python
mcp = FastMCP(
    name="Server Name",
    instructions="Server description and usage instructions"
)
```

### Testing

The server includes comprehensive testing capabilities:

- **Tool Testing**: Validates all tools work correctly
- **Resource Testing**: Ensures resources are accessible
- **Error Testing**: Validates error handling and edge cases
- **Performance Testing**: Measures response times

Run tests:
```bash
python hello_mcp_server.py --mode test --debug
```

## Integration

### MCP Client Integration

Use with any MCP-compatible client:

```python
from mcp import ClientSession

# Connect to server
session = ClientSession()
await session.connect("stdio", {"command": ["python", "hello_mcp_server.py"]})

# Call tools
hello_result = await session.call_tool("hello", {})
greet_result = await session.call_tool("greet", {"name": "Developer"})

# Access resources
server_info = await session.get_resource("fact://server_info")
```

### FACT Memory System Integration

This server demonstrates patterns used in the full FACT Memory System:

- **User Scoping**: Parameter validation and user isolation
- **Cache Integration**: Ready for FACT cache system integration
- **Security**: Input validation and sanitization
- **Performance**: Async/await patterns for high performance
- **Monitoring**: Structured logging and metrics

## Next Steps

1. **Extend Tools**: Add more sophisticated tools with database integration
2. **Add Authentication**: Implement API key validation and user permissions
3. **Cache Integration**: Connect to FACT cache system for performance
4. **Advanced Features**: Add memory management, search capabilities
5. **Production Deployment**: Configure for production environments

## References

- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [FACT Memory System Documentation](../docs/)
- [FastMCP Best Practices](../docs/mcp-components.md)

## License

Part of the FACT Memory System project.