# Arcade.dev Integration Examples

This directory contains comprehensive examples demonstrating different aspects of Arcade.dev integration with the FACT SDK.

## Examples Overview

### 1. Tool Registration (`02_tool_registration/register_fact_tools.py`)
Demonstrates how to register FACT tools with Arcade.dev platform:
- **Tool Schema Definition**: Shows how to define proper tool schemas for Arcade.dev
- **Authentication Setup**: Demonstrates API key management and secure authentication
- **Permission Management**: Shows how to set up proper scopes and permissions
- **Environment Configuration**: Uses environment variables for secure configuration
- **Batch Registration**: Efficient registration of multiple tools at once

**Key Features:**
- Automatic schema generation from FACT tool decorators
- Secure credential management via environment variables
- Error handling during registration process
- Validation of tool schemas before registration

### 2. Intelligent Routing (`03_intelligent_routing/hybrid_execution.py`)
Demonstrates intelligent routing between local and remote execution:
- **Decision Logic**: Smart routing based on tool capabilities, user context, and system load
- **Fallback Mechanisms**: Graceful degradation when primary execution path fails
- **Performance Monitoring**: Real-time metrics collection and analysis
- **Response Format Handling**: Consistent response formats across execution modes
- **Load Balancing**: Dynamic distribution of workload between local and remote systems

**Key Features:**
- Multi-criteria decision engine for execution routing
- Automatic failover between execution modes
- Performance-based routing optimization
- Comprehensive metrics and monitoring
- Configurable routing policies

### 3. Error Handling (`04_error_handling/resilient_execution.py`)
Demonstrates robust error handling and resilience patterns:
- **Error Classification**: Intelligent categorization of different error types
- **Retry Strategies**: Multiple retry patterns including exponential backoff
- **Circuit Breaker Pattern**: Prevents cascading failures in distributed systems
- **Graceful Degradation**: Maintains service availability during failures
- **Comprehensive Logging**: Detailed error tracking and analysis

**Key Features:**
- Advanced error classification system
- Multiple retry strategies (linear, exponential, adaptive)
- Circuit breaker implementation for fault tolerance
- Graceful degradation with meaningful fallback responses
- Detailed metrics and health monitoring

### 4. Cache Integration (`05_cache_integration/cached_arcade_client.py`)
Demonstrates advanced caching strategies for optimal performance:
- **Hybrid Caching**: Multi-level caching with memory and persistent storage
- **Cache Strategies**: Configurable strategies for different use cases (fast, persistent, secure)
- **Performance Optimization**: Automatic cache tuning and optimization
- **Cache Invalidation**: Flexible invalidation patterns and strategies
- **Metrics Collection**: Comprehensive cache performance tracking

**Key Features:**
- Multi-level caching architecture (memory + persistent)
- Strategy-based cache configuration
- Automatic performance optimization
- LRU eviction and background prefetching
- Compression and encryption support

### 5. Security (`06_security/secure_tool_execution.py`)
Demonstrates comprehensive security best practices:
- **Secure Credential Management**: Encrypted storage and key rotation
- **Input Validation**: Code sanitization and security pattern detection
- **Permission Management**: Role-based access control and session management
- **Audit Logging**: Complete security event tracking with risk scoring
- **Rate Limiting**: Request throttling and abuse prevention

**Key Features:**
- Encrypted credential storage with secure file permissions
- Advanced input validation and sanitization
- Session-based authentication with token expiry
- Comprehensive audit logging with privacy protection
- Configurable rate limiting and threat detection

### 6. Monitoring (`08_monitoring/arcade_monitoring.py`)
Demonstrates comprehensive monitoring and observability:
- **System Monitoring**: CPU, memory, disk, and network metrics
- **API Health Checks**: Arcade.dev API availability and performance tracking
- **Alert Management**: Configurable thresholds and notification system
- **Performance Tracking**: Response times and throughput metrics
- **Real-time Dashboard**: Live system status and analytics

**Key Features:**
- Multi-component system monitoring
- API operation health checks
- Intelligent alerting with severity levels
- Telemetry collection and export
- Real-time dashboard with historical analysis

## Usage

All examples use a common import helper utility that automatically resolves FACT module paths. You can run examples from the `examples/arcade-dev` directory:

```bash
# Navigate to the examples directory
cd examples/arcade-dev

# Basic Integration Example
python 01_basic_integration/basic_arcade_client.py

# Tool Registration Example
python 02_tool_registration/register_fact_tools.py

# Intelligent Routing Example
python 03_intelligent_routing/hybrid_execution.py

# Error Handling Example
python 04_error_handling/resilient_execution.py

# Cache Integration Example
python 05_cache_integration/cached_arcade_client.py

# Security Example
python 06_security/secure_tool_execution.py

# Additional Cache Example
python 07_cache_integration/cached_arcade_client.py

# Advanced Tools Example
python 08_advanced_tools/advanced_tool_usage.py

# Monitoring Example
python 08_monitoring/arcade_monitoring.py

# Testing Example
python 09_testing/arcade_integration_tests.py

# Deployment Example
python 10_deployment/production_deployment.py

# Run All Examples
python run_all_examples.py

# Verify Setup
python verify_setup.py
```

**Note**: All examples now use the `utils/import_helper.py` utility which automatically sets up the correct Python paths for importing FACT modules. You no longer need to manually configure PYTHONPATH or worry about import paths.

## Environment Setup

### Prerequisites

1. **Python 3.8+** - Required for running the examples
2. **Python packages** - Install with `pip install -r requirements.txt`
3. **Environment variables** - Configure using the `.env` file

### Quick Setup

1. **Install dependencies:**
   ```bash
   cd examples/arcade-dev
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual configuration
   nano .env  # or use your preferred editor
   ```

3. **Verify setup:**
   ```bash
   python verify_setup.py
   ```

### Required Environment Variables

The following environment variables are **required**:

- `ARCADE_API_KEY` - Your Arcade.dev API key (get this from your Arcade.dev dashboard)

### Optional Environment Variables

The following environment variables are **optional** but recommended for optimal functionality:

- `ARCADE_API_URL` - Arcade.dev API URL (default: `https://api.arcade.dev`)
- `ARCADE_TIMEOUT` - Request timeout in seconds (default: `30`)
- `ARCADE_MAX_RETRIES` - Maximum retry attempts (default: `3`)
- `FACT_LOG_LEVEL` - Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL (default: `INFO`)
- `FACT_CACHE_ENABLED` - Enable/disable caching: true/false (default: `true`)

### Additional Configuration

For advanced features, you may also configure:

```env
# Workspace Configuration
ARCADE_WORKSPACE_ID=your_workspace_id

# Redis Caching (if using Redis-based caching)
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Monitoring (if using monitoring features)
ENABLE_METRICS=true
METRICS_ENDPOINT=http://localhost:8080/metrics

# Security (advanced settings)
ENABLE_AUDIT_LOGGING=true
MAX_REQUEST_SIZE=10485760
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
```

See `.env.example` for a complete list of available configuration options.

## Troubleshooting

### Import Errors

If you encounter import errors like `ModuleNotFoundError: No module named 'src'`:

1. **Verify Project Structure**: Ensure you're running from within the FACT project and the `src/` directory exists at the project root
2. **Check Working Directory**: Run examples from the `examples/arcade-dev/` directory
3. **Verify Import Helper**: Ensure `utils/import_helper.py` exists and is working:
   ```bash
   python -c "from utils.import_helper import setup_fact_imports; setup_fact_imports(); print('Import helper working!')"
   ```
4. **Check FACT Installation**: Run the setup verification:
   ```bash
   python verify_setup.py
   ```

### Class Name Errors

If you see errors like `cannot import name 'Driver' from 'src.core.driver'`:

- The examples have been updated to use the correct class names (`FACTDriver` instead of `Driver`)
- If you see this error, ensure you've run the latest version of the examples

### API Key Issues

If you see `Error: ARCADE_API_KEY environment variable not set`:

1. Copy the example environment file: `cp .env.example .env`
2. Edit `.env` and add your Arcade.dev API key
3. Ensure the `.env` file is in the `examples/arcade-dev/` directory

### Common Solutions

- **Clean Setup**: Start fresh by removing any old Python cache: `find . -name "__pycache__" -exec rm -rf {} +`
- **Path Issues**: Ensure you're running Python from the correct directory (`examples/arcade-dev/`)
- **Dependencies**: Reinstall dependencies: `pip install -r requirements.txt`

## Architecture Integration

These examples demonstrate key architectural patterns:

- **Hybrid Execution**: Seamlessly blend local and remote tool execution
- **Fault Tolerance**: Robust error handling and recovery mechanisms
- **Performance Optimization**: Intelligent routing for optimal performance
- **Security**: Secure authentication and authorization patterns
- **Monitoring**: Comprehensive observability and metrics collection

## Best Practices Demonstrated

1. **Security First**: All examples use environment variables for sensitive configuration
2. **Error Resilience**: Comprehensive error handling with graceful degradation
3. **Performance Monitoring**: Real-time metrics and performance tracking
4. **Clean Architecture**: Modular design with clear separation of concerns
5. **Configuration Management**: Environment-based configuration with sensible defaults

## Production Considerations

When adapting these examples for production use:

1. **Security**: Implement proper secret management (e.g., AWS Secrets Manager, HashiCorp Vault)
2. **Monitoring**: Integrate with your observability stack (Prometheus, Grafana, etc.)
3. **Logging**: Configure structured logging with appropriate log levels
4. **Configuration**: Use configuration management tools for complex deployments
5. **Testing**: Implement comprehensive unit and integration tests
6. **Documentation**: Maintain up-to-date API documentation and runbooks

## Dependencies

### Required Dependencies

These examples require the following to be installed:

- **Python 3.8+** - Core runtime requirement
- **Python packages** - Listed in `requirements.txt`, install with:
  ```bash
  pip install -r requirements.txt
  ```
- **FACT SDK components** - Must be accessible from `src/` directory
- **Environment configuration** - Copy `.env.example` to `.env` and configure

### Required Python Packages

The following packages are automatically installed with `requirements.txt`:

- `aiohttp>=3.8.0` - HTTP client for API calls
- `pydantic>=2.0.0` - Data validation and settings
- `python-dotenv>=1.0.0` - Environment variable management
- `redis>=4.5.0` - Redis client for caching (optional usage)

### Optional Dependencies

- **Redis server** - For advanced caching functionality (install separately)
- **Prometheus** - For metrics collection (install separately)

### Verification

Use the setup verification script to check all dependencies:

```bash
python verify_setup.py
```

This will check:
- Python version compatibility
- Required package installation
- Environment variable configuration
- FACT framework accessibility
- Network connectivity (optional)

## Support

For questions or issues with these examples:
1. Check the main FACT SDK documentation
2. Review the source code comments for detailed explanations
3. Examine the logs for debugging information
4. Refer to Arcade.dev platform documentation for API details