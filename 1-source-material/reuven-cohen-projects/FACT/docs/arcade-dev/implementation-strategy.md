
## Common Use Cases and Implementation

### Use Case 1: Data Processing Pipeline

**Scenario**: Process large datasets using arcade.dev for heavy computation while keeping orchestration local.

```python
async def process_dataset_pipeline(data_source: str, processing_options: dict):
    """Process dataset with hybrid execution."""
    
    # Step 1: Load data locally (fast, no network overhead)
    data = await gateway.execute_tool(
        tool_name="load_dataset",
        arguments={"source": data_source},
        local_function=local_data_loader
    )
    
    # Step 2: Heavy processing on arcade.dev
    processed_data = await gateway.execute_tool(
        tool_name="process_large_dataset",
        arguments={
            "data": data["result"], 
            "options": processing_options
        }
        # No local_function = forces arcade execution
    )
    
    # Step 3: Generate report locally
    report = await gateway.execute_tool(
        tool_name="generate_report",
        arguments={"processed_data": processed_data["data"]},
        local_function=local_report_generator
    )
    
    return report
```

### Use Case 2: ML Model Inference

**Scenario**: Run ML models on arcade.dev while handling input/output locally.

```python
class MLInferenceService:
    """ML inference service using arcade.dev."""
    
    def __init__(self, gateway: ArcadeGateway):
        self.gateway = gateway
        self.model_cache = {}
    
    async def predict(self, model_name: str, input_data: dict):
        """Run prediction with caching."""
        
        # Preprocess input locally
        preprocessed = await self._preprocess_input(input_data)
        
        # Run inference on arcade.dev
        prediction = await self.gateway.execute_tool(
            tool_name=f"ml_model_{model_name}",
            arguments={"input": preprocessed},
            timeout=60  # Longer timeout for ML
        )
        
        # Postprocess output locally
        result = await self._postprocess_output(prediction["data"])
        
        return result
    
    async def _preprocess_input(self, input_data: dict):
        """Local preprocessing logic."""
        # Implement preprocessing
        return input_data
    
    async def _postprocess_output(self, prediction: dict):
        """Local postprocessing logic."""
        # Implement postprocessing
        return prediction
```

### Use Case 3: API Integration with Fallback

**Scenario**: Call external APIs through arcade.dev with local fallback for basic functionality.

```python
async def fetch_external_data(api_endpoint: str, params: dict):
    """Fetch data with arcade.dev and local fallback."""
    
    def local_fallback(api_endpoint: str, params: dict):
        """Simple local HTTP client as fallback."""
        import requests
        response = requests.get(api_endpoint, params=params, timeout=10)
        return {"data": response.json(), "status": response.status_code}
    
    try:
        # Try arcade.dev first (handles rate limiting, retries, etc.)
        result = await gateway.execute_tool(
            tool_name="external_api_client",
            arguments={"endpoint": api_endpoint, "params": params},
            local_function=local_fallback,
            timeout=30
        )
        
        return result["data"]
        
    except Exception as e:
        logger.error("External API call failed", error=str(e))
        raise
```

---

## Best Practices and Pitfalls

### Best Practices

#### 1. Smart Routing Strategy

```python
# ✅ Good: Tool-specific routing logic
def determine_execution_method(tool_name: str, data_size: int, complexity: str):
    """Intelligent routing based on tool characteristics."""
    
    # CPU-intensive tools -> Arcade
    if complexity == "high" or data_size > 1000000:
        return "arcade"
    
    # Simple tools -> Local
    if tool_name.startswith("util_") or complexity == "low":
        return "local"
    
    # Default to local with arcade fallback
    return "local_with_fallback"
```

#### 2. Graceful Error Handling

```python
# ✅ Good: Comprehensive error handling
async def robust_tool_execution(tool_name: str, arguments: dict):
    """Execute tool with robust error handling."""
    
    try:
        result = await gateway.execute_tool(tool_name, arguments)
        return result
        
    except ArcadeTimeoutError:
        # Timeout -> Try with reduced dataset
        logger.warning("Arcade timeout, retrying with reduced data")
        reduced_args = reduce_data_size(arguments)
        return await gateway.execute_tool(tool_name, reduced_args)
        
    except ArcadeConnectionError:
        # Connection issue -> Force local execution
        logger.warning("Arcade connection failed, forcing local execution")
        return await execute_locally(tool_name, arguments)
        
    except Exception as e:
        # Unknown error -> Log and provide user-friendly message
        logger.error("Tool execution failed", tool=tool_name, error=str(e))
        raise ToolExecutionError(f"Tool '{tool_name}' failed: {str(e)}")
```

### Common Pitfalls to Avoid

#### 1. Authentication Issues

```python
# ❌ Bad: Hardcoded API keys
arcade_client = ArcadeClient(api_key="sk-123456789")

# ✅ Good: Environment-based configuration
arcade_client = ArcadeClient(api_key=os.getenv('ARCADE_API_KEY'))

# ✅ Better: Validation and fallback
api_key = os.getenv('ARCADE_API_KEY')
if not api_key:
    logger.warning("No Arcade API key found, arcade features disabled")
    arcade_client = None
else:
    arcade_client = ArcadeClient(api_key=api_key)
```

#### 2. Timeout Mismanagement

```python
# ❌ Bad: Fixed timeouts for all tools
result = await arcade_client.execute_tool("any_tool", args, timeout=30)

# ✅ Good: Tool-specific timeouts
TOOL_TIMEOUTS = {
    "quick_analysis": 10,
    "data_processing": 120,
    "ml_training": 3600,
    "default": 30
}

timeout = TOOL_TIMEOUTS.get(tool_name, TOOL_TIMEOUTS["default"])
result = await arcade_client.execute_tool(tool_name, args, timeout=timeout)
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Connection Failures

**Symptoms**:
- `ArcadeConnectionError` exceptions
- Tools failing to execute on arcade.dev
- Intermittent connectivity issues

**Diagnosis**:
```python
async def diagnose_connection():
    """Diagnose arcade.dev connectivity issues."""
    
    # Test basic connectivity
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get('https://api.arcade.dev/health') as resp:
                print(f"Arcade API reachable: {resp.status == 200}")
    except Exception as e:
        print(f"Network connectivity issue: {e}")
    
    # Test authentication
    try:
        client = ArcadeClient(api_key=os.getenv('ARCADE_API_KEY'))
        await client.connect()
        print("Authentication successful")
        await client.close()
    except ArcadeAuthenticationError:
        print("Authentication failed - check API key")
    except Exception as e:
        print(f"Connection failed: {e}")
```

**Solutions**:
1. **Check API Key**: Verify `ARCADE_API_KEY` is set correctly
2. **Network Configuration**: Ensure firewall allows HTTPS outbound connections
3. **Retry Logic**: Implement exponential backoff for transient failures
4. **Fallback**: Enable local execution fallback

#### Issue 2: Tool Registration Failures

**Symptoms**:
- `ArcadeRegistrationError` exceptions
- Tools not appearing in arcade.dev dashboard
- Version conflicts

**Solutions**:
1. **Validate Tool Definition**: Ensure all required fields are present
2. **Check Naming**: Tool names must be unique and follow naming conventions
3. **Version Management**: Use semantic versioning and increment for updates
4. **Permissions**: Verify API key has tool registration permissions

#### Issue 3: Execution Timeouts

**Symptoms**:
- `ArcadeTimeoutError` exceptions
- Long-running tools being terminated
- Inconsistent execution times

**Solutions**:
1. **Adjust Timeouts**: Set realistic timeouts based on tool complexity
2. **Optimize Tools**: Reduce computational complexity or data size
3. **Chunking**: Split large operations into smaller chunks
4. **Progress Monitoring**: Implement progress callbacks for long operations

### Debugging Tools and Techniques

#### Enable Debug Logging

```python
import structlog
import logging

# Configure detailed logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Set debug level for arcade components
logging.getLogger("src.arcade").setLevel(logging.DEBUG)
```

#### Health Check Endpoint

```python
async def comprehensive_health_check():
    """Comprehensive system health check."""
    
    health_status = {
        "arcade_connectivity": False,
        "tool_registry": False,
        "cache_system": False,
        "gateway_routing": False,
        "errors": []
    }
    
    try:
        # Test arcade connectivity
        client = ArcadeClient(api_key=os.getenv('ARCADE_API_KEY'))
        await client.connect()
        health_status["arcade_connectivity"] = True
        await client.close()
    except Exception as e:
        health_status["errors"].append(f"Arcade connectivity: {str(e)}")
    
    try:
        # Test gateway routing
        gateway_health = await gateway.health_check()
        health_status["gateway_routing"] = gateway_health["gateway_healthy"]
    except Exception as e:
        health_status["errors"].append(f"Gateway routing: {str(e)}")
    
    return health_status
```

---

## Summary

This implementation strategy provides a comprehensive approach to integrating arcade.dev with the FACT SDK:

1. **Foundational Integration**: Leverage existing [`ArcadeClient`](../../src/arcade/client.py) and [`ArcadeGateway`](../../src/arcade/gateway.py) components
2. **Hybrid Execution**: Intelligent routing between local and remote execution based on tool characteristics
3. **Configuration Management**: Environment-based configuration with validation and security best practices
4. **Error Handling**: Robust error handling with graceful fallback mechanisms
5. **Performance Optimization**: Caching strategies and timeout management for optimal performance
6. **Monitoring**: Comprehensive health checks and debugging capabilities

The integration enables FACT applications to seamlessly scale from local development to cloud-based production environments while maintaining reliability and security.

For additional support, refer to:
- [FACT Core Documentation](../5_api_reference.md)
- [FACT Cache System Guide](../cache_resilience_guide.md)
- [Arcade.dev Official Documentation](https://docs.arcade.dev)