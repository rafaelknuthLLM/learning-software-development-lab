# FACT System - Tool Creation and Integration Guide

## Overview

FACT's tool system allows you to extend the platform with custom functionality. Tools are secure, containerized functions that can access databases, APIs, file systems, or perform calculations. This guide covers everything from creating simple tools to advanced integration patterns.

## Tool Architecture

### How Tools Work

```
User Query → Claude Analysis → Tool Selection → Tool Execution → Result Processing → Response
```

Tools in FACT are:
- **Secure**: Execute in isolated containers via Arcade.dev
- **Typed**: Use JSON schemas for parameter validation
- **Discoverable**: Automatically registered and available to Claude
- **Auditable**: All executions logged and monitored

### Tool Lifecycle

1. **Definition**: Create tool using Python decorators
2. **Registration**: Upload to Arcade gateway
3. **Discovery**: Tool schema exported to Claude
4. **Execution**: Runtime invocation via API calls
5. **Monitoring**: Performance and usage tracking

## Creating Your First Tool

### Basic Tool Structure

```python
# src/tools/connectors/calculator.py
from src.tools.decorators import Tool
from typing import Dict, Any
import json

@Tool(
    name="Math.Calculator",
    description="Perform basic mathematical calculations",
    version="1.0.0"
)
def calculate(expression: str) -> Dict[str, Any]:
    """
    Calculate a mathematical expression safely.
    
    Args:
        expression: Mathematical expression to evaluate (e.g., "2 + 3 * 4")
        
    Returns:
        Dictionary with result and metadata
    """
    try:
        # Validate expression for safety
        if not _is_safe_expression(expression):
            return {
                "error": "Invalid or unsafe expression",
                "expression": expression,
                "result": None
            }
        
        # Evaluate expression
        result = eval(expression)
        
        return {
            "expression": expression,
            "result": result,
            "type": type(result).__name__,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "expression": expression,
            "result": None,
            "status": "error"
        }

def _is_safe_expression(expr: str) -> bool:
    """Validate that expression contains only safe operations."""
    allowed_chars = set('0123456789+-*/().,\n ')
    forbidden_words = ['import', 'exec', 'eval', '__', 'open', 'file']
    
    # Check character whitelist
    if not all(c in allowed_chars for c in expr):
        return False
    
    # Check for forbidden keywords
    if any(word in expr.lower() for word in forbidden_words):
        return False
        
    return True
```

### Tool Registration

```python
# Register the tool with the system
from src.tools.registry import get_tool_registry

def register_calculator_tool():
    """Register the calculator tool with FACT."""
    registry = get_tool_registry()
    
    # Import and register
    from src.tools.connectors.calculator import calculate
    
    # Tool is automatically registered via decorator
    print(f"Calculator tool registered: {registry.get_tool('Math.Calculator')}")
```

### Tool Schema Generation

The `@Tool` decorator automatically generates JSON schemas:

```json
{
  "name": "Math.Calculator",
  "description": "Perform basic mathematical calculations",
  "parameters": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "Mathematical expression to evaluate"
      }
    },
    "required": ["expression"]
  }
}
```

## Advanced Tool Patterns

### Database Access Tool

```python
# src/tools/connectors/custom_db.py
from src.tools.decorators import Tool
from src.db.connection import get_connection
from typing import Dict, Any, List
import sqlite3

@Tool(
    name="CustomDB.QueryAnalytics",
    description="Execute analytical queries on financial data",
    version="1.0.0"
)
def query_analytics(
    metric: str,
    time_period: str = "Q1-2025",
    group_by: str = None
) -> Dict[str, Any]:
    """
    Execute predefined analytical queries.
    
    Args:
        metric: Metric to analyze (revenue, profit, market_cap)
        time_period: Time period filter (e.g., "Q1-2025", "2024")  
        group_by: Optional grouping field (sector, company)
        
    Returns:
        Query results with metadata
    """
    try:
        conn = get_connection()
        
        # Build safe query from predefined templates
        query = _build_analytics_query(metric, time_period, group_by)
        
        if not query:
            return {"error": "Invalid metric or parameters"}
        
        # Execute query
        cursor = conn.execute(query)
        results = [dict(row) for row in cursor.fetchall()]
        
        return {
            "metric": metric,
            "time_period": time_period,
            "group_by": group_by,
            "results": results,
            "count": len(results),
            "query": query,
            "status": "success"
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "metric": metric,
            "status": "error"
        }
    finally:
        if 'conn' in locals():
            conn.close()
```

## Security Best Practices

### Input Validation

```python
def validate_sql_query(query: str) -> bool:
    """Validate SQL query for security."""
    # Convert to lowercase for checking
    query_lower = query.lower().strip()
    
    # Must start with SELECT
    if not query_lower.startswith('select'):
        return False
    
    # Block dangerous keywords
    dangerous_keywords = [
        'drop', 'delete', 'insert', 'update', 'alter', 'create',
        'exec', 'execute', 'sp_', 'xp_', '--', '/*', '*/',
        'union', 'having'  # Potential for injection
    ]
    
    for keyword in dangerous_keywords:
        if keyword in query_lower:
            return False
    
    return True

def sanitize_file_path(path: str) -> str:
    """Sanitize file paths to prevent directory traversal."""
    # Remove dangerous patterns
    dangerous_patterns = ['../', '..\\', '/etc/', '/proc/', 'C:\\']
    
    clean_path = path
    for pattern in dangerous_patterns:
        clean_path = clean_path.replace(pattern, '')
    
    # Ensure path is within allowed directories
    allowed_dirs = ['data/', 'output/', 'temp/']
    if not any(clean_path.startswith(dir) for dir in allowed_dirs):
        raise ValueError(f"Access denied: {path}")
    
    return clean_path
```

### Authentication and Authorization

```python
@Tool(
    name="SecureAPI.DataAccess",
    description="Access sensitive data with authentication",
    requires_auth=True,
    scopes=["data:read", "finance:query"]
)
def secure_data_access(query: str, auth_token: str = None) -> Dict[str, Any]:
    """Access data with proper authentication."""
    
    # Validate authentication token
    if not _validate_auth_token(auth_token):
        return {"error": "Authentication required", "status": "unauthorized"}
    
    # Check user permissions
    user_perms = _get_user_permissions(auth_token)
    if "finance:query" not in user_perms:
        return {"error": "Insufficient permissions", "status": "forbidden"}
    
    # Proceed with secure data access
    return _execute_secure_query(query)
```

## Testing Tools

### Unit Testing

```python
# tests/tools/test_calculator.py
import pytest
from src.tools.connectors.calculator import calculate

def test_basic_calculation():
    """Test basic arithmetic operations."""
    result = calculate("2 + 3")
    assert result["status"] == "success"
    assert result["result"] == 5

def test_complex_expression():
    """Test complex mathematical expressions."""
    result = calculate("(10 + 5) * 2 / 3")
    assert result["status"] == "success"
    assert result["result"] == 10.0

def test_invalid_expression():
    """Test handling of invalid expressions."""
    result = calculate("import os")
    assert result["status"] == "error"
    assert "unsafe" in result["error"].lower()

@pytest.mark.parametrize("expression,expected", [
    ("1 + 1", 2),
    ("10 - 5", 5),
    ("4 * 3", 12),
    ("15 / 3", 5.0),
    ("2 ** 3", 8),
])
def test_arithmetic_operations(expression, expected):
    """Test various arithmetic operations."""
    result = calculate(expression)
    assert result["status"] == "success"
    assert result["result"] == expected
```

## Performance Optimization

### Async Tool Execution

```python
# Optimize for concurrent tool execution
import asyncio
from typing import List, Dict, Any

async def execute_tools_concurrently(
    tool_requests: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Execute multiple tools concurrently for better performance."""
    
    executor = ToolExecutor(get_tool_registry(), None)
    
    # Create tasks for concurrent execution
    tasks = []
    for request in tool_requests:
        task = executor.execute_tool(
            tool_name=request["tool_name"],
            arguments=request["arguments"],
            user_id=request.get("user_id")
        )
        tasks.append(task)
    
    # Execute all tools concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    return results
```

## Tool Integration Examples

### Registering Custom Tools

```python
# src/core/driver.py - Tool initialization
def initialize_tools(self):
    """Initialize and register all tools."""
    registry = get_tool_registry()
    
    # Register built-in tools
    from src.tools.connectors import calculator, custom_db
    
    registry.register_tool(calculator.calculate)
    registry.register_tool(custom_db.query_analytics)
    
    # Export tool schemas for Claude
    self.tool_schemas = registry.export_schemas()
    
    print(f"Registered {len(registry.list_tools())} tools")
```

### Tool Deployment

```python
# scripts/deploy_tools.py
import asyncio
from src.tools.registry import get_tool_registry
from src.arcade.client import ArcadeClient

async def deploy_tools_to_arcade():
    """Deploy all registered tools to Arcade gateway."""
    
    registry = get_tool_registry()
    arcade_client = ArcadeClient()
    
    tools = registry.list_tools()
    print(f"Deploying {len(tools)} tools to Arcade...")
    
    for tool_name in tools:
        tool = registry.get_tool(tool_name)
        
        try:
            # Upload tool to Arcade
            result = await arcade_client.upload_tool(
                name=tool.name,
                code=tool.source_code,
                schema=tool.schema,
                requirements=tool.requirements
            )
            
            print(f"✅ Deployed {tool_name}: {result['tool_id']}")
            
        except Exception as e:
            print(f"❌ Failed to deploy {tool_name}: {e}")
    
    await arcade_client.close()

if __name__ == "__main__":
    asyncio.run(deploy_tools_to_arcade())
```

## Best Practices Summary

### Security
- Always validate inputs before processing
- Use parameterized queries for database access
- Implement proper authentication and authorization
- Sanitize file paths to prevent directory traversal
- Log all tool executions for audit purposes

### Performance
- Use async functions for I/O-bound operations
- Implement result caching for expensive computations
- Monitor tool execution times and optimize slow tools
- Use connection pooling for database tools
- Batch operations when possible

### Maintainability
- Follow consistent naming conventions
- Document all tool parameters and return values
- Implement comprehensive error handling
- Write unit tests for all tool functions
- Use type hints for better code clarity

### Deployment
- Test tools thoroughly before deployment
- Use version control for tool schemas
- Implement rollback capabilities
- Monitor tool performance in production
- Keep tools stateless for better scalability

## Next Steps

Now that you understand tool creation:

1. **Explore Advanced Features**: Check [Advanced Usage Guide](7_advanced_usage.md)
2. **Security Review**: Read [Security Best Practices](docs/security-guidelines.md)
3. **Performance**: See [Performance Optimization](docs/performance-optimization.md)
4. **Troubleshooting**: Review [Troubleshooting Guide](8_troubleshooting_guide.md)

---

**Ready to build custom tools?** Start with the calculator example and expand from there. Remember to prioritize security and performance in all tool implementations.