# FACT System Libraries Overview

> Comprehensive overview of Python libraries and dependencies used in the FACT system based on Context7 research

## Table of Contents

- [Core Dependencies](#core-dependencies)
- [AI & LLM Integration](#ai--llm-integration)
- [Data Validation & Models](#data-validation--models)
- [Async & HTTP](#async--http)
- [Database & Storage](#database--storage)
- [Testing Framework](#testing-framework)
- [Security & Authentication](#security--authentication)
- [Development Tools](#development-tools)
- [Monitoring & Logging](#monitoring--logging)
- [Usage Patterns](#usage-patterns)
- [Best Practices](#best-practices)

## Core Dependencies

### Python-dotenv 1.0.1
- **Purpose**: Environment variable management
- **Usage**: Configuration and secrets management
- **Key Features**: 
  - Load environment variables from .env files
  - Support for multiple environments
  - Secure configuration handling
- **FACT Usage**: Core configuration system in [`src/core/config.py`](../../src/core/config.py)

### Pydantic 2.8.2
- **Purpose**: Data validation and settings management
- **Usage**: Type-safe data models and configuration
- **Key Features**:
  - Automatic data validation using Python type hints
  - JSON schema generation
  - Performance optimized with Rust core
  - Advanced error handling
- **FACT Usage**: Data models and validation throughout the system
- **Trust Score**: 9.6/10
- **Code Examples**: 665+

**Basic Pydantic Usage Pattern:**
```python
from datetime import datetime
from pydantic import BaseModel, PositiveInt

class User(BaseModel):
    id: int
    name: str = 'John Doe'
    signup_ts: datetime | None
    tastes: dict[str, PositiveInt]

# Automatic validation and type coercion
external_data = {
    'id': 123,
    'signup_ts': '2019-06-01 12:22',
    'tastes': {'wine': 9, 'cheese': 7, 'cabbage': '1'}
}
user = User(**external_data)
```

## AI & LLM Integration

### Anthropic 0.19.1
- **Purpose**: Claude AI integration
- **Usage**: LLM capabilities for the FACT system
- **Key Features**:
  - Claude API access with streaming support
  - Async/await support
  - Message handling with context management
  - Tool use and function calling
- **FACT Usage**: Primary AI provider for tool generation and analysis
- **Trust Score**: 8.8/10
- **Code Examples**: 75+

**Basic Anthropic Usage Pattern:**
```python
import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY"),
)

message = client.messages.create(
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": "Hello, Claude",
    }],
    model="claude-3-5-sonnet-latest",
)
```

**Streaming with Context Management:**
```python
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async with client.messages.stream(
    max_tokens=1024,
    messages=[{"role": "user", "content": "Say hello there!"}],
    model="claude-3-5-sonnet-latest",
) as stream:
    async for text in stream.text_stream:
        print(text, end="", flush=True)
    print()

message = await stream.get_final_message()
```

### LiteLLM 1.0.0
- **Purpose**: Universal LLM interface
- **Usage**: Multi-provider LLM abstraction
- **Key Features**:
  - Support for 100+ LLM providers
  - Unified API interface compatible with OpenAI format
  - Cost tracking and usage monitoring
  - Rate limiting and fallback strategies
- **FACT Usage**: Flexible LLM provider switching and management
- **Trust Score**: 7.7/10
- **Code Examples**: 3600+

**Basic LiteLLM Configuration:**
```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: azure/gpt-turbo-small-eu
      api_base: https://my-endpoint-europe.openai.azure.com/
      api_key: "os.environ/AZURE_API_KEY_EU"
      rpm: 6
  - model_name: bedrock-claude-v1
    litellm_params:
      model: bedrock/anthropic.claude-instant-v1

litellm_settings:
  drop_params: True
  success_callback: ["langfuse"]

general_settings:
  master_key: sk-1234
  alerting: ["slack"]
```

**Basic Usage Pattern:**
```python
from litellm import completion
import os

os.environ["OPENAI_API_KEY"] = "your-api-key"

response = completion(
    model="gpt-3.5-turbo",
    messages=[{"content": "Hello, how are you?", "role": "user"}]
)
print(response.usage)
```

## Data Validation & Models

### Advanced Pydantic Features

**Validation Error Handling:**
```python
from pydantic import BaseModel, ValidationError, Field

class Location(BaseModel):
    lat: float = 0.1
    lng: float = 10.1

class Model(BaseModel):
    is_required: float
    gt_int: int = Field(gt=42)
    list_of_ints: list[int]
    recursive_model: Location

try:
    Model(**invalid_data)
except ValidationError as e:
    print(e.errors())  # Detailed error information
```

**Custom Validators:**
```python
from pydantic import BaseModel, field_validator

class UserModel(BaseModel):
    username: str
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v
```

## Async & HTTP

### aiohttp 3.9.5
- **Purpose**: Async HTTP client/server framework
- **Usage**: HTTP operations and API interactions
- **Key Features**:
  - High-performance async HTTP
  - Client and server support
  - WebSocket support
  - Middleware system
- **FACT Usage**: HTTP connectors and external API integration in [`src/tools/connectors/http.py`](../../src/tools/connectors/http.py)

## Database & Storage

### aiosqlite 0.20.0
- **Purpose**: Async SQLite database interface
- **Usage**: Local database operations
- **Key Features**:
  - Async SQLite operations
  - Connection pooling
  - Transaction support
  - Thread-safe operations
- **FACT Usage**: Local data storage and caching in [`src/db/`](../../src/db/)
- **Trust Score**: 7.7/10
- **Code Examples**: 33+

## Testing Framework

### Core Testing Libraries

#### pytest 8.3.2
- **Purpose**: Main testing framework
- **Features**: Simple test discovery, fixtures, parametrized testing

#### pytest-asyncio 0.24.0
- **Purpose**: Async test support
- **Features**: Test async functions and coroutines

#### pytest-cov 5.0.0
- **Purpose**: Code coverage analysis
- **Features**: Coverage reporting and thresholds

#### pytest-mock 3.14.0
- **Purpose**: Mocking capabilities
- **Features**: Easy mock object creation and patching

### Extended Testing Tools

#### pytest-benchmark 4.0.0
- **Purpose**: Performance benchmarking
- **Features**: Benchmark test functions and compare performance

#### pytest-timeout 2.1.0
- **Purpose**: Test timeout management
- **Features**: Prevent hanging tests with configurable timeouts

#### pytest-xdist 3.3.0
- **Purpose**: Parallel test execution
- **Features**: Run tests in parallel across multiple CPUs

#### aioresponses 0.7.4
- **Purpose**: Mock aiohttp requests
- **Features**: Mock async HTTP calls for testing

#### freezegun 1.2.2
- **Purpose**: Time mocking
- **Features**: Mock datetime for deterministic testing

#### factory-boy 3.3.0
- **Purpose**: Test data generation
- **Features**: Create test fixtures with realistic data

#### faker 19.3.0
- **Purpose**: Fake data generation
- **Features**: Generate fake names, addresses, emails, etc.

## Security & Authentication

### Cryptography & Encryption
- **cryptography 41.0.0+** - Modern cryptographic recipes and primitives
- **argon2-cffi 23.1.0** - Secure password hashing
- **bcrypt 4.0.0** - Password hashing library

### Input Validation & Sanitization
- **validators 0.22.0** - Data validation library
- **bleach 6.1.0** - HTML sanitization
- **html5lib 1.1** - HTML parsing and validation

### Rate Limiting & Monitoring
- **limits 3.6.0** - Rate limiting utilities
- **slowapi 0.1.9** - FastAPI rate limiting middleware

### Security Headers & Middleware
- **secure 0.3.0** - Security headers and middleware

### Authentication & Tokens
- **pyjwt 2.8.0** - JSON Web Token implementation
- **passlib 1.7.4** - Password hashing utilities

### Network Security
- **requests-oauthlib 1.3.1** - OAuth library for requests
- **urllib3 2.0.0** - HTTP client library

### Monitoring
- **prometheus-client 0.18.0** - Prometheus metrics collection

## Development Tools

### Code Quality & Formatting
- **black 24.8.0** - Code formatter
- **flake8 7.1.0** - Linting and style checking
- **mypy 1.11.0** - Static type checking

### Project Structure
```
src/
├── core/           # Core system components
├── tools/          # Tool execution and management
├── cache/          # Caching strategies and management
├── security/       # Security and authentication
├── db/             # Database connections and models
├── monitoring/     # Metrics and monitoring
└── arcade/         # Arcade client integration
```

## Monitoring & Logging

### structlog 24.1.0
- **Purpose**: Structured logging
- **Usage**: Consistent, structured log output
- **Key Features**:
  - Structured log entries
  - Contextual information
  - Performance optimized
  - Multiple output formats
- **FACT Usage**: System-wide logging and monitoring

## Usage Patterns

### Environment Configuration Pattern
```python
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///fact.db")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
```

### Async Database Pattern
```python
import aiosqlite
from typing import AsyncGenerator

async def get_db_connection() -> AsyncGenerator[aiosqlite.Connection, None]:
    async with aiosqlite.connect("fact.db") as db:
        yield db

async def save_tool_result(tool_id: str, result: dict):
    async with aiosqlite.connect("fact.db") as db:
        await db.execute(
            "INSERT INTO tool_results (tool_id, result) VALUES (?, ?)",
            (tool_id, json.dumps(result))
        )
        await db.commit()
```

### LLM Integration Pattern
```python
from litellm import completion
from anthropic import Anthropic

class LLMManager:
    def __init__(self):
        self.anthropic_client = Anthropic()
        
    async def generate_tool(self, specification: str) -> str:
        # Use LiteLLM for provider flexibility
        response = completion(
            model="claude-3-5-sonnet-latest",
            messages=[{
                "role": "user", 
                "content": f"Generate a tool based on: {specification}"
            }]
        )
        return response.choices[0].message.content
```

## Best Practices

### Data Validation Best Practices
1. **Use Pydantic for all data models** - Ensures type safety and validation
2. **Define clear validation rules** - Use Field constraints and custom validators
3. **Handle validation errors gracefully** - Provide meaningful error messages
4. **Validate at boundaries** - API inputs, file imports, external data

### Async Programming Best Practices
1. **Use aiohttp for HTTP operations** - Better performance than synchronous requests
2. **Implement proper connection pooling** - Reuse connections for efficiency
3. **Handle async context managers** - Ensure proper resource cleanup
4. **Use aiosqlite for database operations** - Non-blocking database access

### Security Best Practices
1. **Never hardcode secrets** - Use environment variables and python-dotenv
2. **Validate all inputs** - Use Pydantic models and security libraries
3. **Implement rate limiting** - Protect against abuse and DoS attacks
4. **Use secure password hashing** - argon2-cffi or bcrypt for passwords
5. **Sanitize HTML content** - Use bleach for user-generated content

### Testing Best Practices
1. **Use pytest for all testing** - Leverage its fixtures and parametrization
2. **Test async code properly** - Use pytest-asyncio for async tests
3. **Mock external dependencies** - Use aioresponses for HTTP mocks
4. **Generate realistic test data** - Use factory-boy and faker
5. **Measure code coverage** - Use pytest-cov with minimum thresholds

### Performance Best Practices
1. **Use structured logging** - structlog for better performance and debugging
2. **Implement caching strategies** - Local and distributed caching
3. **Monitor performance** - Use benchmarking and metrics collection
4. **Optimize database queries** - Use proper indexing and query optimization

## Version Management

All dependencies are pinned to specific versions for stability:
- **Core libraries**: Fixed versions for reliability
- **Security libraries**: Latest stable versions for security patches
- **Development tools**: Compatible versions for consistent development environment

## Migration Notes

When upgrading libraries:
1. **Test thoroughly** - Run full test suite with new versions
2. **Check breaking changes** - Review release notes and migration guides
3. **Update incrementally** - Upgrade one library at a time
4. **Monitor in staging** - Deploy to staging environment first

## Resources

- [Anthropic Python SDK Documentation](https://github.com/anthropics/anthropic-sdk-python)
- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [aiohttp Documentation](https://docs.aiohttp.org/)
- [pytest Documentation](https://docs.pytest.org/)
- [Python Security Best Practices](https://python.org/dev/security/)

---

*Last updated: January 2025*  
*Generated using Context7 MCP integration and analysis of FACT system requirements*