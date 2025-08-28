# Security Example

This example demonstrates comprehensive security best practices for Arcade.dev integration with the FACT SDK.

## Features

- **Secure Credential Management**: Encrypted storage and rotation
- **Input Validation**: Code and user input sanitization
- **Permission Management**: Role-based access control
- **Audit Logging**: Complete security event tracking
- **Rate Limiting**: Request throttling and abuse prevention
- **Session Management**: Secure authentication and authorization

## Security Components

### SecureCredentialManager
- Encrypted credential storage
- Automatic key generation and rotation
- Environment variable fallback
- Secure file permissions (0o600)

### SecurityValidator
- Code pattern detection for dangerous operations
- Input sanitization against XSS and injection attacks
- Size limits and content filtering
- Language-specific security rules

### AuditLogger
- Comprehensive security event logging
- Privacy-preserving data hashing
- Risk scoring for events
- Secure log file permissions

### RateLimiter
- Per-user request limiting
- Configurable time windows
- Automatic cooldown periods
- Abuse detection and blocking

## Security Features

### Authentication & Authorization
```python
# Register user with permissions
client.register_user(
    user_id='developer_1',
    scopes={'read', 'write'},
    allowed_operations={'code_analysis', 'test_generation'}
)

# Authenticate and get session
auth_result = client.authenticate_user(
    user_id='developer_1',
    api_key=api_key,
    ip_address='127.0.0.1'
)
```

### Input Validation
```python
# Validate code for security risks
validation_result = validator.validate_code_input(code, 'python')
if not validation_result['is_safe']:
    print("Dangerous patterns detected:", validation_result['warnings'])
```

### Audit Logging
```python
# All operations are automatically logged
audit_entry = AuditLogEntry(
    timestamp=datetime.now(timezone.utc),
    user_id=user_id,
    operation='code_analysis',
    status='success',
    ip_address=ip_address,
    risk_score=2.0
)
```

## Configuration

Security settings can be customized:

```python
config = SecurityConfig(
    enable_input_validation=True,
    enable_audit_logging=True,
    enable_rate_limiting=True,
    max_requests_per_minute=60,
    max_input_size=1024*1024,  # 1MB
    token_expiry_minutes=60
)
```

## Security Patterns Detected

The validator detects potentially dangerous patterns:
- `eval()`, `exec()` function calls
- OS and subprocess imports
- File system operations
- Dynamic imports
- Input functions

## Risk Scoring

Events are assigned risk scores:
- **0-3**: Normal operations
- **4-6**: Suspicious activity
- **7-8**: High risk events
- **9-10**: Critical security events

## Usage

```python
from secure_tool_execution import SecureArcadeClient, SecurityConfig

# Configure security
config = SecurityConfig(
    enable_input_validation=True,
    enable_audit_logging=True,
    max_requests_per_minute=10
)

# Create secure client
client = SecureArcadeClient(config)

# Secure code analysis
result = await client.secure_code_analysis(
    session_token=token,
    code=user_code,
    language='python',
    ip_address='127.0.0.1'
)
```

## Running the Example

```bash
cd examples/arcade-dev/06_security
python secure_tool_execution.py
```

The demo will show:
1. User registration and authentication
2. Safe code analysis (passes validation)
3. Dangerous code blocking (fails validation)
4. Rate limiting in action
5. Audit log generation

## Security Best Practices

1. **Never hardcode credentials** - Use environment variables
2. **Validate all inputs** - Sanitize and check patterns
3. **Log security events** - Track all operations
4. **Implement rate limiting** - Prevent abuse
5. **Use secure sessions** - Time-limited tokens
6. **Regular key rotation** - Update credentials periodically
7. **Principle of least privilege** - Minimal required permissions