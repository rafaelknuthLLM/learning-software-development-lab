# FACT Environment Configuration Guide

This guide explains how to configure the FACT system environment variables for optimal performance and security.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.template .env
   ```

2. **Edit the `.env` file and add your API keys:**
   ```bash
   # Required API keys - get these from the respective services
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   ARCADE_API_KEY=arc_your-actual-key-here
   ```

3. **Validate your configuration:**
   ```bash
   python scripts/validate_env.py --verbose
   ```

4. **Test system connectivity (optional):**
   ```bash
   python scripts/validate_env.py --check-connectivity
   ```

## Required Configuration

### API Keys (Mandatory)

#### Anthropic Claude API Key
- **Variable:** `ANTHROPIC_API_KEY`
- **Format:** `sk-ant-api03-[alphanumeric string]`
- **Get it from:** [Anthropic Console](https://console.anthropic.com/)
- **Required:** Yes

#### Arcade AI API Key
- **Variable:** `ARCADE_API_KEY`
- **Format:** `arc_[alphanumeric string]`
- **Get it from:** [Arcade AI Dashboard](https://arcade-ai.com/dashboard)
- **Required:** Yes

## Optional Configuration

### Additional API Keys

#### OpenAI API Key (Optional)
- **Variable:** `OPENAI_API_KEY`
- **Format:** `sk-proj-[alphanumeric string]`
- **Get it from:** [OpenAI Platform](https://platform.openai.com/api-keys)
- **Purpose:** Extended LLM capabilities

#### Encryption Keys (Optional)
```bash
# Generate encryption keys with:
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Add to .env:
ENCRYPTION_KEY=your_base64_encoded_key_here
CACHE_ENCRYPTION_KEY=your_base64_encoded_cache_key_here
```

### System Configuration

| Variable | Default | Range | Description |
|----------|---------|--------|-------------|
| `CLAUDE_MODEL` | `claude-3-5-sonnet-20241022` | `claude-3-*` | Claude model to use |
| `MAX_RETRIES` | `3` | 1-10 | Maximum API retry attempts |
| `REQUEST_TIMEOUT` | `30` | 5-300 | Request timeout in seconds |
| `LOG_LEVEL` | `INFO` | DEBUG/INFO/WARNING/ERROR | Logging verbosity |
| `DATABASE_PATH` | `data/fact_demo.db` | Valid path | Database file location |

### Cache Configuration

| Variable | Default | Range | Description |
|----------|---------|--------|-------------|
| `CACHE_PREFIX` | `fact_v1` | 1-50 chars | Cache key prefix |
| `CACHE_MIN_TOKENS` | `50` | 1-1000 | Minimum tokens to cache |
| `CACHE_MAX_SIZE` | `100MB` | 1MB-10GB | Maximum cache size |
| `CACHE_TTL_SECONDS` | `3600` | 60-86400 | Cache time-to-live |
| `CACHE_HIT_TARGET_MS` | `50.0` | > 0 | Target cache hit time |
| `CACHE_MISS_TARGET_MS` | `200.0` | > 0 | Target cache miss time |

### Security Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `STRICT_MODE` | `true` | Enable strict validation |
| `DEBUG_MODE` | `false` | Enable debug features |
| `ENFORCE_HTTPS` | `true` | Require HTTPS connections |
| `RATE_LIMITING_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_USER_PER_MINUTE` | `60` | User requests per minute |
| `RATE_LIMIT_TOOL_PER_MINUTE` | `30` | Tool requests per minute |
| `RATE_LIMIT_AUTH_PER_MINUTE` | `5` | Auth requests per minute |

### Input Validation

| Variable | Default | Description |
|----------|---------|-------------|
| `VALIDATION_MAX_STRING_LENGTH` | `10000` | Maximum input string length |
| `VALIDATION_ALLOW_HTML` | `false` | Allow HTML in inputs |
| `VALIDATION_ALLOW_JAVASCRIPT` | `false` | Allow JavaScript in inputs |

## Environment-Specific Configuration

### Development Environment

Create `.env.local` for development:
```bash
# Development settings
DEBUG_MODE=true
LOG_LEVEL=DEBUG
STRICT_MODE=false
RATE_LIMITING_ENABLED=false

# Your development API keys
ANTHROPIC_API_KEY=sk-ant-api03-your-dev-key
ARCADE_API_KEY=arc_your-dev-key
```

### Production Environment

Create `.env.production` for production:
```bash
# Production security settings
STRICT_MODE=true
DEBUG_MODE=false
ENFORCE_HTTPS=true
LOG_LEVEL=WARNING
RATE_LIMITING_ENABLED=true

# Production API keys (use environment variables in deployment)
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ARCADE_API_KEY=${ARCADE_API_KEY}

# Enhanced security
LOG_SECURITY_EVENTS=true
ENABLE_INTRUSION_DETECTION=true
SECURITY_LOG_RETENTION_DAYS=90
```

### Staging Environment

Create `.env.staging` for staging:
```bash
# Staging settings (production-like with relaxed logging)
STRICT_MODE=true
DEBUG_MODE=false
LOG_LEVEL=INFO
RATE_LIMITING_ENABLED=true

# Staging API keys
ANTHROPIC_API_KEY=sk-ant-api03-your-staging-key
ARCADE_API_KEY=arc_your-staging-key
```

## Configuration Validation

### Automatic Validation

The system automatically validates configuration on startup:

```python
# The system validates:
# 1. Required API keys are present and correctly formatted
# 2. Parameter values are within valid ranges
# 3. File paths are accessible
# 4. Cache configuration is valid
```

### Manual Validation

Use the validation script for thorough testing:

```bash
# Basic validation
python scripts/validate_env.py

# Detailed output
python scripts/validate_env.py --verbose

# Include connectivity tests
python scripts/validate_env.py --check-connectivity

# Example output:
# ✅ Configuration validation passed!
# 🎉 Your FACT system is ready to use!
```

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Missing required configuration keys` | API keys not set or using placeholders | Set real API keys in `.env` |
| `Invalid API key format` | Wrong key format or extra characters | Check key format and remove whitespace |
| `Parameter validation failed` | Value outside allowed range | Check parameter documentation |
| `Database path not accessible` | File permissions or missing directory | Check file permissions and create directories |

## Security Best Practices

### API Key Management

1. **Never commit API keys to version control**
   ```bash
   # .gitignore already includes:
   .env
   .env.local
   .env.production
   .env.staging
   ```

2. **Use environment-specific files**
   ```bash
   .env.local      # Local development
   .env.staging    # Staging environment
   .env.production # Production environment
   ```

3. **Rotate API keys regularly**
   - Set calendar reminders for quarterly rotation
   - Monitor API usage for unauthorized access
   - Use different keys for different environments

4. **Use system environment variables in production**
   ```bash
   # Set in deployment environment
   export ANTHROPIC_API_KEY="sk-ant-api03-..."
   export ARCADE_API_KEY="arc_..."
   ```

### Encryption

1. **Enable data encryption for sensitive data**
   ```bash
   # Generate and set encryption keys
   ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
   CACHE_ENCRYPTION_KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
   ```

2. **Secure key storage**
   - Use dedicated secret management services
   - Never store encryption keys alongside encrypted data
   - Consider hardware security modules (HSMs) for production

### Network Security

1. **Configure CORS for web deployments**
   ```bash
   CORS_ALLOWED_ORIGINS=https://your-frontend.com,https://your-app.com
   ```

2. **Block private IPs in production**
   ```bash
   BLOCK_PRIVATE_IPS=true
   BLOCK_LOCALHOST=true
   ```

3. **Enable HTTPS enforcement**
   ```bash
   ENFORCE_HTTPS=true
   ```

## Troubleshooting

### Configuration Issues

#### Problem: "Missing required configuration keys"
```bash
# Check if .env file exists and has correct content
cat .env | grep -E "(ANTHROPIC|ARCADE)_API_KEY"

# Verify file is being loaded
python scripts/validate_env.py --verbose
```

#### Problem: "Invalid API key format"
```bash
# Check for extra whitespace or characters
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('ANTHROPIC_API_KEY', '')
print(f'Key: [{key}]')
print(f'Length: {len(key)}')
print(f'Starts with sk-ant-api03-: {key.startswith(\"sk-ant-api03-\")}')
"
```

#### Problem: "Service connectivity failed"
```bash
# Test network connectivity
curl -I https://api.anthropic.com
curl -I https://api.arcade-ai.com

# Check firewall/proxy settings
python scripts/validate_env.py --check-connectivity
```

### Performance Issues

#### Problem: "Configuration loading slow"
```bash
# Check .env file size
ls -la .env

# Profile configuration loading
python -c "
import time
start = time.time()
from dotenv import load_dotenv
load_dotenv()
print(f'Load time: {time.time() - start:.3f}s')
"
```

#### Problem: "Cache configuration warnings"
```bash
# Check cache settings
python scripts/validate_env.py --verbose | grep -i cache

# Test cache size parsing
python -c "
import re
size = 'your_cache_size_here'
pattern = r'^(\d+)(K|M|G|T)?B$'
match = re.match(pattern, size.upper())
print(f'Valid format: {match is not None}')
"
```

## Advanced Configuration

### Custom System Prompts

```bash
# Override the default system prompt
SYSTEM_PROMPT="You are a specialized financial analysis assistant with expertise in FACT benchmark evaluation. Always request data through available tools when uncertain."
```

### OAuth Integration

```bash
# Enable OAuth authentication
AUTH_TOKEN_LIFETIME=3600
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REDIRECT_URI=https://your-app.com/auth/callback
```

### Monitoring Integration

```bash
# Enable comprehensive monitoring
ENABLE_PERFORMANCE_MONITORING=true
METRICS_COLLECTION_INTERVAL=60
HEALTH_CHECK_INTERVAL=300
HEALTH_CHECK_TIMEOUT=30
```

## Migration Guide

### From Previous Versions

If upgrading from a previous FACT version:

1. **Backup existing configuration**
   ```bash
   cp .env .env.backup.$(date +%Y%m%d)
   ```

2. **Update configuration format**
   ```bash
   # Compare with new template
   diff .env .env.template
   ```

3. **Add new required parameters**
   ```bash
   # Check what's missing
   python scripts/validate_env.py --verbose
   ```

4. **Test updated configuration**
   ```bash
   python scripts/validate_env.py --check-connectivity
   ```

## Support

### Getting Help

1. **Configuration validation failed:**
   - Run: `python scripts/validate_env.py --verbose`
   - Check: `docs/configuration-requirements-specification.md`
   - Review: Error messages and recovery suggestions

2. **API connectivity issues:**
   - Verify API keys are active and correctly formatted
   - Check network connectivity and firewall settings
   - Test with: `python scripts/validate_env.py --check-connectivity`

3. **Performance concerns:**
   - Review cache configuration settings
   - Check database path permissions
   - Monitor system resource usage

### Additional Resources

- [Configuration Requirements Specification](configuration-requirements-specification.md)
- [Installation and Setup Guide](2_installation_setup.md)
- [API Reference](api-specification.md)
- [Troubleshooting Guide](../README.md#troubleshooting)

---

*Last updated: 2025-01-24*
*Version: 1.0.0*