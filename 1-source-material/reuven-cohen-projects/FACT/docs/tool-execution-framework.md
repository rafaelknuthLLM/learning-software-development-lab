# FACT System Tool Execution Framework

## Overview

The FACT System Tool Execution Framework provides a comprehensive solution for executing LLM tools with security validation, rate limiting, monitoring, and optional Arcade.dev integration. This framework enables secure, scalable, and observable tool execution for AI applications.

## Architecture

### Core Components

1. **ToolExecutor** - Main orchestrator for tool execution
2. **ArcadeClient** - Integration with Arcade.dev platform
3. **ArcadeGateway** - Routing between local and remote execution
4. **SecurityValidator** - Input validation and security checks
5. **AuthorizationManager** - User authentication and authorization
6. **MetricsCollector** - Performance monitoring and metrics
7. **RateLimiter** - Rate limiting and throttling

### Data Flow

```
LLM Request → ToolCall → Security Validation → Authorization Check → 
Rate Limiting → Tool Execution (Local/Arcade) → Result Processing → 
Metrics Collection → LLM Response
```

## Key Features

### 🔒 Security & Validation
- Input parameter validation with JSON Schema
- SQL injection prevention
- Path traversal protection
- Rate limiting per user/tool
- Authorization with OAuth integration
- Audit logging for compliance

### 🚀 Execution Modes
- **Local Execution**: Direct function calls in secure environment
- **Arcade.dev Integration**: Containerized execution on Arcade platform
- **Hybrid Mode**: Intelligent routing with fallback support

### 📊 Monitoring & Observability
- Real-time performance metrics
- Tool usage analytics
- Error tracking and alerting
- Execution time monitoring
- Success/failure rate tracking

### ⚡ Performance
- Asynchronous execution with `asyncio`
- Concurrent tool execution
- Connection pooling for Arcade.dev
- Caching and optimization

## Implementation Guide

### 1. Basic Tool Registration

```python
from src.tools.decorators import Tool

@Tool(
    name="MyApp.Calculator",
    description="Perform mathematical calculations",
    parameters={
        "operation": {"type": "string", "enum": ["add", "subtract", "multiply", "divide"]},
        "a": {"type": "number"},
        "b": {"type": "number"}
    },
    requires_auth=False,
    timeout_seconds=10
)
def calculator_tool(operation: str, a: float, b: float) -> dict:
    """Mathematical calculator tool implementation."""
    operations = {
        "add": lambda x, y: x + y,
        "subtract": lambda x, y: x - y,
        "multiply": lambda x, y: x * y,
        "divide": lambda x, y: x / y if y != 0 else None
    }
    
    if operation not in operations or (operation == "divide" and b == 0):
        return {"error": "Invalid operation or division by zero"}
    
    result = operations[operation](a, b)
    return {
        "operation": operation,
        "operands": [a, b],
        "result": result
    }
```

### 2. Tool Execution Setup

```python
import asyncio
from src.tools.executor import ToolExecutor, create_tool_call
from src.arcade.client import ArcadeClient

async def main():
    # Initialize Arcade client (optional)
    arcade_client = ArcadeClient(api_key="your-arcade-api-key")
    
    # Create tool executor
    executor = ToolExecutor(
        arcade_client=arcade_client,
        enable_rate_limiting=True,
        max_calls_per_minute=100
    )
    
    # Create tool call
    tool_call = create_tool_call(
        "MyApp.Calculator",
        {"operation": "multiply", "a": 15, "b": 7},
        user_id="user123"
    )
    
    # Execute tool
    result = await executor.execute_tool_call(tool_call)
    
    if result.success:
        print(f"Result: {result.data}")
    else:
        print(f"Error: {result.error}")

asyncio.run(main())
```

### 3. Authorization Configuration

```python
from src.security.auth import AuthorizationManager

# Initialize authorization manager
auth_manager = AuthorizationManager(
    oauth_client_id="your-oauth-client-id",
    oauth_client_secret="your-oauth-client-secret",
    oauth_redirect_uri="https://your-app.com/oauth/callback"
)

# Initiate authorization flow
auth_flow = auth_manager.initiate_authorization(
    user_id="user123",
    tool_name="MyApp.Calculator", 
    scopes=["read", "write"]
)

# Complete authorization (after user consent)
authorization = await auth_manager.complete_authorization(
    flow_id=auth_flow.flow_id,
    authorization_code="oauth-auth-code"
)
```

### 4. Metrics and Monitoring

```python
from src.monitoring.metrics import get_metrics_collector

# Get metrics collector
metrics = get_metrics_collector()

# Get system metrics
system_metrics = metrics.get_system_metrics(time_window_minutes=60)
print(f"Total executions: {system_metrics.total_executions}")
print(f"Success rate: {100 - system_metrics.error_rate:.1f}%")
print(f"Average execution time: {system_metrics.average_execution_time:.2f}ms")

# Get tool-specific metrics
tool_metrics = metrics.get_tool_metrics("MyApp.Calculator")
print(f"Calculator executions: {tool_metrics['total_executions']}")
print(f"Calculator success rate: {tool_metrics['success_rate']:.1f}%")

# Get user metrics
user_metrics = metrics.get_user_metrics("user123", time_window_minutes=60)
print(f"User tools used: {len(user_metrics['tools_used'])}")
```

## Sample Tools

The framework includes several sample tools demonstrating different capabilities:

### HTTP/Web Tools
- **Web.HTTPRequest** - Make HTTP requests to external APIs
- **Web.URLHealth** - Check URL availability and health
- **Web.ParseJSON** - Parse and validate JSON data
- **Web.ExtractURLs** - Extract URLs from text content

### File System Tools
- **FileSystem.ReadFile** - Read file contents with security validation
- **FileSystem.ListDirectory** - List directory contents with filtering
- **FileSystem.GetFileInfo** - Get detailed file/directory metadata

### SQL Tools
- **SQL.Query** - Execute SQL queries with injection prevention
- **SQL.TableInfo** - Get database table information
- **SQL.SchemaInfo** - Retrieve database schema details

## Security Considerations

### Input Validation
- All parameters validated against JSON Schema
- Type checking and format validation
- Range and length constraints enforced
- Enum value validation

### SQL Injection Prevention
```python
# ✅ Safe - Using parameterized queries
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# ❌ Unsafe - String concatenation
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

### File System Security
- Path traversal prevention (`../` blocking)
- Allowed directory restrictions
- File type validation
- Size limits enforcement

### Rate Limiting
```python
# Configure per-user rate limits
executor = ToolExecutor(
    enable_rate_limiting=True,
    max_calls_per_minute=60,  # 60 calls per minute per user
    rate_limit_by_user=True
)
```

## Error Handling

### Error Types
- **ToolNotFoundError** (404) - Tool not registered
- **ToolValidationError** (400) - Parameter validation failed
- **UnauthorizedError** (401) - Authentication required
- **SecurityError** (403) - Security violation detected
- **ToolExecutionError** (500) - Tool execution failed
- **ArcadeError** (502) - Arcade.dev platform error

### Error Response Format
```json
{
  "call_id": "uuid-string",
  "tool_name": "MyApp.Calculator",
  "success": false,
  "error": "Parameter validation failed: 'operation' must be one of ['add', 'subtract', 'multiply', 'divide']",
  "status_code": 400,
  "execution_time_ms": 2.5,
  "metadata": {
    "error_type": "ToolValidationError",
    "timestamp": 1671234567.89
  }
}
```

## Performance Optimization

### Concurrent Execution
```python
# Execute multiple tools concurrently
tool_calls = [
    create_tool_call("Tool1", {"param": "value1"}),
    create_tool_call("Tool2", {"param": "value2"}),
    create_tool_call("Tool3", {"param": "value3"})
]

results = await executor.execute_tool_calls(tool_calls)
```

### Connection Pooling
```python
# Arcade client with connection pooling
arcade_client = ArcadeClient(
    api_key="your-key",
    timeout=30,
    max_retries=3
)
```

### Caching
- Tool registry caching
- Parameter validation caching
- Authorization token caching
- Metrics aggregation caching

## Testing

### Unit Tests
```bash
# Run all tool executor tests
pytest tests/unit/test_tool_executor.py -v

# Run specific test class
pytest tests/unit/test_tool_executor.py::TestToolExecutor -v

# Run with coverage
pytest tests/unit/test_tool_executor.py --cov=src.tools.executor
```

### Integration Tests
```bash
# Run integration tests (requires external services)
pytest tests/integration/test_arcade_integration.py -v

# Run with specific markers
pytest -m "not integration" tests/
```

### Demo Script
```bash
# Run comprehensive demo
python examples/tool_execution_demo.py

# Run specific demo sections by modifying the script
```

## Deployment

### Environment Variables
```bash
# Arcade.dev Configuration
export ARCADE_API_KEY="your-arcade-api-key"
export ARCADE_BASE_URL="https://api.arcade.dev"

# OAuth Configuration
export OAUTH_CLIENT_ID="your-oauth-client-id"
export OAUTH_CLIENT_SECRET="your-oauth-client-secret"
export OAUTH_REDIRECT_URI="https://your-app.com/oauth/callback"

# Database Configuration
export DATABASE_URL="postgresql://user:pass@localhost/factdb"

# Security Configuration
export SECRET_KEY="your-secret-key"
export ALLOWED_HOSTS="localhost,your-domain.com"
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
COPY examples/ ./examples/

CMD ["python", "examples/tool_execution_demo.py"]
```

### Kubernetes Configuration
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fact-tool-executor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fact-tool-executor
  template:
    metadata:
      labels:
        app: fact-tool-executor
    spec:
      containers:
      - name: fact-tool-executor
        image: fact-system:latest
        env:
        - name: ARCADE_API_KEY
          valueFrom:
            secretKeyRef:
              name: fact-secrets
              key: arcade-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Monitoring and Alerts

### Metrics Dashboard
- Tool execution rate
- Success/failure rates
- Average execution times
- Error distribution
- User activity patterns

### Alerting Rules
```yaml
# Prometheus alerting rules
groups:
- name: fact-tool-execution
  rules:
  - alert: HighToolErrorRate
    expr: (rate(tool_execution_failures_total[5m]) / rate(tool_executions_total[5m])) > 0.1
    for: 2m
    annotations:
      summary: "High tool execution error rate"
      
  - alert: SlowToolExecution
    expr: histogram_quantile(0.95, rate(tool_execution_duration_seconds_bucket[5m])) > 30
    for: 5m
    annotations:
      summary: "Tool execution taking too long"
```

### Health Checks
```python
# Health check endpoint
@app.get("/health")
async def health_check():
    executor_health = await executor.health_check()
    arcade_health = await arcade_client.health_check() if arcade_client else {"status": "disabled"}
    
    return {
        "status": "healthy" if executor_health["healthy"] else "unhealthy",
        "executor": executor_health,
        "arcade": arcade_health,
        "timestamp": time.time()
    }
```

## Best Practices

### Tool Design
1. **Single Responsibility** - Each tool should have one clear purpose
2. **Parameter Validation** - Always validate inputs thoroughly
3. **Error Handling** - Provide meaningful error messages
4. **Documentation** - Include clear descriptions and examples
5. **Testing** - Write comprehensive unit tests

### Security
1. **Least Privilege** - Grant minimal required permissions
2. **Input Sanitization** - Validate and sanitize all inputs
3. **Audit Logging** - Log all tool executions for compliance
4. **Rate Limiting** - Prevent abuse with appropriate limits
5. **Authentication** - Require authentication for sensitive tools

### Performance
1. **Async Operations** - Use async/await for I/O operations
2. **Connection Pooling** - Reuse connections when possible
3. **Caching** - Cache expensive operations appropriately
4. **Monitoring** - Track performance metrics continuously
5. **Resource Limits** - Set appropriate timeouts and limits

## Troubleshooting

### Common Issues

#### Tool Not Found
```
Error: Tool 'MyApp.Calculator' not found in registry
```
**Solution**: Ensure tool is properly registered with `@Tool` decorator

#### Parameter Validation Failed
```
Error: Parameter validation failed: 'operation' is required
```
**Solution**: Check parameter schema and provide all required parameters

#### Rate Limit Exceeded
```
Error: Rate limit exceeded. Too many tool calls per minute.
```
**Solution**: Implement exponential backoff or increase rate limits

#### Arcade Connection Failed
```
Error: Failed to connect to Arcade.dev: Authentication failed
```
**Solution**: Verify API key and network connectivity

### Debug Mode
```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Enable detailed logging
executor = ToolExecutor(debug=True)
```

### Performance Profiling
```python
import cProfile
import pstats

def profile_tool_execution():
    profiler = cProfile.Profile()
    profiler.enable()
    
    # Your tool execution code here
    result = asyncio.run(executor.execute_tool_call(tool_call))
    
    profiler.disable()
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(10)
```

## API Reference

### ToolExecutor Class
Main class for executing tools with security validation and monitoring.

**Methods:**
- `execute_tool_call(tool_call)` - Execute a single tool call
- `execute_tool_calls(tool_calls)` - Execute multiple tool calls concurrently
- `get_available_tools()` - Get list of available tools
- `get_tool_info(tool_name)` - Get detailed tool information
- `health_check()` - Check executor health status

### ToolCall Data Class
Represents a tool execution request.

**Fields:**
- `id` - Unique call identifier
- `name` - Tool name
- `arguments` - Tool parameters
- `user_id` - Optional user identifier
- `session_id` - Optional session identifier
- `timestamp` - Call timestamp

### ToolResult Data Class
Represents a tool execution result.

**Fields:**
- `call_id` - Original call identifier
- `tool_name` - Tool name
- `success` - Execution success flag
- `data` - Result data (if successful)
- `error` - Error message (if failed)
- `execution_time_ms` - Execution time in milliseconds
- `status_code` - HTTP-style status code
- `metadata` - Additional metadata

## Changelog

### Version 1.0.0 (Current)
- Initial implementation with core functionality
- Arcade.dev integration support
- Security validation and authorization
- Metrics collection and monitoring
- Rate limiting and throttling
- Sample tools for HTTP, file system, and SQL operations
- Comprehensive test suite
- Documentation and examples

### Future Roadmap
- Plugin system for custom validators
- Advanced caching mechanisms
- Distributed execution support
- WebSocket streaming for long-running tools
- Integration with additional cloud platforms
- Enhanced monitoring and alerting
- Tool marketplace integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

### Code Style
- Follow PEP 8 for Python code
- Use type hints for all functions
- Include docstrings for all public methods
- Maintain test coverage above 90%
- Use meaningful variable and function names

### Testing Requirements
- Unit tests for all new functionality
- Integration tests for external service integration
- Performance tests for critical paths
- Security tests for validation logic
- Documentation tests for examples

## License

This implementation is part of the FACT System and follows the project's licensing terms.