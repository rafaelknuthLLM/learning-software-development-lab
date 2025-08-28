# FACT System Component Diagram

## High-Level Component Architecture

```mermaid
graph TD
    subgraph User["User Interface"]
        CLI["Command Line Interface"]
        API["API Interface (Future)"]
    end

    subgraph Core["Core System"]
        Driver["FACT Driver\n(Central Orchestrator)"]
        Config["Configuration Manager"]
        Logger["Structured Logger"]
    end

    subgraph CacheSystem["Cache Management System"]
        CacheManager["Cache Manager"]
        CacheMetrics["Cache Metrics"]
        CacheStrategy["Caching Strategies"]
        CacheWarming["Cache Warming"]
    end

    subgraph ToolSystem["Tool Management System"]
        ToolRegistry["Tool Registry"]
        ToolExecutor["Tool Execution Engine"]
        SchemaExporter["Schema Exporter"]
        ToolValidator["Tool Validator"]
    end

    subgraph ArcadeLayer["Arcade Integration Layer"]
        ArcadeClient["Arcade Client"]
        GatewayConnector["Gateway Connector"]
        Serializer["Request/Response Serializer"]
    end

    subgraph SecuritySystem["Security System"]
        Auth["Authentication"]
        OAuth["OAuth Provider"]
        InputValidator["Input Validator"]
        OutputSanitizer["Output Sanitizer"]
        AuditLogger["Audit Logger"]
    end

    subgraph DataLayer["Data Access Layer"]
        DBConnector["Database Connector"]
        ConnectionPool["Connection Pool"]
        QueryValidator["Query Validator"]
    end

    subgraph MonitoringSystem["Monitoring System"]
        Metrics["Performance Metrics"]
        HealthCheck["Health Checker"]
        Alerting["Alert Manager"]
    end

    subgraph ExternalSystems["External Systems"]
        Claude["Claude Sonnet-4"]
        ArcadeGateway["Arcade Gateway"]
        Database["SQLite/PostgreSQL"]
    end

    %% User Interface connections
    CLI --> Driver
    API --> Driver

    %% Core connections
    Driver --> Config
    Driver --> Logger
    Driver --> CacheManager
    Driver --> ToolRegistry
    Driver --> ArcadeClient

    %% Cache system connections
    CacheManager --> CacheMetrics
    CacheManager --> CacheStrategy
    CacheManager --> CacheWarming

    %% Tool system connections
    ToolRegistry --> SchemaExporter
    ToolRegistry --> ToolExecutor
    ToolExecutor --> ToolValidator
    ToolExecutor --> ArcadeClient

    %% Arcade layer connections
    ArcadeClient --> GatewayConnector
    ArcadeClient --> Serializer
    GatewayConnector --> ArcadeGateway

    %% Security system connections
    Driver --> Auth
    ToolExecutor --> InputValidator
    ToolExecutor --> OutputSanitizer
    ToolExecutor --> AuditLogger
    Auth --> OAuth

    %% Data layer connections
    ToolExecutor --> DBConnector
    DBConnector --> ConnectionPool
    DBConnector --> QueryValidator
    ConnectionPool --> Database

    %% Monitoring connections
    Driver --> Metrics
    CacheManager --> Metrics
    ToolExecutor --> Metrics
    DBConnector --> Metrics
    Metrics --> HealthCheck
    HealthCheck --> Alerting

    %% External system connections
    Driver --> Claude
    GatewayConnector --> ArcadeGateway
    ArcadeGateway --> Database

    %% Style
    classDef core fill:#f9f,stroke:#333,stroke-width:2px
    classDef cache fill:#bbf,stroke:#333,stroke-width:1px
    classDef tools fill:#bfb,stroke:#333,stroke-width:1px
    classDef arcade fill:#fbf,stroke:#333,stroke-width:1px
    classDef security fill:#fbb,stroke:#333,stroke-width:1px
    classDef data fill:#bff,stroke:#333,stroke-width:1px
    classDef monitoring fill:#ffb,stroke:#333,stroke-width:1px
    classDef external fill:#ddd,stroke:#333,stroke-width:1px
    classDef user fill:#ffd,stroke:#333,stroke-width:1px

    class Driver,Config,Logger core
    class CacheManager,CacheMetrics,CacheStrategy,CacheWarming cache
    class ToolRegistry,ToolExecutor,SchemaExporter,ToolValidator tools
    class ArcadeClient,GatewayConnector,Serializer arcade
    class Auth,OAuth,InputValidator,OutputSanitizer,AuditLogger security
    class DBConnector,ConnectionPool,QueryValidator data
    class Metrics,HealthCheck,Alerting monitoring
    class Claude,ArcadeGateway,Database external
    class CLI,API user
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Driver as FACT Driver
    participant Cache as Cache Manager
    participant Claude as Claude Sonnet-4
    participant ToolRegistry as Tool Registry
    participant ToolExecutor as Tool Executor
    participant Arcade as Arcade Gateway
    participant DB as Database

    User->>Driver: Natural Language Query
    Driver->>Cache: Check Cache Status
    
    alt Cache Hit
        Cache->>Claude: Read with Cache Control
        Claude->>Driver: Return Cached Response
        Driver->>User: Present Response
    else Cache Miss
        Cache->>Claude: Read with Cache Control
        Claude->>Driver: Tool Call Required
        Driver->>ToolRegistry: Get Tool Schema
        ToolRegistry->>Driver: Tool Schema
        Driver->>Claude: Tool Schema
        Claude->>Driver: Tool Call Specification
        Driver->>ToolExecutor: Execute Tool Call
        ToolExecutor->>Arcade: Forward Tool Request
        Arcade->>DB: Execute Query
        DB->>Arcade: Return Result
        Arcade->>ToolExecutor: Return Tool Result
        ToolExecutor->>Driver: Structured Result
        Driver->>Claude: Send Tool Result
        Claude->>Driver: Generated Response
        Driver->>User: Present Response
    end
    
    Driver->>Cache: Update Cache Metrics
```

## Security Boundaries

```mermaid
graph TD
    subgraph TrustedZone["Trusted Zone"]
        Driver["FACT Driver"]
        Cache["Cache Manager"]
        ToolRegistry["Tool Registry"]
        SecurityModule["Security Module"]
        Validator["Input/Output Validator"]
    end

    subgraph SandboxZone["Sandbox Zone"]
        ToolExecutor["Tool Executor"]
        ArcadeClient["Arcade Client"]
        Gateway["Gateway Connector"]
    end

    subgraph ExternalZone["External Zone"]
        Claude["Claude Sonnet-4"]
        ArcadeGateway["Arcade Gateway"]
        Database["Databases"]
        APIs["External APIs"]
    end

    %% Trust relationships
    Driver -->|"Trusted"| Cache
    Driver -->|"Trusted"| ToolRegistry
    Driver -->|"Validates"| SecurityModule
    
    SecurityModule -->|"Validates"| ToolExecutor
    ToolRegistry -->|"Validates"| ToolExecutor
    
    ToolExecutor -->|"Sandbox"| ArcadeClient
    ArcadeClient -->|"Sandbox"| Gateway
    
    Gateway -->|"Authenticated"| ArcadeGateway
    ArcadeGateway -->|"Authenticated"| Database
    ArcadeGateway -->|"Authenticated"| APIs

    Driver -->|"API Key"| Claude
    
    %% Security controls
    SecurityModule -->|"Input Validation"| Validator
    Validator -->|"Sanitizes"| ToolExecutor
    SecurityModule -->|"Authorization"| ToolExecutor
    SecurityModule -->|"Audit Logging"| ToolExecutor

    %% Style
    classDef trusted fill:#bfb,stroke:#333,stroke-width:2px
    classDef sandbox fill:#fbf,stroke:#333,stroke-width:2px
    classDef external fill:#fbb,stroke:#333,stroke-width:2px
    
    class Driver,Cache,ToolRegistry,SecurityModule,Validator trusted
    class ToolExecutor,ArcadeClient,Gateway sandbox
    class Claude,ArcadeGateway,Database,APIs external
```

## Performance Critical Path

```mermaid
graph LR
    subgraph CriticalPath["Performance Critical Path"]
        direction LR
        Query["User Query"]
        CacheCheck["Cache Check\n≤5ms"]
        CacheHit["Cache Hit\n≤45ms"]
        ToolExecution["Tool Execution\n≤10ms"]
        ResultProcessing["Result Processing\n≤5ms"]
        CacheMiss["Cache Miss\n≤100ms"]
        Response["Final Response\n≤20ms"]
    end

    %% Critical flow
    Query --> CacheCheck
    
    CacheCheck -->|"Hit"| CacheHit
    CacheHit --> Response
    
    CacheCheck -->|"Miss"| ToolExecution
    ToolExecution --> ResultProcessing
    ResultProcessing --> CacheMiss
    CacheMiss --> Response
    
    %% Total latency annotations
    CachePathLatency["Cache Hit Path: ≤50ms Total"]
    MissPathLatency["Cache Miss Path: ≤140ms Total"]
    
    %% Style
    classDef critical fill:#f96,stroke:#333,stroke-width:2px
    classDef standard fill:#69f,stroke:#333,stroke-width:1px
    classDef latency fill:none,stroke:none
    
    class Query,CacheCheck,Response critical
    class CacheHit,ToolExecution,ResultProcessing,CacheMiss standard
    class CachePathLatency,MissPathLatency latency
```

## Cache System Architecture

```mermaid
graph TD
    subgraph CacheSystem["Cache Management System"]
        CacheManager["Cache Manager"]
        CacheControl["Cache Control"]
        CacheKey["Cache Key Generator"]
        CacheMetrics["Cache Metrics"]
        CacheValidator["Cache Validator"]
        CacheWarmer["Cache Warmer"]
    end

    subgraph CacheOperations["Cache Operations"]
        WriteCache["Write Cache\nMode: write"]
        ReadCache["Read Cache\nMode: read"]
        InvalidateCache["Invalidate Cache"]
        WarmCache["Warm Cache"]
    end

    subgraph Performance["Performance Tracking"]
        HitRatio["Hit Ratio"]
        Latency["Latency Tracking"]
        TokenSavings["Token Cost Savings"]
    end

    %% Connections
    CacheManager --> CacheControl
    CacheManager --> CacheKey
    CacheManager --> CacheMetrics
    CacheManager --> CacheValidator
    CacheManager --> CacheWarmer
    
    CacheControl --> WriteCache
    CacheControl --> ReadCache
    CacheValidator --> InvalidateCache
    CacheWarmer --> WarmCache
    
    CacheMetrics --> HitRatio
    CacheMetrics --> Latency
    CacheMetrics --> TokenSavings
    
    %% Style
    classDef primary fill:#bbf,stroke:#333,stroke-width:2px
    classDef secondary fill:#ddf,stroke:#333,stroke-width:1px
    classDef metrics fill:#ffd,stroke:#333,stroke-width:1px
    
    class CacheManager primary
    class CacheControl,CacheKey,CacheMetrics,CacheValidator,CacheWarmer secondary
    class WriteCache,ReadCache,InvalidateCache,WarmCache secondary
    class HitRatio,Latency,TokenSavings metrics
```

## Tool System Architecture

```mermaid
graph TD
    subgraph ToolSystem["Tool Management System"]
        ToolRegistry["Tool Registry"]
        ToolExecutor["Tool Execution Engine"]
        SchemaExporter["Schema Exporter"]
        ToolDecorator["Tool Decorator"]
        ToolValidator["Tool Validator"]
        ToolLogger["Tool Logger"]
    end

    subgraph ToolDefinitions["Tool Definitions"]
        SQLTool["SQL.QueryReadonly"]
        FileTool["FileSystem.ReadFile"]
        WebTool["Web.Request"]
        CustomTool["Custom.Tool"]
    end

    subgraph ToolLifecycle["Tool Lifecycle"]
        Definition["1. Definition\n(Python Decorators)"]
        Registration["2. Registration\n(Upload to Arcade)"]
        Discovery["3. Discovery\n(Schema Export)"]
        Execution["4. Execution\n(Runtime Invocation)"]
        Processing["5. Result Processing\n(JSON Formatting)"]
    end

    %% Connections
    ToolDecorator --> Definition
    Definition --> SQLTool
    Definition --> FileTool
    Definition --> WebTool
    Definition --> CustomTool
    
    SQLTool --> Registration
    FileTool --> Registration
    WebTool --> Registration
    CustomTool --> Registration
    
    Registration --> ToolRegistry
    ToolRegistry --> Discovery
    Discovery --> SchemaExporter
    
    SchemaExporter --> Execution
    Execution --> ToolExecutor
    ToolExecutor --> Processing
    
    ToolValidator --> ToolExecutor
    ToolExecutor --> ToolLogger
    
    %% Style
    classDef primary fill:#bfb,stroke:#333,stroke-width:2px
    classDef secondary fill:#dfd,stroke:#333,stroke-width:1px
    classDef tools fill:#ffd,stroke:#333,stroke-width:1px
    classDef lifecycle fill:#ddf,stroke:#333,stroke-width:1px
    
    class ToolRegistry,ToolExecutor primary
    class SchemaExporter,ToolDecorator,ToolValidator,ToolLogger secondary
    class SQLTool,FileTool,WebTool,CustomTool tools
    class Definition,Registration,Discovery,Execution,Processing lifecycle
```

## Deployment Architecture

```mermaid
graph TD
    subgraph Production["Production Deployment"]
        LB["Load Balancer"]
        
        subgraph FACTCluster["FACT Driver Cluster"]
            Driver1["FACT Driver Instance 1"]
            Driver2["FACT Driver Instance 2"]
            DriverN["FACT Driver Instance N"]
        end
        
        subgraph ArcadeCluster["Arcade Gateway Cluster"]
            Gateway1["Gateway Instance 1"]
            Gateway2["Gateway Instance 2"]
            GatewayN["Gateway Instance N"]
        end
        
        subgraph DataLayer["Data Layer"]
            DB["Database Cluster"]
            Cache["Cache Layer"]
        end
        
        subgraph MonitoringLayer["Monitoring Layer"]
            Metrics["Metrics Collection"]
            Logging["Log Aggregation"]
            Alerting["Alert Management"]
            Dashboard["Monitoring Dashboard"]
        end
    end
    
    %% Connections
    LB --> Driver1
    LB --> Driver2
    LB --> DriverN
    
    Driver1 --> Gateway1
    Driver2 --> Gateway1
    Driver1 --> Gateway2
    Driver2 --> Gateway2
    DriverN --> GatewayN
    
    Gateway1 --> DB
    Gateway2 --> DB
    GatewayN --> DB
    
    Driver1 --> Cache
    Driver2 --> Cache
    DriverN --> Cache
    
    Driver1 --> Metrics
    Driver2 --> Metrics
    DriverN --> Metrics
    Gateway1 --> Metrics
    Gateway2 --> Metrics
    GatewayN --> Metrics
    DB --> Metrics
    
    Metrics --> Logging
    Metrics --> Alerting
    Metrics --> Dashboard
    Logging --> Dashboard
    Alerting --> Dashboard
    
    %% Style
    classDef lb fill:#f9f,stroke:#333,stroke-width:2px
    classDef driver fill:#bbf,stroke:#333,stroke-width:1px
    classDef gateway fill:#bfb,stroke:#333,stroke-width:1px
    classDef data fill:#fbf,stroke:#333,stroke-width:1px
    classDef monitoring fill:#ffd,stroke:#333,stroke-width:1px
    
    class LB lb
    class Driver1,Driver2,DriverN driver
    class Gateway1,Gateway2,GatewayN gateway
    class DB,Cache data
    class Metrics,Logging,Alerting,Dashboard monitoring