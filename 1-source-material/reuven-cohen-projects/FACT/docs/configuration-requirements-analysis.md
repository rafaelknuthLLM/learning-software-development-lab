# FACT Benchmark System Configuration Requirements Analysis

## Executive Summary

Analysis of FACT benchmark system error logs and codebase reveals specific API key requirements and configuration structure. The system requires two mandatory API keys and supports extensive optional configuration parameters for caching, benchmarking, security, and monitoring.

## Error Log Analysis

### Identified Error Patterns

**Error Pattern 1: Missing Required API Keys**
```
2025-05-24 17:54:22 [error] Benchmark failed error=Missing required configuration keys: ANTHROPIC_API_KEY, ARCADE_API_KEY
```

**Error Pattern 2: Environment File Not Found**
```
2025-05-24 17:54:22 [warning] No .env file found, using system environment
```

### Root Cause Analysis

1. **Configuration Validation Failure**: System validates required API keys during initialization in [`src/core/config.py:_validate_required_keys()`](src/core/config.py:63)
2. **Environment Loading Issue**: System attempts to load `.env` file but falls back to system environment variables when file is missing
3. **Initialization Sequence**: Benchmark framework initialization depends on successful configuration validation

## Required Configuration Parameters

### Mandatory API Keys

| Parameter | Description | Validation Location |
|-----------|-------------|-------------------|
| `ANTHROPIC_API_KEY` | Claude API access for LLM operations | [`src/core/config.py:64`](src/core/config.py:64) |
| `ARCADE_API_KEY` | Arcade.dev integration for tool hosting | [`src/core/config.py:65`](src/core/config.py:65) |

### Optional Configuration Parameters

#### Core System Configuration
```env
# Optional API Keys
OPENAI_API_KEY=sk-proj-...                    # OpenAI integration (optional)
ENCRYPTION_KEY=base64-encoded-key             # Security encryption key

# System Configuration
ARCADE_BASE_URL=https://api.arcade-ai.com     # Arcade service endpoint
DATABASE_PATH=data/fact_demo.db               # SQLite database location
CACHE_PREFIX=fact_v1                          # Cache namespace identifier
CLAUDE_MODEL=claude-3-haiku-20240307          # Claude model selection
SYSTEM_PROMPT="Custom system prompt..."       # LLM system prompt

# Performance Configuration
MAX_RETRIES=3                                 # Operation retry limit
REQUEST_TIMEOUT=30                            # HTTP request timeout (seconds)
LOG_LEVEL=INFO                                # Logging verbosity

# Cache Configuration
CACHE_MIN_TOKENS=50                           # Minimum tokens for caching
CACHE_MAX_SIZE=10MB                           # Cache size limit
CACHE_TTL_SECONDS=3600                        # Cache entry TTL
CACHE_HIT_TARGET_MS=30                        # Target cache hit latency
CACHE_MISS_TARGET_MS=120                      # Target cache miss latency
```

#### Security Configuration
```env
# Authentication
AUTH_TOKEN_LIFETIME=3600                      # Token lifetime (seconds)
OAUTH_CLIENT_ID=your-oauth-client-id          # OAuth integration
OAUTH_CLIENT_SECRET=your-oauth-secret         # OAuth secret
OAUTH_REDIRECT_URI=https://app.com/callback   # OAuth redirect

# Validation
VALIDATION_MAX_STRING_LENGTH=1048576          # Max input string length
VALIDATION_ALLOW_HTML=false                   # HTML input validation
VALIDATION_ALLOW_JAVASCRIPT=false             # JS input validation

# Rate Limiting
RATE_LIMITING_ENABLED=true                    # Enable rate limiting
RATE_LIMIT_USER_PER_MINUTE=60                 # User request limit

# Security Monitoring
LOG_SECURITY_EVENTS=true                      # Security event logging
SECURITY_LOG_LEVEL=INFO                       # Security log level
ENFORCE_HTTPS=true                            # HTTPS enforcement
DEBUG_MODE=false                              # Debug mode (disable in prod)
STRICT_MODE=true                              # Strict security mode
```

## Configuration Loading Process

### Initialization Sequence

1. **Environment Loading** ([`src/core/config.py:_load_environment()`](src/core/config.py:48))
   ```
   IF .env file exists THEN
       Load environment variables from .env file
       Log success message
   ELSE
       Log warning: "No .env file found, using system environment"
       Continue with system environment variables
   END IF
   ```

2. **Required Key Validation** ([`src/core/config.py:_validate_required_keys()`](src/core/config.py:56))
   ```
   FOR each required_key in [ANTHROPIC_API_KEY, ARCADE_API_KEY]:
       IF environment variable missing OR empty THEN
           Add to missing_keys list
       END IF
   END FOR
   
   IF missing_keys not empty THEN
       RAISE ConfigurationError("Missing required configuration keys: {keys}")
   END IF
   ```

3. **Service Initialization** ([`src/core/driver.py:initialize()`](src/core/driver.py:74))
   ```
   validate_configuration(config)
   initialize_database(config.database_path)
   initialize_cache_system(config.cache_config)
   initialize_arcade_client(config.arcade_api_key)
   test_llm_connectivity(config.anthropic_api_key)
   ```

### Configuration Access Patterns

The system uses property-based access with fallback defaults:

```python
@property
def anthropic_api_key(self) -> str:
    return os.getenv("ANTHROPIC_API_KEY", "")

@property  
def cache_config(self) -> Dict[str, Any]:
    return {
        "prefix": os.getenv("CACHE_PREFIX", "fact_v1"),
        "min_tokens": int(os.getenv("CACHE_MIN_TOKENS", "50")),
        "max_size": os.getenv("CACHE_MAX_SIZE", "10MB"),
        "ttl_seconds": int(os.getenv("CACHE_TTL_SECONDS", "3600"))
    }
```

## Expected .env File Structure

### Complete Template

```env
# =============================================================================
# FACT System Environment Configuration
# =============================================================================

# -----------------------------------------------------------------------------
# REQUIRED API KEYS (System will fail without these)
# -----------------------------------------------------------------------------
ANTHROPIC_API_KEY=sk-ant-api03-...
ARCADE_API_KEY=arc_...

# -----------------------------------------------------------------------------
# OPTIONAL API KEYS
# -----------------------------------------------------------------------------
OPENAI_API_KEY=sk-proj-...
ENCRYPTION_KEY=base64-encoded-encryption-key

# -----------------------------------------------------------------------------
# SYSTEM CONFIGURATION
# -----------------------------------------------------------------------------
ARCADE_BASE_URL=https://api.arcade-ai.com
DATABASE_PATH=data/fact_demo.db
CACHE_PREFIX=fact_v1
CLAUDE_MODEL=claude-3-haiku-20240307
SYSTEM_PROMPT="You are a deterministic finance assistant. When uncertain, request data via tools."

# -----------------------------------------------------------------------------
# PERFORMANCE CONFIGURATION  
# -----------------------------------------------------------------------------
MAX_RETRIES=3
REQUEST_TIMEOUT=30
LOG_LEVEL=INFO

# -----------------------------------------------------------------------------
# CACHE CONFIGURATION
# -----------------------------------------------------------------------------
CACHE_MIN_TOKENS=50
CACHE_MAX_SIZE=10MB
CACHE_TTL_SECONDS=3600
CACHE_HIT_TARGET_MS=30
CACHE_MISS_TARGET_MS=120

# -----------------------------------------------------------------------------
# SECURITY CONFIGURATION
# -----------------------------------------------------------------------------
AUTH_TOKEN_LIFETIME=3600
RATE_LIMITING_ENABLED=true
RATE_LIMIT_USER_PER_MINUTE=60
LOG_SECURITY_EVENTS=true
SECURITY_LOG_LEVEL=INFO
ENFORCE_HTTPS=true
DEBUG_MODE=false
STRICT_MODE=true

# -----------------------------------------------------------------------------
# OAUTH CONFIGURATION (Optional)
# -----------------------------------------------------------------------------
# OAUTH_CLIENT_ID=your-oauth-client-id
# OAUTH_CLIENT_SECRET=your-oauth-client-secret  
# OAUTH_REDIRECT_URI=https://your-app.com/oauth/callback

# -----------------------------------------------------------------------------
# VALIDATION CONFIGURATION
# -----------------------------------------------------------------------------
VALIDATION_MAX_STRING_LENGTH=1048576
VALIDATION_ALLOW_HTML=false
VALIDATION_ALLOW_JAVASCRIPT=false
```

## Configuration Issues and Solutions

### Issue 1: Missing Required API Keys

**Problem**: `ConfigurationError: Missing required configuration keys: ANTHROPIC_API_KEY, ARCADE_API_KEY`

**Solution**:
1. Create `.env` file in project root
2. Add required API keys with valid values
3. Ensure keys are not empty or whitespace-only

**Validation**:
```bash
python main.py validate
```

### Issue 2: .env File Not Found

**Problem**: `No .env file found, using system environment`

**Solution**:
1. Create `.env` file in project root directory
2. Add all required configuration parameters
3. Verify file is readable by application

**Alternative**: Set environment variables directly in system/container

### Issue 3: Invalid Configuration Values

**Problem**: Type conversion errors or invalid parameter values

**Solution**:
1. Verify numeric parameters are valid integers/floats
2. Check boolean values use `true`/`false` (lowercase)
3. Validate file paths are accessible
4. Ensure URLs are properly formatted

## Testing Configuration

### Configuration Validation Script

```python
# TEST: Validate configuration loading
async def test_configuration_validation():
    try:
        config = get_config()
        validate_configuration(config)
        print("✅ Configuration validation passed")
        return True
    except ConfigurationError as e:
        print(f"❌ Configuration error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

# TEST: Validate required API keys
def test_required_api_keys():
    required_keys = ["ANTHROPIC_API_KEY", "ARCADE_API_KEY"]
    missing = [key for key in required_keys if not os.getenv(key)]
    
    if missing:
        print(f"❌ Missing required keys: {', '.join(missing)}")
        return False
    
    print("✅ All required API keys present")
    return True

# TEST: Validate service connectivity  
async def test_service_connectivity():
    try:
        driver = await get_driver()
        await driver.test_connectivity()
        print("✅ Service connectivity test passed")
        return True
    except ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return False
```

## Configuration Best Practices

### Security Considerations

1. **API Key Management**:
   - Store API keys in `.env` file (never commit to version control)
   - Use environment variables in production
   - Rotate keys regularly
   - Implement key validation

2. **Sensitive Data Protection**:
   - Enable `STRICT_MODE=true` in production
   - Set `DEBUG_MODE=false` in production
   - Use encryption for sensitive cache data
   - Implement proper access controls

3. **Performance Optimization**:
   - Tune cache settings based on usage patterns
   - Set appropriate timeout values
   - Configure rate limiting for production load
   - Monitor and adjust benchmark targets

### Development vs Production

**Development Configuration**:
```env
DEBUG_MODE=true
LOG_LEVEL=DEBUG
STRICT_MODE=false
CACHE_MAX_SIZE=1MB
REQUEST_TIMEOUT=60
```

**Production Configuration**:
```env
DEBUG_MODE=false
LOG_LEVEL=INFO
STRICT_MODE=true  
CACHE_MAX_SIZE=100MB
REQUEST_TIMEOUT=30
ENFORCE_HTTPS=true
RATE_LIMITING_ENABLED=true
```

## Configuration Dependencies

### Service Dependencies

1. **Anthropic Claude API**: Required for all LLM operations
2. **Arcade.dev Service**: Required for tool hosting and execution
3. **SQLite Database**: File-based storage (auto-created)
4. **Cache System**: In-memory with optional persistence

### Component Dependencies

```
Configuration Loading
    ↓
Required Key Validation  
    ↓
Database Initialization
    ↓  
Cache System Setup
    ↓
API Client Initialization
    ↓
Service Connectivity Test
    ↓
System Ready
```

## Troubleshooting Guide

### Common Configuration Errors

1. **Invalid API Key Format**: Verify key format matches provider specifications
2. **File Permission Issues**: Ensure `.env` file is readable
3. **Type Conversion Errors**: Check numeric parameters are valid numbers
4. **Network Connectivity**: Verify API endpoints are accessible
5. **Database Path Issues**: Ensure database directory exists and is writable

### Diagnostic Commands

```bash
# Validate system configuration
python main.py validate

# Test with specific log level
python main.py validate --log-level DEBUG

# Check environment variables
python -c "from src.core.config import get_config; print(get_config().to_dict())"

# Test API connectivity
python -c "import asyncio; from src.core.driver import get_driver; asyncio.run(get_driver().test_connectivity())"
```

This analysis provides a complete understanding of the FACT benchmark system's configuration requirements, error patterns, and initialization process based on the provided error logs and codebase examination.