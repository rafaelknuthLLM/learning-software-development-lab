# Arcade.dev Integration Tutorial

A comprehensive guide to integrating Arcade.dev with the FACT SDK, covering everything from basic setup to production deployment.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Basic Integration](#basic-integration)
4. [Tool Registration](#tool-registration)
5. [Intelligent Routing](#intelligent-routing)
6. [Error Handling](#error-handling)
7. [Cache Integration](#cache-integration)
8. [Security Implementation](#security-implementation)
9. [Monitoring and Observability](#monitoring-and-observability)
10. [Advanced Tool Usage](#advanced-tool-usage)
11. [Testing and Validation](#testing-and-validation)
12. [Production Deployment](#production-deployment)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

## Introduction

This tutorial demonstrates how to integrate Arcade.dev's powerful AI tooling capabilities with the FACT SDK to create a robust, production-ready development environment. You'll learn to build a hybrid system that combines local tool execution with cloud-based AI services.

### What You'll Learn

- How to set up basic Arcade.dev API integration
- Tool registration and management patterns
- Intelligent routing between local and cloud execution
- Error handling and resilience strategies
- Caching for performance optimization
- Security and authentication
- Monitoring and metrics collection
- Advanced tool orchestration patterns
- Comprehensive testing strategies
- Production deployment best practices

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FACT SDK      │    │  Arcade.dev     │    │   Your App      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Tool        │ │    │ │ AI Tools    │ │    │ │ Business    │ │
│ │ Executor    │ │◄──►│ │ & Services  │ │◄──►│ │ Logic       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Cache       │ │    │ │ Gateway     │ │    │ │ REST API    │ │
│ │ Manager     │ │    │ │ & Router    │ │    │ │ Interface   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

Before starting this tutorial, ensure you have:

### System Requirements

- Python 3.8 or higher
- Redis (for caching)
- Git

### API Keys and Accounts

- Arcade.dev API key (sign up at [arcade.dev](https://arcade.dev))
- Redis instance (local or cloud)

### Environment Setup

1. Clone the FACT repository:
```bash
git clone https://github.com/your-org/fact-sdk
cd fact-sdk
```

2. Install dependencies:
```bash
pip install -r examples/arcade-dev/requirements.txt
```

3. Set up environment variables:
```bash
cp examples/arcade-dev/.env.example examples/arcade-dev/.env
# Edit .env with your API keys and configuration
```

4. Verify setup:
```bash
cd examples/arcade-dev
python verify_setup.py
```

## Basic Integration

Let's start with a simple Arcade.dev API client integration.

### Example 1: Basic API Client

**File:** [`01_basic_integration/basic_arcade_client.py`](01_basic_integration/basic_arcade_client.py)

This example demonstrates:
- Establishing connections to Arcade.dev API
- Making authenticated requests
- Basic error handling and retries
- Simple caching integration

#### Key Components

```python
from src.core.driver import Driver
from src.cache.manager import CacheManager

@dataclass
class ArcadeConfig:
    """Configuration for Arcade.dev API client."""
    api_key: str
    api_url: str = "https://api.arcade.dev"
    timeout: int = 30
    max_retries: int = 3

class BasicArcadeClient:
    """Basic Arcade.dev API client with FACT integration."""
    
    def __init__(self, config: ArcadeConfig, cache_manager: Optional[CacheManager] = None):
        self.config = config
        self.cache_manager = cache_manager
        self.session: Optional[aiohttp.ClientSession] = None
```

#### Running the Example

```bash
cd examples/arcade-dev/01_basic_integration
python basic_arcade_client.py
```

**Expected Output:**
```
🔍 Checking API health...
✅ API Status: healthy
👤 Getting user information...
✅ User: your_username
🔬 Analyzing sample code...
✅ Analysis completed: 3 suggestions
```

#### Key Learnings

- **Configuration Management:** Use dataclasses for structured configuration
- **Connection Management:** Implement proper async context managers
- **Error Handling:** Include retry logic with exponential backoff
- **Caching Integration:** Cache successful responses to improve performance

## Tool Registration

Next, we'll explore how to register and manage tools in the FACT ecosystem.

### Example 2: Tool Registration System

**File:** [`02_tool_registration/register_fact_tools.py`](02_tool_registration/register_fact_tools.py)

This example demonstrates:
- Registering local tools with the FACT executor
- Tool validation and parameter checking
- Dynamic tool discovery
- Tool metadata and documentation

#### Key Components

```python
from src.tools.executor import ToolExecutor
from src.tools.decorators import tool_registry

class ToolRegistrationManager:
    """Manages registration of tools in the FACT ecosystem."""
    
    @tool_registry.register_tool("code_analyzer")
    async def analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code for potential issues and improvements."""
        # Tool implementation
        pass
```

#### Running the Example

```bash
cd examples/arcade-dev/02_tool_registration
python register_fact_tools.py
```

#### Key Learnings

- **Decorator Pattern:** Use decorators for clean tool registration
- **Type Validation:** Implement parameter validation for robustness
- **Tool Discovery:** Enable dynamic discovery of available tools
- **Documentation:** Auto-generate tool documentation from docstrings

## Intelligent Routing

Learn how to intelligently route tool execution between local and cloud services.

### Example 3: Hybrid Execution System

**File:** [`03_intelligent_routing/hybrid_execution.py`](03_intelligent_routing/hybrid_execution.py)

This example demonstrates:
- Decision logic for local vs. cloud execution
- Load balancing between execution environments
- Fallback strategies
- Performance optimization

#### Key Components

```python
class IntelligentRouter:
    """Routes tool execution between local and Arcade.dev based on various factors."""
    
    async def route_execution(self, tool_name: str, params: Dict[str, Any]) -> ExecutionResult:
        """Determine optimal execution environment and route accordingly."""
        
        # Decision factors
        factors = await self._analyze_execution_factors(tool_name, params)
        
        if self._should_use_arcade(factors):
            return await self._execute_on_arcade(tool_name, params)
        else:
            return await self._execute_locally(tool_name, params)
```

#### Running the Example

```bash
cd examples/arcade-dev/03_intelligent_routing
python hybrid_execution.py
```

#### Key Learnings

- **Decision Logic:** Implement smart routing based on multiple factors
- **Performance Metrics:** Use execution time and resource usage for decisions
- **Fallback Strategies:** Always have backup execution paths
- **Load Balancing:** Distribute load across available resources

## Error Handling

Build resilient systems with comprehensive error handling.

### Example 4: Resilient Execution

**File:** [`04_error_handling/resilient_execution.py`](04_error_handling/resilient_execution.py)

This example demonstrates:
- Circuit breaker patterns
- Retry mechanisms with backoff
- Error classification and handling
- Graceful degradation

#### Key Components

```python
class CircuitBreaker:
    """Implements circuit breaker pattern for resilient API calls."""
    
    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
```

#### Running the Example

```bash
cd examples/arcade-dev/04_error_handling
python resilient_execution.py
```

#### Key Learnings

- **Circuit Breakers:** Prevent cascading failures in distributed systems
- **Retry Strategies:** Implement exponential backoff for transient failures
- **Error Classification:** Distinguish between recoverable and non-recoverable errors
- **Monitoring:** Track error rates and system health

## Cache Integration

Optimize performance with intelligent caching strategies.

### Example 5: Advanced Caching

**File:** [`05_cache_integration/cached_arcade_client.py`](05_cache_integration/cached_arcade_client.py)

This example demonstrates:
- Multi-level caching strategies
- Cache invalidation policies
- Performance monitoring
- Cache warming

#### Key Components

```python
class CachedArcadeClient:
    """Arcade client with advanced caching capabilities."""
    
    async def execute_with_cache(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute tool with intelligent caching."""
        
        cache_key = self._generate_cache_key(tool_name, params)
        
        # Try L1 cache (memory)
        if result := await self.l1_cache.get(cache_key):
            return result
            
        # Try L2 cache (Redis)
        if result := await self.l2_cache.get(cache_key):
            await self.l1_cache.set(cache_key, result, ttl=300)
            return result
            
        # Execute and cache
        result = await self.execute_tool(tool_name, params)
        await self._cache_result(cache_key, result)
        return result
```

#### Running the Example

```bash
cd examples/arcade-dev/05_cache_integration
python cached_arcade_client.py
```

#### Key Learnings

- **Multi-Level Caching:** Combine memory and persistent caching
- **Cache Keys:** Generate deterministic, collision-resistant keys
- **TTL Strategies:** Implement appropriate time-to-live policies
- **Cache Metrics:** Monitor hit rates and performance impact

## Security Implementation

Secure your integration with proper authentication and authorization.

### Example 6: Secure Tool Execution

**File:** [`06_security/secure_tool_execution.py`](06_security/secure_tool_execution.py)

This example demonstrates:
- JWT-based authentication
- Role-based access control
- API key management
- Secure communication

#### Key Components

```python
class SecurityManager:
    """Manages authentication and authorization for tool execution."""
    
    async def authenticate_request(self, token: str) -> UserContext:
        """Authenticate and authorize a tool execution request."""
        
        # Verify JWT token
        payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
        
        # Load user context
        user_context = await self.load_user_context(payload['user_id'])
        
        # Check permissions
        if not self.has_permission(user_context, 'tool:execute'):
            raise PermissionError("Insufficient permissions")
            
        return user_context
```

#### Running the Example

```bash
cd examples/arcade-dev/06_security
python secure_tool_execution.py
```

#### Key Learnings

- **JWT Tokens:** Use JWT for stateless authentication
- **RBAC:** Implement role-based access control
- **API Security:** Secure API communications with proper headers
- **Audit Logging:** Track security events for compliance

## Monitoring and Observability

Implement comprehensive monitoring for production systems.

### Example 7: Monitoring Integration

**File:** [`08_monitoring/arcade_monitoring.py`](08_monitoring/arcade_monitoring.py)

This example demonstrates:
- Metrics collection and exposition
- Distributed tracing
- Health checks
- Alerting integration

#### Key Components

```python
class MonitoringSystem:
    """Comprehensive monitoring for Arcade.dev integration."""
    
    async def record_tool_execution(self, tool_name: str, duration: float, success: bool):
        """Record tool execution metrics."""
        
        # Update counters
        await self.metrics.increment('tool_executions_total', 
                                   tags={'tool': tool_name, 'success': str(success)})
        
        # Record duration
        await self.metrics.histogram('tool_execution_duration_seconds', 
                                    duration, tags={'tool': tool_name})
        
        # Update health status
        await self.update_health_status(tool_name, success)
```

#### Running the Example

```bash
cd examples/arcade-dev/08_monitoring
python arcade_monitoring.py
```

#### Key Learnings

- **Metrics Collection:** Implement comprehensive metrics for all operations
- **Health Checks:** Create meaningful health and readiness probes
- **Distributed Tracing:** Track requests across service boundaries
- **Alerting:** Set up proactive alerting for system issues

## Advanced Tool Usage

Master sophisticated tool orchestration patterns.

### Example 8: Advanced Tool Orchestration

**File:** [`08_advanced_tools/advanced_tool_usage.py`](08_advanced_tools/advanced_tool_usage.py)

This example demonstrates:
- Tool chaining and workflows
- Conditional execution
- Dynamic tool generation
- Result aggregation

#### Key Components

```python
class AdvancedToolOrchestrator:
    """Advanced tool orchestration with chaining and conditional execution."""
    
    async def execute_tool_chain(self, steps: List[ToolChainStep]) -> ToolOrchestrationResult:
        """Execute a chain of tools with conditional branching."""
        
        context = {}
        results = []
        
        for step in steps:
            # Check execution condition
            if step.condition and not step.condition(context):
                continue
                
            # Execute tool
            result = await self._execute_tool_with_retry(step, context)
            
            # Transform result if needed
            if step.transform:
                result = step.transform(result)
                
            # Update context and results
            context.update(result)
            results.append(result)
            
        return self._aggregate_results(results)
```

#### Running the Example

```bash
cd examples/arcade-dev/08_advanced_tools
python advanced_tool_usage.py
```

#### Key Learnings

- **Tool Chaining:** Create complex workflows from simple tools
- **Conditional Logic:** Implement branching execution paths
- **Dynamic Generation:** Create tools programmatically
- **Result Aggregation:** Combine outputs from multiple tools

## Testing and Validation

Ensure reliability with comprehensive testing strategies.

### Example 9: Integration Testing

**File:** [`09_testing/arcade_integration_tests.py`](09_testing/arcade_integration_tests.py)

This example demonstrates:
- Unit testing for individual components
- Integration testing for end-to-end workflows
- Mock testing for external dependencies
- Performance benchmarking

#### Key Components

```python
class ArcadeIntegrationTestSuite:
    """Comprehensive test suite for Arcade.dev integration."""
    
    async def test_tool_registration(self):
        """Test tool registration functionality."""
        executor = ToolExecutor()
        
        @executor.register_tool("test_tool")
        async def test_tool(param1: str, param2: int = 42) -> Dict[str, Any]:
            return {"result": f"{param1}_{param2}"}
            
        # Verify registration and execution
        assert "test_tool" in executor.tools
        result = await executor.execute("test_tool", {"param1": "hello"})
        assert result["result"] == "hello_42"
```

#### Running the Example

```bash
cd examples/arcade-dev/09_testing
python arcade_integration_tests.py
```

#### Key Learnings

- **Test Structure:** Organize tests for maintainability
- **Mocking:** Use mocks for external dependencies
- **Performance Tests:** Include benchmarks in your test suite
- **Test Fixtures:** Create reusable test utilities

## Production Deployment

Deploy your integration with production-ready patterns.

### Example 10: Production Deployment

**File:** [`10_deployment/production_deployment.py`](10_deployment/production_deployment.py)

This example demonstrates:
- Service initialization and bootstrapping
- Configuration management
- Health checks and readiness probes
- Graceful shutdown
- Resource management

#### Key Components

```python
class ProductionArcadeService:
    """Production-ready Arcade.dev integration service."""
    
    async def initialize(self):
        """Initialize all service components."""
        await self._load_configuration()
        await self._initialize_cache()
        await self._initialize_arcade_client()
        await self._initialize_monitoring()
        await self._start_background_tasks()
        await self._perform_initial_health_checks()
        
        self.is_ready = True
        
    async def shutdown(self):
        """Gracefully shutdown the service."""
        self.shutdown_event.set()
        
        # Cancel background tasks
        for task in self.background_tasks:
            task.cancel()
            
        # Cleanup resources
        await self.cleanup()
```

#### Running the Example

```bash
cd examples/arcade-dev/10_deployment
python production_deployment.py
```

#### Key Learnings

- **Service Lifecycle:** Implement proper initialization and shutdown
- **Configuration:** Use environment variables and config files
- **Health Monitoring:** Provide health and readiness endpoints
- **Resource Management:** Clean up resources properly

## Best Practices

### Configuration Management

1. **Environment Variables:** Use environment variables for sensitive configuration
2. **Configuration Files:** Use YAML/JSON for complex configuration
3. **Validation:** Validate configuration at startup
4. **Defaults:** Provide sensible defaults for all settings

```python
@dataclass
class Config:
    arcade_api_key: str = field(default_factory=lambda: os.getenv("ARCADE_API_KEY", ""))
    arcade_api_url: str = os.getenv("ARCADE_API_URL", "https://api.arcade.dev")
    cache_ttl: int = int(os.getenv("CACHE_TTL", "3600"))
    
    def __post_init__(self):
        if not self.arcade_api_key:
            raise ValueError("ARCADE_API_KEY is required")
```

### Error Handling

1. **Exception Hierarchy:** Create specific exception types
2. **Logging:** Log errors with appropriate context
3. **Recovery:** Implement recovery strategies where possible
4. **User Experience:** Provide meaningful error messages

```python
class ArcadeAPIError(Exception):
    """Base exception for Arcade.dev API errors."""
    pass

class RateLimitError(ArcadeAPIError):
    """Raised when API rate limit is exceeded."""
    
    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded, retry after {retry_after} seconds")
```

### Performance Optimization

1. **Caching:** Cache frequently accessed data
2. **Connection Pooling:** Reuse HTTP connections
3. **Async Operations:** Use async/await for I/O operations
4. **Batching:** Batch API requests where possible

```python
# Good: Use connection pooling
connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
session = aiohttp.ClientSession(connector=connector)

# Good: Batch requests
async def batch_analyze(codes: List[str]) -> List[Dict[str, Any]]:
    tasks = [analyze_code(code) for code in codes]
    return await asyncio.gather(*tasks)
```

### Security Best Practices

1. **API Keys:** Store API keys securely
2. **Input Validation:** Validate all inputs
3. **Rate Limiting:** Implement client-side rate limiting
4. **Audit Logging:** Log security-relevant events

```python
# Good: Secure API key storage
api_key = os.getenv("ARCADE_API_KEY")
if not api_key:
    raise ValueError("ARCADE_API_KEY environment variable required")

# Good: Input validation
def validate_code_input(code: str) -> str:
    if not isinstance(code, str):
        raise ValueError("Code must be a string")
    if len(code) > 100000:  # 100KB limit
        raise ValueError("Code size exceeds maximum allowed")
    return code.strip()
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Problem:** `401 Unauthorized` errors when calling Arcade.dev API

**Solutions:**
- Verify API key is correctly set in environment variables
- Check API key has necessary permissions
- Ensure API key hasn't expired

```bash
# Check if API key is set
echo $ARCADE_API_KEY

# Test API key with curl
curl -H "Authorization: Bearer $ARCADE_API_KEY" https://api.arcade.dev/v1/health
```

#### 2. Connection Timeouts

**Problem:** Requests timing out or failing intermittently

**Solutions:**
- Increase timeout values
- Check network connectivity
- Implement retry logic with exponential backoff

```python
# Increase timeout
client = ArcadeClient(timeout=60)  # 60 seconds

# Implement retry logic
for attempt in range(max_retries):
    try:
        result = await client.make_request(...)
        break
    except asyncio.TimeoutError:
        if attempt < max_retries - 1:
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
        else:
            raise
```

#### 3. Cache Performance Issues

**Problem:** Cache hit rate is low or cache operations are slow

**Solutions:**
- Review cache key generation logic
- Adjust TTL values
- Monitor cache memory usage
- Consider cache warming strategies

```python
# Improve cache key generation
def generate_cache_key(tool_name: str, params: Dict[str, Any]) -> str:
    # Sort params for consistent keys
    sorted_params = json.dumps(params, sort_keys=True)
    key_data = f"{tool_name}:{sorted_params}"
    return hashlib.sha256(key_data.encode()).hexdigest()[:16]
```

#### 4. Memory Leaks

**Problem:** Memory usage increasing over time

**Solutions:**
- Ensure proper cleanup of resources
- Use context managers for connections
- Monitor memory usage in production

```python
# Good: Use context managers
async with ArcadeClient(config) as client:
    result = await client.analyze_code(code)
    # Client automatically cleaned up

# Good: Explicit cleanup
try:
    client = ArcadeClient(config)
    await client.connect()
    result = await client.analyze_code(code)
finally:
    await client.disconnect()
```

### Debugging Tips

1. **Enable Debug Logging:**
```python
logging.basicConfig(level=logging.DEBUG)
```

2. **Use Network Debugging:**
```python
# Log all HTTP requests
import aiohttp_debugtoolbar
session = aiohttp.ClientSession(trace_configs=[aiohttp_debugtoolbar.trace_config])
```

3. **Monitor Metrics:**
```python
# Add timing to operations
start_time = time.time()
result = await operation()
duration = time.time() - start_time
logger.info(f"Operation took {duration:.2f}s")
```

### Performance Monitoring

Use the built-in monitoring to track performance:

```bash
# Check health status
curl http://localhost:8081/health

# View metrics
curl http://localhost:9090/metrics
```

## Conclusion

You've now learned how to:

1. ✅ Set up basic Arcade.dev integration
2. ✅ Register and manage tools
3. ✅ Implement intelligent routing
4. ✅ Handle errors gracefully
5. ✅ Optimize with caching
6. ✅ Secure your integration
7. ✅ Monitor system health
8. ✅ Orchestrate complex workflows
9. ✅ Test comprehensively
10. ✅ Deploy to production

### Next Steps

- Explore the [FACT SDK documentation](../../docs/) for advanced features
- Join the community discussions
- Contribute to the project on GitHub
- Build your own tools and integrations

### Additional Resources

- [Arcade.dev API Documentation](https://docs.arcade.dev)
- [FACT SDK GitHub Repository](https://github.com/your-org/fact-sdk)
- [Example Projects](../README.md)
- [Community Forum](https://community.fact-sdk.dev)

---

**Happy coding with FACT and Arcade.dev! 🚀**