# FACT System Data Flow Architecture

This document details the flow of data through the FACT system, illustrating how information moves between components during key operations.

## 1. Query Processing Flow

The following diagram illustrates the data flow for processing a user query:

```mermaid
flowchart TD
    User[User] -->|"1. Query\n(text)"| CLI[CLI Interface]
    CLI -->|"2. Query\n(text)"| Driver[FACT Driver]
    
    Driver -->|"3. Check cache\n(query hash)"| CacheManager[Cache Manager]
    CacheManager -->|"4. Cache status\n(hit/miss)"| Driver
    
    Driver -->|"5a. Query with\ncache control"| Claude[Claude Sonnet-4]
    
    subgraph CacheHitPath[Cache Hit Path]
        Claude -->|"6a. Cached response\n(text)"| Driver
    end
    
    subgraph CacheMissPath[Cache Miss Path]
        Claude -->|"6b. Tool call request\n(JSON)"| Driver
        Driver -->|"7. Tool schema request"| ToolRegistry[Tool Registry]
        ToolRegistry -->|"8. Tool schemas\n(JSON)"| Driver
        Driver -->|"9. Execute tool\n(name, args)"| ToolExecutor[Tool Executor]
        
        ToolExecutor -->|"10. Security check\n(tool, user)"| SecurityManager[Security Manager]
        SecurityManager -->|"11. Authorization\n(boolean)"| ToolExecutor
        
        ToolExecutor -->|"12. Validate input\n(args, schema)"| InputValidator[Input Validator]
        InputValidator -->|"13. Validation result\n(boolean)"| ToolExecutor
        
        ToolExecutor -->|"14. Tool request\n(name, args)"| ArcadeClient[Arcade Client]
        ArcadeClient -->|"15. Gateway request\n(serialized)"| ArcadeGateway[Arcade Gateway]
        
        ArcadeGateway -->|"16. SQL query\n(if SQL tool)"| Database[Database]
        Database -->|"17. Query results\n(rows)"| ArcadeGateway
        
        ArcadeGateway -->|"18. Tool response\n(JSON)"| ArcadeClient
        ArcadeClient -->|"19. Formatted result\n(JSON)"| ToolExecutor
        
        ToolExecutor -->|"20. Sanitize output\n(result)"| OutputSanitizer[Output Sanitizer]
        OutputSanitizer -->|"21. Sanitized result\n(JSON)"| ToolExecutor
        
        ToolExecutor -->|"22. Tool result\n(JSON)"| Driver
        Driver -->|"23. Tool response\n(JSON)"| Claude
        Claude -->|"24. Generated response\n(text)"| Driver
    end
    
    Driver -->|"25. Log metrics\n(latency, tokens)"| Metrics[Metrics Collection]
    Driver -->|"26. Final response\n(text)"| CLI
    CLI -->|"27. Formatted response\n(text)"| User
    
    classDef primary fill:#f9f,stroke:#333,stroke-width:2px
    classDef user fill:#ffd,stroke:#333,stroke-width:2px
    classDef external fill:#bfb,stroke:#333,stroke-width:1px
    classDef cache fill:#bbf,stroke:#333,stroke-width:1px
    classDef tools fill:#fbf,stroke:#333,stroke-width:1px
    classDef security fill:#fbb,stroke:#333,stroke-width:1px
    
    class User user
    class Driver primary
    class Claude,ArcadeGateway,Database external
    class CacheManager cache
    class ToolRegistry,ToolExecutor,ArcadeClient tools
    class SecurityManager,InputValidator,OutputSanitizer security
```

### Data Flow Description

1. **User Query**
   - The user submits a natural language query
   - Data: Text string with optional context

2. **Driver Processing**
   - The FACT Driver receives the query
   - Generates a cache key for the query
   - Checks cache status

3. **Cache Check**
   - The Cache Manager determines if the query exists in cache
   - Returns hit/miss status

4. **Cache Hit Path (Optimal Performance)**
   - Query is sent to Claude with cache control mode="read"
   - Claude returns the cached response directly
   - Response is returned to the user
   - Total latency: ≤50ms

5. **Cache Miss Path (Tool Execution)**
   - Query is sent to Claude with cache control mode="write"
   - Claude determines a tool is needed and returns a tool call request
   - Driver requests tool schemas from the Tool Registry
   - Driver forwards the tool execution request to Tool Executor
   - Tool Executor performs security checks and input validation
   - Request is forwarded to Arcade Client and then to Arcade Gateway
   - Tool is executed (e.g., SQL query against database)
   - Results flow back through the chain with validation and sanitization
   - Results are sent to Claude as a tool response
   - Claude generates the final response
   - Response is returned to the user
   - Total latency: ≤140ms

6. **Metrics Collection**
   - Performance metrics are logged throughout the process
   - Includes latency, token usage, cache status

## 2. Tool Registration Flow

The following diagram illustrates the data flow for registering a new tool:

```mermaid
flowchart TD
    Developer[Developer] -->|"1. Tool definition\n(Python code)"| ToolDecorator[Tool Decorator]
    ToolDecorator -->|"2. Register local tool\n(definition)"| LocalRegistry[Local Tool Registry]
    
    Developer -->|"3. Register command\n(CLI)"| RegisterScript[Register Script]
    RegisterScript -->|"4. Get tool definitions\n(request)"| LocalRegistry
    LocalRegistry -->|"5. Tool definitions\n(list)"| RegisterScript
    
    RegisterScript -->|"6. Validate tools\n(definitions)"| SchemaValidator[Schema Validator]
    SchemaValidator -->|"7. Validation results\n(errors/success)"| RegisterScript
    
    RegisterScript -->|"8. Upload request\n(validated tools)"| ArcadeClient[Arcade Client]
    ArcadeClient -->|"9. Tool registration\n(serialized)"| ArcadeGateway[Arcade Gateway]
    ArcadeGateway -->|"10. Registration result\n(success/error)"| ArcadeClient
    ArcadeClient -->|"11. Registration status\n(JSON)"| RegisterScript
    
    RegisterScript -->|"12. Update registry\n(arcade_ids)"| LocalRegistry
    RegisterScript -->|"13. Registration report\n(success/failures)"| Developer
    
    classDef human fill:#ffd,stroke:#333,stroke-width:2px
    classDef tools fill:#fbf,stroke:#333,stroke-width:1px
    classDef external fill:#bfb,stroke:#333,stroke-width:1px
    
    class Developer human
    class ToolDecorator,LocalRegistry,RegisterScript,SchemaValidator,ArcadeClient tools
    class ArcadeGateway external
```

### Data Flow Description

1. **Tool Definition**
   - Developer creates a tool using the provided decorators
   - Data: Python class or function with @tool decorator

2. **Local Registration**
   - Tool is registered in the local Tool Registry
   - Parameters, return types, and documentation are extracted

3. **Registration Command**
   - Developer triggers tool registration via CLI or script
   - Script gathers all registered tools from local registry

4. **Validation**
   - Tools are validated against schema requirements
   - Validation errors are reported if found

5. **Arcade Upload**
   - Valid tools are serialized and uploaded to Arcade Gateway
   - Arcade Gateway registers tools and returns IDs
   - Local registry is updated with Arcade tool IDs
   - Registration status is reported to the developer

## 3. Cache Management Flow

The following diagram illustrates the data flow for cache management operations:

```mermaid
flowchart TD
    Admin[System Admin] -->|"1. Cache operation\n(command)"| CLI[CLI Interface]
    
    subgraph WarmingFlow[Cache Warming Flow]
        CLI -->|"2a. Warm cache\n(queries)"| CacheWarmer[Cache Warmer]
        CacheWarmer -->|"3a. Common queries\n(list)"| Driver[FACT Driver]
        Driver -->|"4a. Process queries\n(batch)"| Claude[Claude Sonnet-4]
        Claude -->|"5a. Responses\n(cached)"| Driver
        Driver -->|"6a. Warming results\n(stats)"| CacheWarmer
        CacheWarmer -->|"7a. Operation report\n(success/failure)"| CLI
    end
    
    subgraph InvalidationFlow[Cache Invalidation Flow]
        CLI -->|"2b. Invalidate cache\n(criteria)"| CacheValidator[Cache Validator]
        CacheValidator -->|"3b. Validation request\n(criteria)"| Driver
        Driver -->|"4b. Cache control\n(invalidation)"| Claude
        Claude -->|"5b. Invalidation status\n(result)"| Driver
        Driver -->|"6b. Invalidation results\n(stats)"| CacheValidator
        CacheValidator -->|"7b. Operation report\n(success/failure)"| CLI
    end
    
    subgraph MetricsFlow[Cache Metrics Flow]
        CLI -->|"2c. Get metrics\n(request)"| CacheMetrics[Cache Metrics]
        CacheMetrics -->|"3c. Report generation\n(query)"| MetricsDB[Metrics Database]
        MetricsDB -->|"4c. Raw metrics\n(data)"| CacheMetrics
        CacheMetrics -->|"5c. Formatted report\n(stats)"| CLI
    end
    
    CLI -->|"8. Operation result\n(report)"| Admin
    
    classDef human fill:#ffd,stroke:#333,stroke-width:2px
    classDef primary fill:#f9f,stroke:#333,stroke-width:2px
    classDef cache fill:#bbf,stroke:#333,stroke-width:1px
    classDef external fill:#bfb,stroke:#333,stroke-width:1px
    
    class Admin human
    class Driver primary
    class CacheWarmer,CacheValidator,CacheMetrics cache
    class Claude,MetricsDB external
```

### Data Flow Description

1. **Cache Warming Flow**
   - Admin initiates cache warming via CLI
   - Cache Warmer determines common queries to pre-cache
   - Driver processes queries in batch mode
   - Claude caches responses for future use
   - Operation statistics are reported back to admin
   - Data includes hit rates, token savings, latency improvements

2. **Cache Invalidation Flow**
   - Admin initiates cache invalidation via CLI
   - Cache Validator processes invalidation criteria
   - Driver sends invalidation request to Claude
   - Claude performs cache invalidation
   - Operation statistics are reported back to admin
   - Data includes invalidated entries, memory freed

3. **Cache Metrics Flow**
   - Admin requests cache performance metrics
   - Cache Metrics component generates a report
   - Data is pulled from metrics database
   - Formatted report is returned to admin
   - Data includes hit rates, latency stats, token savings

## 4. Security and Audit Flow

The following diagram illustrates the data flow for security operations:

```mermaid
flowchart TD
    User[User] -->|"1. Tool operation\n(request)"| Driver[FACT Driver]
    
    Driver -->|"2. Authentication\n(token)"| AuthManager[Auth Manager]
    AuthManager -->|"3. Verify token\n(JWT)"| OAuthProvider[OAuth Provider]
    OAuthProvider -->|"4. Token validation\n(result)"| AuthManager
    AuthManager -->|"5. Auth result\n(success/failure)"| Driver
    
    Driver -->|"6. Authorization\n(user, tool, scopes)"| SecurityManager[Security Manager]
    SecurityManager -->|"7. Check permissions\n(query)"| PermissionsDB[Permissions Database]
    PermissionsDB -->|"8. Permission status\n(allowed/denied)"| SecurityManager
    SecurityManager -->|"9. Authorization result\n(boolean)"| Driver
    
    Driver -->|"10. Log event\n(operation details)"| AuditLogger[Audit Logger]
    AuditLogger -->|"11. Format event\n(structured data)"| LogAggregator[Log Aggregator]
    LogAggregator -->|"12. Store event\n(append)"| AuditLogs[Audit Logs]
    
    SecurityAdmin[Security Admin] -->|"13. Audit query\n(filters)"| AuditTool[Audit Tool]
    AuditTool -->|"14. Search logs\n(query)"| AuditLogs
    AuditLogs -->|"15. Matching events\n(records)"| AuditTool
    AuditTool -->|"16. Audit report\n(formatted)"| SecurityAdmin
    
    classDef human fill:#ffd,stroke:#333,stroke-width:2px
    classDef primary fill:#f9f,stroke:#333,stroke-width:2px
    classDef security fill:#fbb,stroke:#333,stroke-width:1px
    classDef storage fill:#bfb,stroke:#333,stroke-width:1px
    
    class User,SecurityAdmin human
    class Driver primary
    class AuthManager,OAuthProvider,SecurityManager,AuditLogger,LogAggregator,AuditTool security
    class PermissionsDB,AuditLogs storage
```

### Data Flow Description

1. **Authentication Flow**
   - User request includes authentication token
   - Auth Manager verifies token with OAuth Provider
   - Token validation result is returned
   - Failed authentication generates security alert

2. **Authorization Flow**
   - Driver sends authorization request to Security Manager
   - Security Manager checks user permissions for tool/scope
   - Permission status is returned
   - Failed authorization generates security alert

3. **Audit Logging Flow**
   - All security-relevant events are logged
   - Audit Logger formats events with correlation IDs
   - Log Aggregator processes and stores events
   - Data includes timestamp, user, operation, status

4. **Audit Review Flow**
   - Security Admin queries audit logs
   - Audit Tool searches and filters log records
   - Matching events are returned
   - Formatted report is presented to admin

## 5. Performance Critical Paths

The following diagram highlights the performance-critical paths in the system:

```mermaid
flowchart LR
    User[User]
    CLI[CLI Interface]
    Driver[FACT Driver]
    CacheManager[Cache Manager]
    Claude[Claude Sonnet-4]
    ToolRegistry[Tool Registry]
    ToolExecutor[Tool Executor]
    ArcadeClient[Arcade Client]
    ArcadeGateway[Arcade Gateway]
    Database[Database]
    
    User -->|"Query"| CLI
    CLI -->|"Query"| Driver
    
    %% Cache Hit Path - Target ≤50ms
    subgraph CacheHitPath[Cache Hit Path ≤50ms]
        direction LR
        Driver -->|"1. Check Cache\n≤5ms"| CacheManager
        CacheManager -->|"2. Hit Status"| Driver
        Driver -->|"3. Query with Cache Control\n≤5ms"| Claude
        Claude -->|"4. Cached Response\n≤30ms"| Driver
        Driver -->|"5. Format Response\n≤10ms"| CLI
    end
    
    %% Cache Miss Path - Target ≤140ms
    subgraph CacheMissPath[Cache Miss Path ≤140ms]
        direction LR
        Driver -->|"1. Check Cache\n≤5ms"| CacheManager
        CacheManager -->|"2. Miss Status"| Driver
        Driver -->|"3. Query with Cache Control\n≤5ms"| Claude
        Claude -->|"4. Tool Call Request\n≤30ms"| Driver
        Driver -->|"5. Get Schema\n≤5ms"| ToolRegistry
        ToolRegistry -->|"6. Tool Schema"| Driver
        Driver -->|"7. Execute Tool\n≤10ms"| ToolExecutor
        ToolExecutor -->|"8. Tool Request\n≤5ms"| ArcadeClient
        ArcadeClient -->|"9. Gateway Request\n≤5ms"| ArcadeGateway
        ArcadeGateway -->|"10. Database Query\n≤10ms"| Database
        Database -->|"11. Query Result"| ArcadeGateway
        ArcadeGateway -->|"12. Tool Result"| ArcadeClient
        ArcadeClient -->|"13. Formatted Result"| ToolExecutor
        ToolExecutor -->|"14. Tool Response"| Driver
        Driver -->|"15. Tool Result\n≤5ms"| Claude
        Claude -->|"16. Generated Response\n≤30ms"| Driver
        Driver -->|"17. Format Response\n≤10ms"| CLI
    end
    
    CLI -->|"Response"| User
    
    classDef critical fill:#f96,stroke:#333,stroke-width:4px
    classDef normal fill:#bbf,stroke:#333,stroke-width:1px
    classDef external fill:#bfb,stroke:#333,stroke-width:1px
    
    class Driver,CacheManager,Claude critical
    class CLI,ToolRegistry,ToolExecutor,ArcadeClient normal
    class ArcadeGateway,Database external
```

### Performance Critical Paths Description

1. **Cache Hit Path (Target: ≤50ms)**
   - Most performance-critical path for typical operation
   - Key optimizations:
     - Efficient cache key generation
     - Minimal message size to Claude
     - Optimized cache prefix structure
     - Asynchronous processing

2. **Cache Miss Path (Target: ≤140ms)**
   - Performance-critical for new queries
   - Key optimizations:
     - Parallel tool schema loading
     - Optimized tool execution
     - Connection pooling for database
     - Efficient serialization/deserialization
     - Minimized network roundtrips

3. **Tool Execution Path (Target: ≤10ms)**
   - Critical for determinating total latency
   - Key optimizations:
     - Pre-validated queries
     - Connection pooling
     - Query optimization
     - Efficient data structures