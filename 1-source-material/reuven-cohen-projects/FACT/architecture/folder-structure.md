# FACT System Folder Structure

```
fact/
├── src/                      # Main source code directory
│   ├── core/                 # Core system components
│   │   ├── __init__.py       # Package initialization
│   │   ├── driver.py         # Central orchestrator managing cache, queries, and tools
│   │   ├── config.py         # Configuration management and environment setup
│   │   ├── cli.py            # Command-line interface implementation
│   │   ├── errors.py         # Error definitions and handling
│   │   └── logging.py        # Structured logging configuration
│   │
│   ├── cache/                # Cache management system
│   │   ├── __init__.py       # Package initialization
│   │   ├── manager.py        # Main cache control and management
│   │   ├── metrics.py        # Cache performance metrics collection
│   │   ├── strategy.py       # Caching strategies implementation
│   │   ├── validation.py     # Cache validation mechanisms
│   │   └── warming.py        # Cache warming utilities
│   │
│   ├── tools/                # Tool management system
│   │   ├── __init__.py       # Package initialization
│   │   ├── decorators.py     # Tool definition decorators
│   │   ├── registry.py       # Tool registration and discovery
│   │   ├── executor.py       # Tool execution engine
│   │   ├── validation.py     # Tool parameter validation
│   │   ├── schema.py         # Tool schema generation for Claude
│   │   └── connectors/       # Tool implementation connectors
│   │       ├── __init__.py   # Package initialization
│   │       ├── sql.py        # SQL database connector
│   │       ├── http.py       # HTTP API connector
│   │       ├── file.py       # File system connector
│   │       └── util.py       # Utility functions
│   │
│   ├── arcade/               # Arcade integration layer
│   │   ├── __init__.py       # Package initialization
│   │   ├── client.py         # Arcade client wrapper
│   │   ├── gateway.py        # Gateway connection management
│   │   ├── serialization.py  # Request/response serialization
│   │   └── errors.py         # Arcade-specific error handling
│   │
│   ├── security/             # Security components
│   │   ├── __init__.py       # Package initialization
│   │   ├── auth.py           # Authentication mechanisms
│   │   ├── oauth.py          # OAuth integration
│   │   ├── validation.py     # Input validation
│   │   ├── sanitization.py   # Output sanitization
│   │   └── audit.py          # Security audit logging
│   │
│   ├── db/                   # Database layer
│   │   ├── __init__.py       # Package initialization
│   │   ├── connection.py     # Database connection management
│   │   ├── models.py         # Data models
│   │   └── queries.py        # Query templates
│   │
│   └── monitoring/           # Monitoring and observability
│       ├── __init__.py       # Package initialization
│       ├── metrics.py        # Performance metrics collection
│       ├── health.py         # Health check implementation
│       └── alerting.py       # Alert mechanisms
│
├── tools/                    # Standalone tool implementations
│   ├── __init__.py           # Package initialization
│   ├── sql_query.py          # SQL query tool
│   ├── file_reader.py        # File system read tool
│   └── web_request.py        # HTTP request tool
│
├── tests/                    # Test suite
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── performance/          # Performance benchmarks
│   ├── security/             # Security tests
│   └── conftest.py           # Test configuration
│
├── gateway/                  # Arcade gateway configuration
│   ├── docker-compose.yml    # Docker Compose for local development
│   └── config/               # Gateway configuration files
│
├── db/                       # Database scripts and schemas
│   ├── seed.sql              # Database seed script
│   └── migrations/           # Schema migrations
│
├── docs/                     # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture diagrams
│   ├── deployment/           # Deployment guides
│   └── development/          # Development guides
│
├── scripts/                  # Utility scripts
│   ├── setup.sh              # Setup script
│   ├── register_tools.py     # Tool registration script
│   └── deploy.sh             # Deployment script
│
├── deployment/               # Deployment configurations
│   ├── docker/               # Docker deployment
│   ├── kubernetes/           # Kubernetes deployment
│   └── monitoring/           # Monitoring setup
│
├── .env.example              # Example environment configuration
├── requirements.txt          # Python dependencies
├── setup.py                  # Package setup script
├── driver.py                 # Main application entry point
├── README.md                 # Project overview
└── LICENSE                   # License information
```

## Folder Structure Rationale

The folder structure is designed to reflect the modular architecture of the FACT system with clear separation of concerns:

1. **Core Components**: Centralizes the system orchestration and configuration
2. **Cache Management**: Isolates cache-specific functionality for performance optimization
3. **Tool Management**: Encapsulates tool registration, discovery, and execution
4. **Arcade Integration**: Contains all Arcade.dev gateway interactions
5. **Security**: Concentrates security-related functionality for easier auditing
6. **Database Layer**: Abstracts database connections and queries
7. **Monitoring**: Separates observability concerns

This structure enables:
- Independent development and testing of components
- Clear module boundaries and interfaces
- Simplified security reviews
- Scalable architecture for future extensions