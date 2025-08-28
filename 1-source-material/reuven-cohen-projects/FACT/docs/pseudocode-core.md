# FACT System Core Pseudocode

## 1. Main Driver Module (`driver.py`)

### 1.1 Initialization and Configuration
```pseudocode
MODULE FactDriver

// TEST: Verify environment configuration loads correctly
FUNCTION initialize_system():
    LOAD environment variables from .env file
    VALIDATE required API keys are present
    
    // Initialize API clients
    anthropic_client = CREATE AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    arcade_client = CREATE Arcade(api_key=ARCADE_API_KEY, base_url=ARCADE_URL)
    
    // Cache configuration
    cache_prefix = "fact_v1"
    system_prompt = "You are a deterministic finance assistant. When uncertain, request data via tools."
    
    RETURN (anthropic_client, arcade_client, cache_prefix, system_prompt)

// TEST: Configuration validation catches missing keys
FUNCTION validate_configuration():
    required_keys = ["ANTHROPIC_API_KEY", "ARCADE_API_KEY"]
    FOR each key IN required_keys:
        IF key NOT IN environment:
            RAISE ConfigurationError("Missing required key: " + key)
    
    // Validate API connectivity
    TRY:
        TEST anthropic_client connection
        TEST arcade_client connection
    CATCH connection_error:
        RAISE ConnectionError("Failed to connect to required services")

// TEST: Tool schema export returns valid schemas
FUNCTION get_tool_schemas():
    IF tools_schema_cache IS NULL:
        tools_schema_cache = arcade_client.tools.export_schema()
        VALIDATE schema format is correct
    RETURN tools_schema_cache
```

### 1.2 Query Processing Engine
```pseudocode
// TEST: Query processing handles both cache hits and misses
ASYNC FUNCTION process_user_query(user_input: String):
    query_id = GENERATE unique identifier
    start_time = CURRENT timestamp
    
    // Prepare message for Claude
    messages = [
        {
            "role": "user",
            "content": user_input
        }
    ]
    
    // Initial query with cache control
    response = AWAIT anthropic_client.messages.create(
        model="claude-3.5-sonnet-4",
        system=system_prompt,
        messages=messages,
        tools=get_tool_schemas(),
        cache_control={"mode": "read", "prefix": cache_prefix}
    )
    
    // Handle tool calls if needed
    IF response.tool_calls EXISTS:
        tool_results = AWAIT execute_tool_calls(response.tool_calls)
        messages.EXTEND(tool_results)
        
        // Get final response with tool results
        response = AWAIT anthropic_client.messages.create(
            model="claude-3.5-sonnet-4",
            messages=messages,
            cache_control={"mode": "read", "prefix": cache_prefix}
        )
    
    // Calculate performance metrics
    end_time = CURRENT timestamp
    latency = end_time - start_time
    
    // Log performance data
    LOG query performance metrics
    
    RETURN response.content

// TEST: Tool call execution handles success and failure cases
ASYNC FUNCTION execute_tool_calls(tool_calls: List[ToolCall]):
    tool_messages = []
    
    FOR each call IN tool_calls:
        TRY:
            // Execute tool through Arcade
            result = arcade_client.tools.execute(
                tool_name=call.name,
                user_id="fact_demo",
                arguments=JSON.parse(call.arguments)
            )
            
            // Format result message
            tool_message = {
                "role": "tool",
                "tool_call_id": call.id,
                "content": JSON.stringify(result)
            }
            
        CATCH execution_error:
            // Handle tool execution failure
            error_message = {
                "role": "tool",
                "tool_call_id": call.id,
                "content": JSON.stringify({
                    "error": "Tool execution failed",
                    "details": execution_error.message
                })
            }
            tool_message = error_message
            LOG tool execution error
        
        tool_messages.APPEND(tool_message)
    
    RETURN tool_messages
```

### 1.3 Interactive CLI Interface
```pseudocode
// TEST: CLI handles user input and graceful shutdown
ASYNC FUNCTION run_interactive_cli():
    PRINT "FACT demo. Ask a question. Ctrl+C to exit."
    
    WHILE TRUE:
        TRY:
            user_input = INPUT "\n> "
            
            IF user_input.TRIM() IS EMPTY:
                CONTINUE
            
            // Process query and display response
            response = AWAIT process_user_query(user_input)
            PRINT "\n" + response
            
        CATCH (EOFError, KeyboardInterrupt):
            PRINT "\nGoodbye!"
            EXIT gracefully
            
        CATCH unexpected_error:
            PRINT "Error processing query: " + unexpected_error.message
            LOG error details
            CONTINUE loop

// TEST: Main entry point initializes system correctly
ASYNC FUNCTION main():
    TRY:
        initialize_system()
        validate_configuration()
        AWAIT run_interactive_cli()
    CATCH configuration_error:
        PRINT "Configuration error: " + configuration_error.message
        EXIT with error code
    CATCH system_error:
        PRINT "System error: " + system_error.message
        LOG error details
        EXIT with error code
```

## 2. Cache Management Module

### 2.1 Cache Control Logic
```pseudocode
MODULE CacheManager

// TEST: Cache initialization creates proper cache entries
FUNCTION initialize_cache(prefix: String, content: String):
    VALIDATE prefix length >= 500 tokens
    VALIDATE content is immutable documentation
    
    cache_entry = {
        "prefix": prefix,
        "content": content,
        "created_at": CURRENT timestamp,
        "token_count": COUNT tokens in content,
        "version": EXTRACT version from prefix
    }
    
    // Write cache with initial content
    cache_control = {
        "mode": "write",
        "prefix": prefix
    }
    
    RETURN cache_entry

// TEST: Cache lookup returns hit/miss status correctly
FUNCTION check_cache_status(query_hash: String, prefix: String):
    // Simulate cache lookup logic
    // In actual implementation, this would check Claude's cache
    cache_key = COMBINE(prefix, query_hash)
    
    IF cache_entry EXISTS for cache_key:
        cache_entry.last_accessed = CURRENT timestamp
        cache_entry.access_count += 1
        RETURN ("hit", cache_entry)
    ELSE:
        RETURN ("miss", NULL)

// TEST: Cache metrics calculation is accurate
FUNCTION calculate_cache_metrics(cache_entries: List[CacheEntry]):
    total_requests = SUM(entry.access_count FOR entry IN cache_entries)
    cache_hits = COUNT(entries with access_count > 0)
    
    hit_rate = cache_hits / total_requests * 100
    
    // Calculate average latencies
    hit_latencies = GET latencies for cache hits
    miss_latencies = GET latencies for cache misses
    
    average_hit_latency = AVERAGE(hit_latencies)
    average_miss_latency = AVERAGE(miss_latencies)
    
    // Calculate cost savings
    cost_savings = CALCULATE token cost reduction percentage
    
    RETURN {
        "hit_rate": hit_rate,
        "average_hit_latency": average_hit_latency,
        "average_miss_latency": average_miss_latency,
        "cost_savings": cost_savings,
        "total_requests": total_requests
    }
```

### 2.2 Cache Optimization Strategies
```pseudocode
// TEST: Cache warming improves subsequent performance
FUNCTION warm_cache(common_queries: List[String]):
    FOR each query IN common_queries:
        // Pre-process common queries to populate cache
        TRY:
            AWAIT process_user_query(query)
            LOG "Cache warmed for query pattern"
        CATCH warming_error:
            LOG "Cache warming failed for query: " + query

// TEST: Cache invalidation removes stale entries
FUNCTION invalidate_cache(prefix: String, reason: String):
    LOG "Invalidating cache prefix: " + prefix + " Reason: " + reason
    
    // Mark cache entry as invalid
    cache_entry = FIND cache entry by prefix
    cache_entry.is_valid = FALSE
    cache_entry.invalidated_at = CURRENT timestamp
    cache_entry.invalidation_reason = reason
    
    // Clean up associated resources
    CLEANUP cache resources
```

## 3. Tool Management Module

### 3.1 Tool Registration and Discovery
```pseudocode
MODULE ToolManager

// TEST: Tool registration validates tool definitions
FUNCTION register_tool(tool_definition: ToolDefinition):
    VALIDATE tool_definition has required fields
    VALIDATE tool_definition.name is unique
    VALIDATE tool_definition.parameters schema is valid
    
    TRY:
        // Upload to Arcade
        arcade_client.tools.upload(tool_definition)
        
        // Update local registry
        tool_registry.ADD(tool_definition)
        
        LOG "Tool registered successfully: " + tool_definition.name
        
    CATCH registration_error:
        LOG "Tool registration failed: " + registration_error.message
        RAISE ToolRegistrationError(registration_error.message)

// TEST: Schema export produces valid Claude-compatible schemas
FUNCTION export_tool_schemas():
    schemas = []
    
    FOR each tool IN tool_registry:
        schema = {
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.parameters,
            "required": tool.required_parameters
        }
        
        VALIDATE schema format
        schemas.APPEND(schema)
    
    RETURN schemas

// TEST: Tool discovery finds all available tools
FUNCTION discover_available_tools():
    TRY:
        // Query Arcade for available tools
        available_tools = arcade_client.tools.list()
        
        // Update local registry with discoveries
        FOR each tool IN available_tools:
            IF tool NOT IN tool_registry:
                tool_registry.ADD(tool)
                LOG "Discovered new tool: " + tool.name
        
        RETURN tool_registry.ALL()
        
    CATCH discovery_error:
        LOG "Tool discovery failed: " + discovery_error.message
        RETURN tool_registry.ALL()  // Return cached registry
```

### 3.2 Tool Execution Engine
```pseudocode
// TEST: Tool execution validates inputs and handles errors
ASYNC FUNCTION execute_tool(tool_name: String, arguments: Dict, user_id: String):
    execution_id = GENERATE unique identifier
    start_time = CURRENT timestamp
    
    // Validate tool exists
    tool_definition = tool_registry.GET(tool_name)
    IF tool_definition IS NULL:
        RAISE ToolNotFoundError("Tool not found: " + tool_name)
    
    // Validate arguments against schema
    validation_result = VALIDATE arguments AGAINST tool_definition.parameters
    IF NOT validation_result.is_valid:
        RAISE InvalidArgumentsError(validation_result.errors)
    
    // Check authorization if required
    IF tool_definition.requires_auth:
        auth_status = CHECK user authorization for tool
        IF NOT auth_status.is_authorized:
            RAISE UnauthorizedError("User not authorized for tool: " + tool_name)
    
    TRY:
        // Execute tool through Arcade
        result = AWAIT arcade_client.tools.execute(
            tool_name=tool_name,
            user_id=user_id,
            arguments=arguments
        )
        
        end_time = CURRENT timestamp
        execution_time = end_time - start_time
        
        // Log successful execution
        LOG tool execution metrics
        
        RETURN {
            "execution_id": execution_id,
            "result": result,
            "execution_time_ms": execution_time,
            "status": "success"
        }
        
    CATCH execution_error:
        end_time = CURRENT timestamp
        execution_time = end_time - start_time
        
        // Log failed execution
        LOG tool execution error
        
        RETURN {
            "execution_id": execution_id,
            "error": execution_error.message,
            "execution_time_ms": execution_time,
            "status": "failed"
        }

// TEST: Batch tool execution maintains order and handles partial failures
ASYNC FUNCTION execute_tool_batch(tool_calls: List[ToolCall]):
    results = []
    
    FOR each call IN tool_calls:
        result = AWAIT execute_tool(
            call.tool_name,
            call.arguments,
            call.user_id
        )
        
        results.APPEND(result)
        
        // Continue execution even if one tool fails
        // Each result contains success/failure status
    
    RETURN results
```

## 4. SQL Query Tool Module

### 4.1 Database Query Processing
```pseudocode
MODULE SQLQueryTool

// TEST: SQL validation prevents non-SELECT statements
FUNCTION validate_sql_query(statement: String):
    normalized_statement = statement.LOWER().TRIM()
    
    // Security check: only allow SELECT statements
    IF NOT normalized_statement.STARTS_WITH("select"):
        RAISE SecurityError("Only SELECT statements are allowed")
    
    // Check for dangerous keywords
    dangerous_keywords = ["drop", "delete", "update", "insert", "alter", "create"]
    FOR each keyword IN dangerous_keywords:
        IF keyword IN normalized_statement:
            RAISE SecurityError("Dangerous SQL keyword detected: " + keyword)
    
    // Basic syntax validation
    TRY:
        PARSE SQL syntax
    CATCH syntax_error:
        RAISE InvalidSQLError("SQL syntax error: " + syntax_error.message)
    
    RETURN TRUE

// TEST: Query execution returns structured results
FUNCTION execute_sql_query(statement: String, database_path: String):
    VALIDATE sql_query(statement)
    
    TRY:
        // Connect to database
        connection = CONNECT to database at database_path
        
        // Execute query
        cursor = connection.EXECUTE(statement)
        rows = cursor.FETCH_ALL()
        columns = cursor.GET_COLUMN_NAMES()
        
        // Format results as structured data
        structured_results = []
        FOR each row IN rows:
            row_dict = {}
            FOR i IN range(LENGTH(columns)):
                row_dict[columns[i]] = row[i]
            structured_results.APPEND(row_dict)
        
        connection.CLOSE()
        
        RETURN {
            "rows": structured_results,
            "row_count": LENGTH(structured_results),
            "columns": columns,
            "execution_time_ms": MEASURE execution time
        }
        
    CATCH database_error:
        LOG "Database error: " + database_error.message
        RAISE DatabaseError("Query execution failed: " + database_error.message)
```

### 4.2 Tool Registration Handler
```pseudocode
// TEST: Tool registration creates proper Arcade tool definition
FUNCTION create_sql_tool_definition():
    @Tool(
        name="SQL.QueryReadonly",
        description="Run a SELECT statement on the finance database",
        parameters={
            "statement": {
                "type": "string",
                "description": "SQL SELECT statement to execute"
            }
        }
    )
    FUNCTION sql_query_tool(statement: String):
        // Validate and execute query
        VALIDATE sql_query(statement)
        result = EXECUTE sql_query(statement, DATABASE_PATH)
        RETURN result
    
    RETURN sql_query_tool

// TEST: Command line registration uploads tool successfully
FUNCTION handle_registration_command():
    IF command_line_args.register:
        TRY:
            tool_definition = CREATE sql_tool_definition()
            arcade_client = CREATE Arcade client
            arcade_client.tools.upload(tool_definition)
            PRINT "✅ SQL.QueryReadonly uploaded to Arcade"
            
        CATCH upload_error:
            PRINT "❌ Failed to upload tool: " + upload_error.message
            EXIT with error code
```

## 5. Error Handling and Recovery

### 5.1 Error Classification and Handling
```pseudocode
MODULE ErrorHandler

// TEST: Error classification correctly identifies error types
FUNCTION classify_error(error: Exception):
    error_type = TYPE_OF(error)
    
    MATCH error_type:
        CASE ConfigurationError:
            RETURN "configuration"
        CASE ConnectionError:
            RETURN "connectivity"
        CASE AuthenticationError:
            RETURN "authentication"
        CASE ValidationError:
            RETURN "validation"
        CASE ToolExecutionError:
            RETURN "tool_execution"
        CASE DatabaseError:
            RETURN "database"
        DEFAULT:
            RETURN "unknown"

// TEST: Error recovery implements appropriate retry strategies
FUNCTION handle_error_with_recovery(error: Exception, context: Dict):
    error_category = CLASSIFY error(error)
    
    MATCH error_category:
        CASE "connectivity":
            // Implement exponential backoff retry
            FOR attempt IN range(MAX_RETRIES):
                WAIT (2^attempt) seconds
                TRY:
                    RETRY operation
                    RETURN success
                CATCH retry_error:
                    IF attempt == MAX_RETRIES - 1:
                        RAISE FinalRetryError("Max retries exceeded")
                    CONTINUE
        
        CASE "tool_execution":
            // Log error and continue with degraded functionality
            LOG error details
            RETURN fallback_response("Tool temporarily unavailable")
        
        CASE "validation":
            // Return user-friendly error message
            RETURN user_error_response(error.message)
        
        DEFAULT:
            // Log and propagate unknown errors
            LOG error with full context
            RAISE error

// TEST: Graceful degradation maintains system availability
FUNCTION provide_graceful_degradation(failed_component: String):
    MATCH failed_component:
        CASE "cache":
            LOG "Cache unavailable, processing without cache optimization"
            RETURN process_without_cache()
        
        CASE "tools":
            LOG "Tools unavailable, returning static response"
            RETURN "I'm sorry, I can't access live data right now. Please try again later."
        
        CASE "database":
            LOG "Database unavailable, suggesting alternative"
            RETURN "Database is temporarily unavailable. Please contact support."
        
        DEFAULT:
            RETURN "System is experiencing issues. Please try again later."
```

## 6. Performance Monitoring

### 6.1 Metrics Collection
```pseudocode
MODULE PerformanceMonitor

// TEST: Latency measurement accurately captures timing
FUNCTION measure_operation_latency(operation_name: String, operation: Function):
    start_time = HIGH_PRECISION_TIMESTAMP()
    
    TRY:
        result = EXECUTE operation()
        end_time = HIGH_PRECISION_TIMESTAMP()
        latency = end_time - start_time
        
        RECORD metric(operation_name + "_latency", latency)
        RECORD metric(operation_name + "_success", 1)
        
        RETURN result
        
    CATCH operation_error:
        end_time = HIGH_PRECISION_TIMESTAMP()
        latency = end_time - start_time
        
        RECORD metric(operation_name + "_latency", latency)
        RECORD metric(operation_name + "_error", 1)
        
        RAISE operation_error

// TEST: Cost tracking accurately calculates token usage
FUNCTION track_token_costs(operation: String, token_count: Integer, cache_status: String):
    base_cost = token_count * TOKEN_COST_PER_UNIT
    
    MATCH cache_status:
        CASE "hit":
            actual_cost = base_cost * CACHE_HIT_MULTIPLIER  // ~0.1
        CASE "miss":
            actual_cost = base_cost * CACHE_MISS_MULTIPLIER  // ~0.35
        DEFAULT:
            actual_cost = base_cost  // Full cost
    
    RECORD metric("token_cost", actual_cost)
    RECORD metric("token_count", token_count)
    RECORD metric("cache_status", cache_status)
    
    RETURN actual_cost

// TEST: Performance reporting generates accurate summaries
FUNCTION generate_performance_report(time_period: TimeRange):
    metrics = COLLECT metrics for time_period
    
    report = {
        "total_queries": COUNT(metrics.query_operations),
        "average_latency": AVERAGE(metrics.latency_measurements),
        "cache_hit_rate": PERCENTAGE(metrics.cache_hits, metrics.total_cache_checks),
        "cost_savings": CALCULATE(metrics.cost_with_cache, metrics.cost_without_cache),
        "error_rate": PERCENTAGE(metrics.errors, metrics.total_operations),
        "tool_usage": SUMMARIZE(metrics.tool_executions)
    }
    
    RETURN report
```

This pseudocode provides a comprehensive foundation for implementing the FACT system with clear testing anchors and modular design principles.