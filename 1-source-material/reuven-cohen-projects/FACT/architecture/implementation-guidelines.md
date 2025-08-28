# FACT System Implementation Guidelines

## 1. Core Implementation Principles

### 1.1 Performance-First Approach

The FACT system's primary differentiator is its sub-100ms response time. All implementation decisions must be evaluated against this requirement.

- **Asynchronous Processing**: Use `async/await` throughout the codebase for non-blocking I/O
- **Memory Optimization**: Minimize object creation and copying in critical paths
- **Connection Pooling**: Reuse database and API connections
- **Lazy Loading**: Defer resource-intensive operations until needed
- **Early Returns**: Exit functions early when possible to avoid unnecessary processing

### 1.2 Deterministic Design

The system must provide consistent, deterministic responses for identical queries.

- **Cache Control**: Implement precise cache key generation
- **Tool Call Consistency**: Ensure tools return identical results for identical inputs
- **Error Handling**: Maintain consistent error responses and recovery
- **State Management**: Minimize stateful operations and clearly document state lifecycles
- **Logging**: Log all non-deterministic factors for debugging

### 1.3 Security-First Implementation

Security cannot be an afterthought and must be built into every component.

- **Input Validation**: Validate all inputs before processing
- **Output Sanitization**: Sanitize all outputs to prevent information leakage
- **Least Privilege**: Components should only have access to necessary resources
- **Secure Defaults**: Default configurations should be secure
- **Audit Logging**: Log all security-relevant events

### 1.4 Modular Design Patterns

Follow established design patterns to maintain modularity and extensibility.

- **Dependency Injection**: Use DI to decouple component implementations
- **Interface-Based Design**: Define clear interfaces between components
- **Factory Pattern**: Use factories for component creation and configuration
- **Strategy Pattern**: Implement interchangeable algorithms (e.g., caching strategies)
- **Observer Pattern**: Use events for loose coupling between components

## 2. Component Implementation Guidelines

### 2.1 FACT Driver (`src/core/driver.py`)

The driver is the central orchestrator and should be implemented with careful attention to performance and reliability.

**Key Responsibilities:**
- Query processing coordination
- Cache control management
- Tool execution orchestration
- Error handling and recovery

**Implementation Guidelines:**
- Implement as a class with clear lifecycle methods (initialize, process_query, shutdown)
- Use dependency injection for cache, tool, and Claude clients
- Implement a retry mechanism with exponential backoff
- Maintain a clean separation between query processing and tool execution
- Include telemetry points for performance monitoring

**Example Implementation Structure:**
```python
class FACTDriver:
    def __init__(self, cache_manager, tool_registry, claude_client, config):
        self.cache_manager = cache_manager
        self.tool_registry = tool_registry
        self.claude_client = claude_client
        self.config = config
        self.logger = setup_logger("fact_driver")
        
    async def process_query(self, query_text, user_id=None, context=None):
        # 1. Start performance tracking
        # 2. Prepare messages with cache control
        # 3. Send to Claude
        # 4. Handle tool calls if needed
        # 5. Return response and performance metrics
        
    async def execute_tools(self, tool_calls):
        # Process tool calls through Arcade
        
    def get_tool_schema(self):
        # Get tool schemas from registry
        
    def setup_cache(self, prefix):
        # Configure cache with given prefix
```

### 2.2 Cache Management System (`src/cache/manager.py`)

The cache system is critical for achieving sub-100ms responses and must be optimized for read performance.

**Key Responsibilities:**
- Cache key generation
- Cache control implementation
- Cache metrics collection
- Cache warming strategies

**Implementation Guidelines:**
- Use a deterministic algorithm for cache key generation
- Implement cache prefixes ≥500 tokens as specified
- Keep cache entries immutable once written
- Implement metrics for hit rate, latency, and cost savings
- Add cache warming capability for common queries

**Example Implementation Structure:**
```python
class CacheManager:
    def __init__(self, config):
        self.config = config
        self.prefix = config.get("cache_prefix", "fact_v1")
        self.metrics = CacheMetrics()
        self.logger = setup_logger("cache_manager")
        
    def get_cache_control(self, mode="read"):
        # Return cache control dictionary for Claude
        return {
            "mode": mode,
            "prefix": self.prefix
        }
        
    def generate_cache_key(self, query_text):
        # Generate deterministic cache key
        
    async def warm_cache(self, common_queries):
        # Pre-populate cache with common queries
        
    def update_metrics(self, cache_status, latency, token_count):
        # Update performance metrics
        
    def get_metrics(self):
        # Return current cache performance metrics
```

### 2.3 Tool Management System (`src/tools/registry.py`, `src/tools/executor.py`)

The tool system must be extensible while maintaining security and performance.

**Key Responsibilities:**
- Tool registration and discovery
- Schema generation for Claude
- Tool execution and result handling
- Parameter validation

**Implementation Guidelines:**
- Use decorators for tool definitions
- Implement strict parameter validation
- Add timeout controls for tool execution
- Implement schema caching to avoid regeneration
- Build in security checks for tool execution

**Example Implementation Structure:**
```python
class ToolRegistry:
    def __init__(self):
        self.tools = {}
        self.schema_cache = None
        self.logger = setup_logger("tool_registry")
        
    def register_tool(self, tool_definition):
        # Register tool and validate definition
        
    def get_tool(self, tool_name):
        # Retrieve tool by name
        
    def get_all_tools(self):
        # Return all registered tools
        
    def export_schema(self):
        # Generate Claude-compatible schema
        if self.schema_cache is None:
            self.schema_cache = self._generate_schema()
        return self.schema_cache
        
class ToolExecutor:
    def __init__(self, tool_registry, arcade_client, security_manager):
        self.tool_registry = tool_registry
        self.arcade_client = arcade_client
        self.security_manager = security_manager
        self.logger = setup_logger("tool_executor")
        
    async def execute_tool(self, tool_name, arguments, user_id=None):
        # 1. Validate tool exists
        # 2. Validate arguments
        # 3. Check authorization if needed
        # 4. Execute through Arcade
        # 5. Format and return result
```

### 2.4 Arcade Integration (`src/arcade/client.py`)

The Arcade integration layer should be resilient and handle communication with the gateway efficiently.

**Key Responsibilities:**
- Gateway connection management
- Tool execution requests
- Authentication and authorization
- Error handling and retries

**Implementation Guidelines:**
- Implement a wrapper around the Arcade SDK
- Add connection pooling to minimize connection overhead
- Implement circuit breaker pattern for fault tolerance
- Add detailed logging for troubleshooting
- Implement request/response serialization

**Example Implementation Structure:**
```python
class ArcadeClient:
    def __init__(self, api_key, base_url=None):
        self.client = self._initialize_client(api_key, base_url)
        self.logger = setup_logger("arcade_client")
        
    def _initialize_client(self, api_key, base_url):
        # Create and configure Arcade client
        
    async def execute_tool(self, tool_name, user_id, arguments):
        # Execute tool through Arcade gateway
        
    async def upload_tool(self, tool_definition):
        # Register tool with Arcade
        
    def export_schema(self):
        # Export tool schemas for Claude
```

### 2.5 Security Components (`src/security/auth.py`, `src/security/validation.py`)

Security components should implement defense in depth while maintaining performance.

**Key Responsibilities:**
- Authentication and authorization
- Input validation
- Output sanitization
- Audit logging
- Rate limiting

**Implementation Guidelines:**
- Implement OAuth 2.0 for tool authorization
- Add strict input validation for all parameters
- Sanitize all outputs to prevent information disclosure
- Log all security events with correlation IDs
- Implement rate limiting for abuse prevention

**Example Implementation Structure:**
```python
class SecurityManager:
    def __init__(self, config):
        self.config = config
        self.oauth_provider = OAuthProvider(config)
        self.logger = setup_logger("security_manager")
        
    def validate_input(self, input_data, schema):
        # Validate input against schema
        
    def sanitize_output(self, output_data, rules):
        # Sanitize output to prevent information leakage
        
    def authorize_tool_execution(self, user_id, tool_name, scopes):
        # Check authorization for tool execution
        
    def log_security_event(self, event_type, details, severity="INFO"):
        # Log security-relevant event
```

## 3. Performance Optimization Guidelines

### 3.1 Latency Critical Path

The critical path for query processing must be optimized to meet latency targets:
- **Cache Hit Path**: ≤50ms total latency
- **Cache Miss Path**: ≤140ms total latency
- **Tool Execution**: ≤10ms for LAN tool calls

**Optimization Techniques:**
1. **Minimize Network Roundtrips**: Batch operations where possible
2. **Connection Pooling**: Reuse connections to external services
3. **Asynchronous Processing**: Use non-blocking I/O throughout
4. **Memory Management**: Minimize object creation in hot paths
5. **Caching**: Cache expensive computations and lookups
6. **Query Optimization**: Optimize database queries with proper indexes

### 3.2 Cache Optimization

Cache is the key to achieving sub-100ms responses.

**Cache Implementation Strategy:**
1. **Size Optimization**: Ensure cache prefixes are ≥500 tokens
2. **Key Generation**: Use deterministic algorithms for cache keys
3. **Cache Warming**: Pre-populate cache with common queries
4. **Monitoring**: Track hit rates and adjust strategies
5. **Invalidation**: Implement targeted cache invalidation
6. **Metrics**: Collect detailed metrics on cache performance

### 3.3 Concurrency Handling

The system must handle concurrent requests efficiently.

**Concurrency Implementation Strategy:**
1. **Async/Await**: Use Python's async/await throughout
2. **Resource Pools**: Implement connection pooling
3. **Thread Safety**: Ensure thread-safe operations for shared resources
4. **Backpressure**: Implement backpressure mechanisms for overload scenarios
5. **Graceful Degradation**: Degrade gracefully under high load

## 4. Security Implementation Guidelines

### 4.1 Authentication and Authorization

Implement a multi-layered security approach.

**Implementation Strategy:**
1. **API Key Management**: Secure storage and rotation
2. **OAuth Integration**: Support for external authorization
3. **Scope-Based Access**: Granular permission control
4. **Token Validation**: Regular validation of authentication tokens
5. **Session Management**: Secure session handling

### 4.2 Input/Output Security

All inputs and outputs must be validated and sanitized.

**Implementation Strategy:**
1. **Schema Validation**: Validate all inputs against schemas
2. **SQL Injection Prevention**: Use parameterized queries
3. **Path Traversal Prevention**: Validate file paths
4. **Output Sanitization**: Prevent information disclosure
5. **Content Security**: Implement content security policies

### 4.3 Security Monitoring

Implement comprehensive security monitoring.

**Implementation Strategy:**
1. **Audit Logging**: Log all security-relevant events
2. **Correlation IDs**: Track requests across components
3. **Anomaly Detection**: Detect unusual patterns
4. **Rate Limiting**: Prevent abuse through rate limiting
5. **Security Metrics**: Collect security performance metrics

## 5. Testing Strategy

### 5.1 Unit Testing

Each component should have comprehensive unit tests.

**Implementation Strategy:**
1. **Test Coverage**: Aim for ≥95% code coverage
2. **Mocking**: Use dependency injection for testability
3. **Parameterized Tests**: Test boundary conditions
4. **Error Cases**: Test all error scenarios
5. **Performance Tests**: Include performance assertions

### 5.2 Integration Testing

Validate component interactions through integration tests.

**Implementation Strategy:**
1. **Component Integration**: Test pairs of components
2. **External Service Mocking**: Mock Arcade and Claude
3. **Database Testing**: Use in-memory databases
4. **Error Scenarios**: Test system recovery
5. **Configuration Testing**: Test different configurations

### 5.3 Performance Testing

Validate performance requirements through dedicated tests.

**Implementation Strategy:**
1. **Latency Testing**: Measure response times
2. **Throughput Testing**: Test concurrent operations
3. **Endurance Testing**: Test system stability over time
4. **Resource Utilization**: Monitor CPU, memory, and I/O
5. **Benchmarking**: Compare against requirements

### 5.4 Security Testing

Validate security implementation through dedicated tests.

**Implementation Strategy:**
1. **Penetration Testing**: Test attack vectors
2. **Vulnerability Scanning**: Use automated tools
3. **Dependency Checking**: Validate dependencies
4. **Input Fuzzing**: Test with malformed inputs
5. **Authorization Testing**: Verify access controls

## 6. Implementation Priorities

To ensure a structured development approach, implement components in the following order:

1. **Core Infrastructure** (Week 1)
   - Basic driver skeleton
   - Configuration management
   - Logging setup

2. **Cache Framework** (Week 2)
   - Cache management system
   - Basic metrics

3. **Tool Integration** (Weeks 3-4)
   - Tool registration
   - Basic SQL tool
   - Arcade integration

4. **Performance Optimization** (Weeks 5-6)
   - Cache optimization
   - Latency tuning
   - Concurrency handling

5. **Security Implementation** (Weeks 7-8)
   - Authentication and authorization
   - Input/output security
   - Security monitoring

6. **Testing and Validation** (Weeks 9-10)
   - Test suite completion
   - Performance validation
   - Security validation

7. **Deployment and Monitoring** (Weeks 11-12)
   - Production deployment
   - Monitoring setup
   - Documentation

## 7. Key Success Metrics

Implementation success should be measured against these key metrics:

1. **Performance**
   - Cache hit latency: ≤50ms
   - Cache miss latency: ≤140ms
   - Tool execution latency: ≤10ms

2. **Cost Efficiency**
   - Cache hit cost reduction: 90%
   - Cache miss cost reduction: 65%

3. **Reliability**
   - System uptime: ≥99.9%
   - Tool execution success rate: ≥99.5%

4. **Security**
   - Vulnerability count: 0 critical/high
   - Input validation coverage: 100%
   - Audit logging coverage: 100%

5. **Code Quality**
   - Unit test coverage: ≥95%
   - Integration test coverage: ≥90%
   - Security test coverage: ≥95%