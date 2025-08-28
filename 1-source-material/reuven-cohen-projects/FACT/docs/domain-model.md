# FACT System Domain Model

## 1. Core Domain Entities

### 1.1 Query Processing Domain

#### Query
**Description**: Represents a user's natural language request for information
**Attributes**:
- `query_id`: Unique identifier for tracking
- `user_input`: Raw natural language text
- `timestamp`: When the query was received
- `user_context`: Optional user identification
- `processed_intent`: Extracted intent and parameters

**Relationships**:
- Has one `QueryResponse`
- May trigger multiple `ToolCall` instances
- Associated with `CacheEntry` for optimization

#### QueryResponse
**Description**: The complete response to a user query including metadata
**Attributes**:
- `response_id`: Unique response identifier
- `content`: Generated response text
- `latency_ms`: Total processing time
- `token_cost`: Cost in tokens consumed
- `cache_status`: Hit, miss, or partial
- `confidence_score`: Response reliability metric

**Relationships**:
- Belongs to one `Query`
- Contains multiple `ToolResult` references
- References `CacheEntry` if applicable

### 1.2 Caching Domain

#### CacheEntry
**Description**: Represents cached content and metadata for optimization
**Attributes**:
- `cache_key`: Unique cache identifier (e.g., "fact_v1")
- `prefix_content`: Static cached content (≥500 tokens)
- `created_at`: Cache creation timestamp
- `last_accessed`: Most recent access time
- `access_count`: Number of cache hits
- `size_tokens`: Token count of cached content
- `version`: Cache schema version

**Relationships**:
- Associated with multiple `Query` instances
- Contains `CacheMetrics` for performance tracking

#### CacheMetrics
**Description**: Performance tracking for cache operations
**Attributes**:
- `hit_rate`: Percentage of cache hits
- `average_hit_latency`: Performance for cache hits
- `average_miss_latency`: Performance for cache misses
- `cost_savings`: Token cost reduction achieved
- `total_requests`: Overall request count

**Relationships**:
- Belongs to one `CacheEntry`

### 1.3 Tool Execution Domain

#### Tool
**Description**: Represents an executable function available through Arcade
**Attributes**:
- `tool_name`: Unique tool identifier (e.g., "SQL.QueryReadonly")
- `description`: Human-readable tool purpose
- `parameters`: Input parameter schema
- `return_schema`: Expected output structure
- `is_authenticated`: Requires user authorization
- `scopes`: Required permission scopes
- `version`: Tool version identifier

**Relationships**:
- Has multiple `ToolCall` executions
- Belongs to one `ToolRegistry`
- May require `AuthorizationFlow`

#### ToolCall
**Description**: A specific invocation of a tool with parameters
**Attributes**:
- `call_id`: Unique execution identifier
- `tool_name`: Reference to executed tool
- `arguments`: Input parameters as JSON
- `user_id`: User context for execution
- `status`: Pending, executing, completed, failed
- `execution_time_ms`: Call duration
- `created_at`: When call was initiated

**Relationships**:
- Belongs to one `Tool`
- Produces one `ToolResult`
- Part of one `Query` execution
- May require `Authorization`

#### ToolResult
**Description**: The output from a tool execution
**Attributes**:
- `result_id`: Unique result identifier
- `call_id`: Reference to originating call
- `output_data`: Structured result data
- `status_code`: Success/error indicator
- `error_message`: Error details if failed
- `data_size`: Size of returned data
- `format`: JSON, text, binary, etc.

**Relationships**:
- Belongs to one `ToolCall`
- Referenced by `QueryResponse`

### 1.4 Security Domain

#### Authorization
**Description**: User permission to execute specific tools
**Attributes**:
- `auth_id`: Unique authorization identifier
- `user_id`: User being authorized
- `tool_name`: Tool being accessed
- `scopes`: Granted permission scopes
- `expires_at`: Authorization expiration
- `is_active`: Current authorization status

**Relationships**:
- Associated with `User`
- Required for protected `Tool` executions
- Managed through `AuthorizationFlow`

#### AuthorizationFlow
**Description**: OAuth-style authorization process
**Attributes**:
- `flow_id`: Unique flow identifier
- `authorization_url`: User authorization URL
- `state`: Flow state (pending, completed, failed)
- `callback_received`: Whether callback was processed
- `expires_at`: Flow expiration time

**Relationships**:
- Results in `Authorization` if successful
- Associated with specific `Tool` access

#### User
**Description**: System user with tool access permissions
**Attributes**:
- `user_id`: Unique user identifier
- `email`: User email address
- `created_at`: Account creation time
- `last_active`: Most recent activity
- `permission_level`: Access level designation

**Relationships**:
- Has multiple `Authorization` records
- Associated with `Query` instances
- References in `ToolCall` executions

### 1.5 Data Access Domain

#### DataSource
**Description**: External data system accessible through tools
**Attributes**:
- `source_id`: Unique source identifier
- `source_type`: Database, API, file system, etc.
- `connection_string`: Access configuration
- `is_readonly`: Write permission flag
- `schema_version`: Data structure version
- `health_status`: Current availability status

**Relationships**:
- Accessed by multiple `Tool` instances
- Contains multiple `DataTable` entities

#### DataTable
**Description**: Structured data within a data source
**Attributes**:
- `table_name`: Table identifier
- `source_id`: Parent data source
- `columns`: Column definitions and types
- `row_count`: Approximate record count
- `last_updated`: Most recent modification
- `access_permissions`: Read/write constraints

**Relationships**:
- Belongs to one `DataSource`
- Referenced in `SQLQuery` operations

#### SQLQuery
**Description**: Specific database query execution
**Attributes**:
- `query_id`: Unique query identifier
- `statement`: SQL query text
- `table_names`: Referenced tables
- `execution_time_ms`: Query duration
- `row_count`: Results returned
- `is_valid`: Syntax validation status

**Relationships**:
- References multiple `DataTable` instances
- Executed as part of `ToolCall`

## 2. Domain Relationships

### 2.1 Query Processing Flow
```
User → Query → CacheEntry (check) → ToolCall → ToolResult → QueryResponse
```

### 2.2 Tool Execution Flow
```
Tool → ToolCall → Authorization (if required) → DataSource → ToolResult
```

### 2.3 Caching Flow
```
Query → CacheEntry (lookup) → CacheMetrics (update) → QueryResponse
```

## 3. Business Rules

### 3.1 Cache Management Rules
- Cache entries MUST contain ≥500 tokens to be effective
- Cache keys MUST be deterministic and version-specific
- Cache hits MUST reduce latency to ≤50ms
- Cache content MUST be immutable once written

### 3.2 Tool Execution Rules
- All tool calls MUST be validated before execution
- SQL queries MUST be read-only (SELECT statements only)
- Tool results MUST be structured JSON format
- Failed tool calls MUST return descriptive error messages

### 3.3 Security Rules
- Users MUST be authorized before executing protected tools
- All tool arguments MUST be validated and sanitized
- Authorization tokens MUST have expiration times
- Audit logs MUST be maintained for all tool executions

### 3.4 Performance Rules
- Tool execution MUST complete within 10ms for LAN calls
- Cache misses MUST not exceed 140ms total latency
- Token costs MUST be tracked and optimized
- Error rates MUST remain below 0.5%

## 4. Data Validation Rules

### 4.1 Input Validation
- User queries MUST be non-empty strings
- Tool parameters MUST match defined schemas
- SQL statements MUST pass syntax validation
- User IDs MUST follow established format patterns

### 4.2 Output Validation
- Tool results MUST be valid JSON structures
- Response content MUST be sanitized for security
- Error messages MUST not expose sensitive information
- Latency metrics MUST be positive numbers

### 4.3 State Validation
- Cache entries MUST have valid creation timestamps
- Authorization states MUST be one of defined values
- Tool call statuses MUST follow state machine rules
- Data source health MUST be verified before access

## 5. Domain Events

### 5.1 Query Events
- `QueryReceived`: New user query entered system
- `CacheHit`: Query satisfied from cache
- `CacheMiss`: Query requires fresh processing
- `QueryCompleted`: Response generated and returned

### 5.2 Tool Events
- `ToolRegistered`: New tool added to registry
- `ToolCallInitiated`: Tool execution started
- `ToolCallCompleted`: Tool execution finished
- `ToolAuthorizationRequired`: User authorization needed

### 5.3 Cache Events
- `CacheEntryCreated`: New cache entry established
- `CacheEntryAccessed`: Existing cache entry used
- `CacheEntryExpired`: Cache entry invalidated
- `CachePerformanceUpdated`: Metrics recalculated

### 5.4 Security Events
- `AuthorizationGranted`: User granted tool access
- `AuthorizationRevoked`: User access removed
- `UnauthorizedAccess`: Attempted unauthorized tool use
- `SecurityViolation`: Policy violation detected

## 6. Domain Aggregates

### 6.1 Query Aggregate
**Root**: Query  
**Entities**: QueryResponse, ToolCall, ToolResult  
**Value Objects**: QueryMetrics, LatencyData  
**Invariants**: Each query must have exactly one response

### 6.2 Cache Aggregate
**Root**: CacheEntry  
**Entities**: CacheMetrics  
**Value Objects**: CacheKey, TokenCount  
**Invariants**: Cache entries must maintain consistency

### 6.3 Tool Aggregate
**Root**: Tool  
**Entities**: ToolCall, ToolResult  
**Value Objects**: ToolSchema, ExecutionMetrics  
**Invariants**: Tool calls must reference valid tools

### 6.4 Authorization Aggregate
**Root**: User  
**Entities**: Authorization, AuthorizationFlow  
**Value Objects**: Scope, Permission  
**Invariants**: Active authorizations must not be expired

## 7. Domain Services

### 7.1 QueryProcessingService
**Purpose**: Orchestrate query resolution through cache and tools
**Operations**:
- `processQuery(query)`: Main query processing logic
- `checkCache(queryHash)`: Cache lookup operation
- `executeTools(toolCalls)`: Tool execution coordination

### 7.2 CacheManagementService
**Purpose**: Optimize cache usage and performance
**Operations**:
- `updateCacheMetrics()`: Performance tracking
- `invalidateExpiredEntries()`: Cache cleanup
- `optimizeCacheStrategy()`: Performance tuning

### 7.3 ToolRegistrationService
**Purpose**: Manage tool lifecycle and discovery
**Operations**:
- `registerTool(toolDef)`: Add new tool to registry
- `exportSchemas()`: Generate tool schemas for Claude
- `validateToolCall(call)`: Ensure call validity

### 7.4 AuthorizationService
**Purpose**: Manage user permissions and security
**Operations**:
- `authorizeUser(userId, toolName)`: Grant access
- `validatePermissions(call)`: Check authorization
- `revokeAccess(userId, toolName)`: Remove permissions