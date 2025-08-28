# FACT System Security Guidelines

## Overview

This document provides comprehensive security guidelines and best practices for the FACT (Finance Analysis and Control Tools) system. These guidelines ensure secure development, deployment, and operation of the system.

## Security Architecture

### Defense in Depth

The FACT system implements multiple layers of security:

1. **Network Security**: HTTPS enforcement, CORS protection, SSRF prevention
2. **Application Security**: Input validation, output encoding, secure authentication
3. **Data Security**: Encryption at rest and in transit, secure key management
4. **Infrastructure Security**: Secure configuration, monitoring, logging

### Security Components

- **Authentication & Authorization**: [`src/security/auth.py`](../src/security/auth.py)
- **Token Management**: [`src/security/token_manager.py`](../src/security/token_manager.py)
- **Input Sanitization**: [`src/security/input_sanitizer.py`](../src/security/input_sanitizer.py)
- **Error Handling**: [`src/security/error_handler.py`](../src/security/error_handler.py)
- **Cache Encryption**: [`src/security/cache_encryption.py`](../src/security/cache_encryption.py)
- **Security Configuration**: [`src/security/config.py`](../src/security/config.py)

## Authentication & Authorization

### Secure Token Management

```python
from src.security.token_manager import SecureTokenManager

# Initialize token manager with encryption
token_manager = SecureTokenManager()

# Generate secure access token
token = token_manager.generate_access_token(
    user_id="user123",
    tool_name="SQL.QueryReadonly",
    scopes=["read", "sql"],
    lifetime_seconds=3600
)

# Validate token
token_data = token_manager.validate_token(token)
```

### Authentication Requirements

- **Token Encryption**: All tokens are encrypted using Fernet encryption
- **Token Expiration**: Maximum lifetime of 1 hour for access tokens
- **Scope Validation**: Tokens include specific scopes for fine-grained access control
- **Token Revocation**: Ability to revoke individual tokens or all user tokens

### Authorization Best Practices

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Scope-Based Access**: Use specific scopes for different operations
3. **Regular Token Rotation**: Implement token refresh mechanisms
4. **Session Management**: Proper session timeout and cleanup

## Input Validation & Sanitization

### Input Sanitization

```python
from src.security.input_sanitizer import get_sanitizer

sanitizer = get_sanitizer()

# Sanitize string input
safe_input = sanitizer.sanitize_string(
    user_input,
    max_length=1000,
    field_type="string"
)

# Sanitize dictionary data
safe_data = sanitizer.sanitize_dict(
    user_data,
    field_rules={
        "email": {"type": "email", "max_length": 254},
        "url": {"type": "url", "max_length": 2000}
    }
)
```

### Validation Rules

- **Length Limits**: Enforce maximum lengths for all string inputs
- **Type Validation**: Strict type checking for all parameters
- **Pattern Matching**: Regular expressions for format validation
- **Encoding Validation**: UTF-8 encoding enforcement
- **Injection Prevention**: Detection of SQL, XSS, and command injection patterns

### Security Patterns to Block

1. **XSS Attacks**: `<script>`, `javascript:`, `data:text/html`
2. **SQL Injection**: `UNION SELECT`, `OR 1=1`, `--`
3. **Command Injection**: `;`, `&&`, `||`, backticks
4. **Path Traversal**: `../`, `..\\`, URL-encoded variants

## Database Security

### SQL Injection Prevention

```python
# ✅ SECURE: Using parameterized queries
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))

# ❌ INSECURE: String concatenation
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

### Database Security Features

- **Read-Only Access**: Only SELECT statements allowed through tools
- **Query Validation**: Multi-layer SQL validation and sanitization
- **Parameterized Queries**: All dynamic queries use parameterization
- **Schema Protection**: System tables are blocked from access
- **Query Complexity Limits**: Prevent DoS through complex queries

### Safe Database Practices

1. **Input Validation**: All inputs validated before database operations
2. **Least Privilege**: Database users have minimal required permissions
3. **Query Logging**: All database operations are logged for auditing
4. **Error Sanitization**: Database errors are sanitized before returning to users

## Data Encryption

### Cache Encryption

```python
from src.security.cache_encryption import get_cache_encryption

cache_encryption = get_cache_encryption()

# Encrypt cache data
encrypted_entry = cache_encryption.encrypt_cache_entry(
    content="sensitive data",
    metadata={"user_id": "user123"}
)

# Decrypt cache data
decrypted_data = cache_encryption.decrypt_cache_entry(encrypted_entry)
```

### Encryption Standards

- **Algorithm**: AES-256 via Fernet encryption
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Integrity Protection**: HMAC-SHA256 for tamper detection
- **Key Management**: Secure key generation and storage

### Data Classification

1. **Public**: No encryption required
2. **Internal**: Standard encryption
3. **Confidential**: Strong encryption + access controls
4. **Restricted**: Maximum encryption + audit logging

## Network Security

### HTTPS Enforcement

```python
# Security headers configuration
security_headers = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Content-Security-Policy": "default-src 'self'"
}
```

### Network Protection

- **HTTPS Only**: All communications must use HTTPS
- **CORS Configuration**: Restrictive cross-origin policies
- **SSRF Prevention**: Block access to private IP ranges and localhost
- **Request Validation**: Validate all external URLs and endpoints

### Allowed Network Access

1. **HTTPS URLs**: External APIs with valid SSL certificates
2. **Public IPs**: Non-private IP address ranges
3. **Approved Domains**: Whitelist of allowed external domains
4. **Rate Limiting**: Per-IP and per-user request limits

## Error Handling

### Secure Error Responses

```python
from src.security.error_handler import handle_error

try:
    # Risky operation
    result = dangerous_operation()
except Exception as e:
    # Secure error handling
    error_response = handle_error(
        exception=e,
        context={"user_id": user_id},
        debug_mode=False
    )
    return error_response
```

### Error Security Principles

- **Information Disclosure Prevention**: No internal details in error messages
- **Error Sanitization**: Remove sensitive data from error responses
- **Consistent Error Format**: Standardized error response structure
- **Error Logging**: Full error details logged securely for debugging

### Error Response Format

```json
{
  "error": true,
  "error_code": "VALIDATION_ERROR",
  "message": "Input validation failed",
  "error_id": "uuid-for-tracking"
}
```

## Rate Limiting & Abuse Prevention

### Rate Limiting Configuration

```python
from src.security.config import get_security_config

config = get_security_config()

# Rate limits
user_limit = config.rate_limiting.user_requests_per_minute  # 60
tool_limit = config.rate_limiting.tool_requests_per_minute  # 30
auth_limit = config.rate_limiting.auth_attempts_per_minute  # 5
```

### Rate Limiting Strategy

- **Per-User Limits**: Individual user request quotas
- **Per-Tool Limits**: Tool-specific rate limits
- **Global Limits**: System-wide request limits
- **Authentication Limits**: Failed login attempt limits

### Abuse Prevention

1. **Request Throttling**: Gradual rate limit enforcement
2. **IP Blocking**: Temporary blocks for suspicious activity
3. **Anomaly Detection**: Pattern recognition for abuse
4. **Circuit Breakers**: Automatic system protection

## API Key Management

### Secure API Key Handling

```python
# ✅ SECURE: Environment variables
api_key = os.getenv("ANTHROPIC_API_KEY")

# ✅ SECURE: Encrypted storage
encrypted_key = encrypt_api_key(api_key)

# ❌ INSECURE: Hardcoded keys
api_key = "sk-1234567890abcdef"  # Never do this
```

### API Key Security

- **Environment Storage**: Store keys in environment variables
- **Encryption at Rest**: Encrypt stored API keys
- **Key Rotation**: Regular key rotation policies
- **Access Logging**: Log all API key usage
- **Scope Limitation**: Keys with minimal required permissions

### Key Management Best Practices

1. **Separate Keys**: Different keys for different environments
2. **Regular Rotation**: Monthly or quarterly key rotation
3. **Audit Trails**: Track all key usage and access
4. **Secure Transmission**: Never transmit keys in plain text
5. **Revocation Process**: Quick key revocation capabilities

## Monitoring & Logging

### Security Event Logging

```python
import structlog

logger = structlog.get_logger(__name__)

# Security event logging
logger.warning("Security event detected",
               event_type="failed_authentication",
               user_id=user_id,
               ip_address=request.remote_addr,
               timestamp=time.time())
```

### Monitored Events

- **Authentication Events**: Login attempts, failures, successes
- **Authorization Events**: Permission denials, privilege escalations
- **Input Validation**: Injection attempts, malformed inputs
- **Rate Limiting**: Quota violations, suspicious patterns
- **System Events**: Configuration changes, errors

### Log Security

1. **Log Integrity**: Tamper-proof logging mechanisms
2. **Log Encryption**: Encrypt sensitive log data
3. **Access Controls**: Restrict log access to authorized personnel
4. **Retention Policies**: Secure log retention and disposal
5. **Log Monitoring**: Real-time analysis of security logs

## Deployment Security

### Production Configuration

```bash
# Environment variables for production
export DEBUG_MODE=false
export STRICT_MODE=true
export ENFORCE_HTTPS=true
export RATE_LIMITING_ENABLED=true
export LOG_SECURITY_EVENTS=true
```

### Deployment Checklist

- [ ] Debug mode disabled
- [ ] HTTPS enforcement enabled
- [ ] Rate limiting configured
- [ ] Error handling configured for production
- [ ] Encryption keys properly managed
- [ ] Security headers enabled
- [ ] Monitoring and alerting configured
- [ ] Log aggregation configured

### Infrastructure Security

1. **Network Segmentation**: Isolate application components
2. **Firewall Configuration**: Restrict network access
3. **SSL/TLS Configuration**: Strong cipher suites and protocols
4. **Regular Updates**: Keep all systems and dependencies updated
5. **Backup Security**: Encrypt and secure all backups

## Security Testing

### Automated Security Testing

```python
# Example security test
def test_sql_injection_prevention():
    malicious_input = "'; DROP TABLE users; --"
    
    with pytest.raises(SecurityError):
        validate_sql_query(malicious_input)

def test_xss_prevention():
    malicious_input = "<script>alert('xss')</script>"
    
    sanitized = sanitize_string(malicious_input)
    assert "<script>" not in sanitized
```

### Security Test Categories

1. **Input Validation Tests**: Test all injection attack vectors
2. **Authentication Tests**: Test token security and session management
3. **Authorization Tests**: Test access control enforcement
4. **Encryption Tests**: Test data encryption and key management
5. **Network Security Tests**: Test SSRF and network protections

### Penetration Testing

- **Regular Assessments**: Quarterly security assessments
- **Scope Definition**: Define testing scope and boundaries
- **Remediation Tracking**: Track and verify security fixes
- **Documentation**: Maintain security test documentation

## Incident Response

### Security Incident Categories

1. **Data Breach**: Unauthorized access to sensitive data
2. **System Compromise**: Unauthorized system access
3. **DoS Attack**: Service disruption attempts
4. **Injection Attack**: SQL injection or XSS attempts
5. **Authentication Bypass**: Unauthorized access attempts

### Response Procedures

1. **Detection**: Identify and classify the incident
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze the incident and impact
4. **Remediation**: Fix vulnerabilities and restore services
5. **Documentation**: Document lessons learned and improvements

### Contact Information

For security incidents:
- **Security Team**: security@fact-system.com
- **Emergency Contact**: +1-XXX-XXX-XXXX
- **Incident Tracking**: Use incident management system

## Compliance & Standards

### Security Standards

- **OWASP Top 10**: Address all OWASP security risks
- **NIST Cybersecurity Framework**: Implement framework controls
- **ISO 27001**: Information security management practices
- **GDPR**: Data protection and privacy requirements

### Audit Requirements

1. **Code Reviews**: Security-focused code reviews
2. **Vulnerability Scanning**: Regular automated scans
3. **Compliance Audits**: Regular compliance assessments
4. **Documentation**: Maintain security documentation
5. **Training**: Regular security training for developers

## Security Resources

### Tools and Libraries

- **cryptography**: Python cryptography library
- **structlog**: Structured logging for security events
- **Fernet**: Symmetric encryption for sensitive data
- **PBKDF2**: Key derivation for password hashing

### External Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Python Security Best Practices](https://python.org/dev/security/)
- [Cryptography Best Practices](https://cryptography.io/)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-23  
**Review Cycle**: Quarterly  
**Classification**: Internal Use Only