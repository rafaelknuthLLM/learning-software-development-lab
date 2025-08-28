# FACT Security Libraries Guide

> Comprehensive guide to security libraries and best practices in the FACT system

## Overview

Security is paramount in the FACT system, especially when dealing with AI-generated tools, external APIs, and sensitive data. This guide covers the security libraries integrated into FACT and their proper usage.

## Security Dependencies

### 🔐 Cryptography & Encryption

#### cryptography 41.0.0+
**Modern cryptographic recipes and primitives**

```python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import os
import base64

class FactEncryption:
    def __init__(self, password: bytes):
        # Derive a key from password
        salt = os.urandom(16)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        self.cipher = Fernet(key)
        self.salt = salt
    
    def encrypt_api_key(self, api_key: str) -> bytes:
        """Encrypt sensitive API keys for storage"""
        return self.cipher.encrypt(api_key.encode())
    
    def decrypt_api_key(self, encrypted_key: bytes) -> str:
        """Decrypt API keys for use"""
        return self.cipher.decrypt(encrypted_key).decode()

# Usage for storing LLM API keys securely
encryptor = FactEncryption(os.environ["MASTER_PASSWORD"].encode())
encrypted_anthropic_key = encryptor.encrypt_api_key(os.environ["ANTHROPIC_API_KEY"])
```

#### argon2-cffi 23.1.0
**Secure password hashing**

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

class UserAuthentication:
    def __init__(self):
        self.ph = PasswordHasher()
    
    def hash_password(self, password: str) -> str:
        """Hash password for storage"""
        return self.ph.hash(password)
    
    def verify_password(self, hashed_password: str, password: str) -> bool:
        """Verify password against hash"""
        try:
            self.ph.verify(hashed_password, password)
            return True
        except VerifyMismatchError:
            return False
    
    def check_needs_rehash(self, hashed_password: str) -> bool:
        """Check if password needs rehashing (security updates)"""
        return self.ph.check_needs_rehash(hashed_password)

# Usage
auth = UserAuthentication()
hashed_pw = auth.hash_password("user_password")
is_valid = auth.verify_password(hashed_pw, "user_password")
```

### 🛡️ Input Validation & Sanitization

#### validators 0.22.0
**Comprehensive data validation**

```python
import validators
from typing import Union, List
from pydantic import BaseModel, validator

class SecureToolInput(BaseModel):
    url: str
    email: str
    ip_address: str
    file_paths: List[str]
    
    @validator('url')
    def validate_url(cls, v):
        if not validators.url(v):
            raise ValueError('Invalid URL format')
        
        # Additional security: block localhost and private IPs
        from urllib.parse import urlparse
        parsed = urlparse(v)
        if parsed.hostname in ['localhost', '127.0.0.1']:
            raise ValueError('Localhost URLs not allowed')
        
        return v
    
    @validator('email')
    def validate_email(cls, v):
        if not validators.email(v):
            raise ValueError('Invalid email format')
        return v
    
    @validator('ip_address')
    def validate_ip(cls, v):
        if not (validators.ipv4(v) or validators.ipv6(v)):
            raise ValueError('Invalid IP address')
        
        # Block private IP ranges
        import ipaddress
        ip = ipaddress.ip_address(v)
        if ip.is_private:
            raise ValueError('Private IP addresses not allowed')
        
        return v
    
    @validator('file_paths')
    def validate_file_paths(cls, v):
        """Prevent path traversal attacks"""
        safe_paths = []
        for path in v:
            # Normalize path and check for traversal attempts
            normalized = os.path.normpath(path)
            if '..' in normalized or normalized.startswith('/'):
                raise ValueError(f'Unsafe file path: {path}')
            safe_paths.append(normalized)
        return safe_paths
```

#### bleach 6.1.0
**HTML sanitization for user content**

```python
import bleach
from typing import Dict, Any

class ContentSanitizer:
    def __init__(self):
        # Allowed HTML tags and attributes
        self.allowed_tags = [
            'p', 'br', 'strong', 'em', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'code', 'pre'
        ]
        
        self.allowed_attributes = {
            '*': ['class'],
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'width', 'height']
        }
    
    def sanitize_html(self, content: str) -> str:
        """Sanitize HTML content from user input"""
        return bleach.clean(
            content,
            tags=self.allowed_tags,
            attributes=self.allowed_attributes,
            strip=True
        )
    
    def sanitize_tool_description(self, description: str) -> str:
        """Sanitize tool descriptions that may contain user input"""
        # Remove all HTML tags for tool descriptions
        return bleach.clean(description, tags=[], strip=True)
    
    def extract_links(self, content: str) -> List[str]:
        """Extract and validate links from content"""
        links = bleach.linkifier.Linker().linkify(content)
        validated_links = []
        
        for link in links:
            if validators.url(link):
                validated_links.append(link)
        
        return validated_links

# Usage
sanitizer = ContentSanitizer()
safe_content = sanitizer.sanitize_html("<script>alert('xss')</script><p>Safe content</p>")
# Result: "<p>Safe content</p>"
```

### ⚠️ Rate Limiting & Protection

#### limits 3.6.0 & slowapi 0.1.9
**Rate limiting for API protection**

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
import redis

# Configure rate limiter with Redis backend
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379"
)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

class APISecurityMiddleware:
    def __init__(self, app: FastAPI):
        self.app = app
        self.limiter = limiter
    
    @limiter.limit("100/hour")  # 100 requests per hour per IP
    async def tool_execution_endpoint(self, request: Request):
        """Rate-limited tool execution endpoint"""
        pass
    
    @limiter.limit("10/minute")  # 10 requests per minute for AI generation
    async def ai_generation_endpoint(self, request: Request):
        """Rate-limited AI tool generation endpoint"""
        pass
    
    @limiter.limit("1000/hour")  # Higher limit for data queries
    async def data_query_endpoint(self, request: Request):
        """Rate-limited data query endpoint"""
        pass

# Custom rate limiting for different user tiers
class TieredRateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
        
        # Rate limits by user tier
        self.tier_limits = {
            "free": {"requests": 100, "period": 3600},      # 100/hour
            "premium": {"requests": 1000, "period": 3600},   # 1000/hour
            "enterprise": {"requests": 10000, "period": 3600} # 10000/hour
        }
    
    async def check_rate_limit(self, user_id: str, user_tier: str) -> bool:
        """Check if user has exceeded their rate limit"""
        limit_config = self.tier_limits.get(user_tier, self.tier_limits["free"])
        
        key = f"rate_limit:{user_id}:{user_tier}"
        current_count = await self.redis.get(key)
        
        if current_count is None:
            # First request in this period
            await self.redis.setex(key, limit_config["period"], 1)
            return True
        
        if int(current_count) >= limit_config["requests"]:
            return False
        
        # Increment counter
        await self.redis.incr(key)
        return True
```

### 🔑 Authentication & Authorization

#### pyjwt 2.8.0
**JSON Web Token implementation**

```python
import jwt
from datetime import datetime, timedelta
from typing import Dict, Optional
from pydantic import BaseModel

class TokenManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire = timedelta(hours=1)
        self.refresh_token_expire = timedelta(days=7)
    
    def create_access_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + self.access_token_expire
        
        to_encode = {
            **user_data,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: str) -> str:
        """Create JWT refresh token"""
        expire = datetime.utcnow() + self.refresh_token_expire
        
        to_encode = {
            "user_id": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        }
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm]
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")

class UserPermissions(BaseModel):
    can_create_tools: bool = False
    can_execute_tools: bool = True
    can_access_ai: bool = False
    can_manage_users: bool = False
    max_tool_executions_per_hour: int = 100

class AuthorizationManager:
    def __init__(self):
        # Role-based permissions
        self.role_permissions = {
            "user": UserPermissions(),
            "premium": UserPermissions(
                can_create_tools=True,
                can_access_ai=True,
                max_tool_executions_per_hour=1000
            ),
            "admin": UserPermissions(
                can_create_tools=True,
                can_execute_tools=True,
                can_access_ai=True,
                can_manage_users=True,
                max_tool_executions_per_hour=10000
            )
        }
    
    def check_permission(self, user_role: str, permission: str) -> bool:
        """Check if user role has specific permission"""
        permissions = self.role_permissions.get(user_role)
        if not permissions:
            return False
        
        return getattr(permissions, permission, False)
    
    def get_user_limits(self, user_role: str) -> UserPermissions:
        """Get user limits based on role"""
        return self.role_permissions.get(user_role, self.role_permissions["user"])
```

### 🔍 Security Monitoring

#### prometheus-client 0.18.0
**Security metrics collection**

```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
from functools import wraps

# Security-related metrics
security_events = Counter(
    'fact_security_events_total',
    'Total security events',
    ['event_type', 'severity']
)

failed_authentications = Counter(
    'fact_failed_auth_total',
    'Failed authentication attempts',
    ['method', 'user_agent']
)

api_request_duration = Histogram(
    'fact_api_request_duration_seconds',
    'API request duration',
    ['endpoint', 'method', 'status']
)

active_sessions = Gauge(
    'fact_active_sessions',
    'Number of active user sessions'
)

rate_limit_violations = Counter(
    'fact_rate_limit_violations_total',
    'Rate limit violations',
    ['endpoint', 'user_tier']
)

class SecurityMonitor:
    def __init__(self):
        self.start_metrics_server()
    
    def start_metrics_server(self, port: int = 8000):
        """Start Prometheus metrics server"""
        start_http_server(port)
    
    def log_security_event(self, event_type: str, severity: str = "medium"):
        """Log security-related events"""
        security_events.labels(event_type=event_type, severity=severity).inc()
    
    def log_failed_auth(self, method: str, user_agent: str):
        """Log failed authentication attempts"""
        failed_authentications.labels(method=method, user_agent=user_agent).inc()
    
    def log_rate_limit_violation(self, endpoint: str, user_tier: str):
        """Log rate limit violations"""
        rate_limit_violations.labels(endpoint=endpoint, user_tier=user_tier).inc()
    
    def track_api_performance(self, endpoint: str, method: str):
        """Decorator to track API performance"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start_time = time.time()
                status = "success"
                
                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    status = "error"
                    self.log_security_event("api_error", "high")
                    raise
                finally:
                    duration = time.time() - start_time
                    api_request_duration.labels(
                        endpoint=endpoint,
                        method=method,
                        status=status
                    ).observe(duration)
            
            return wrapper
        return decorator

# Usage
monitor = SecurityMonitor()

# Log security events
monitor.log_security_event("suspicious_request", "high")
monitor.log_failed_auth("jwt", "curl/7.68.0")
monitor.log_rate_limit_violation("/api/tools/execute", "free")
```

## Integrated Security Patterns

### Complete Secure Tool Execution

```python
from typing import Dict, Any, Optional
import structlog
from pydantic import BaseModel, validator
import aiohttp
import asyncio

class SecureToolExecutor:
    def __init__(self):
        self.logger = structlog.get_logger().bind(component="secure_executor")
        self.content_sanitizer = ContentSanitizer()
        self.auth_manager = AuthorizationManager()
        self.token_manager = TokenManager(os.environ["JWT_SECRET"])
        self.monitor = SecurityMonitor()
        self.rate_limiter = TieredRateLimiter(redis.Redis())
    
    async def execute_tool_securely(
        self,
        tool_input: Dict[str, Any],
        user_token: str,
        user_ip: str
    ) -> Dict[str, Any]:
        """Securely execute a tool with full security checks"""
        
        # 1. Verify authentication
        try:
            user_data = self.token_manager.verify_token(user_token)
        except ValueError as e:
            self.monitor.log_security_event("invalid_token", "medium")
            raise SecurityError(f"Authentication failed: {e}")
        
        user_id = user_data.get("user_id")
        user_role = user_data.get("role", "user")
        
        # 2. Check authorization
        if not self.auth_manager.check_permission(user_role, "can_execute_tools"):
            self.monitor.log_security_event("unauthorized_access", "high")
            raise SecurityError("Insufficient permissions")
        
        # 3. Rate limiting
        if not await self.rate_limiter.check_rate_limit(user_id, user_role):
            self.monitor.log_rate_limit_violation("tool_execution", user_role)
            raise SecurityError("Rate limit exceeded")
        
        # 4. Input validation and sanitization
        try:
            validated_input = self._validate_and_sanitize_input(tool_input)
        except ValueError as e:
            self.monitor.log_security_event("invalid_input", "medium")
            raise SecurityError(f"Input validation failed: {e}")
        
        # 5. Execute with monitoring
        with self.monitor.track_api_performance("tool_execution", "POST"):
            try:
                result = await self._execute_tool_safely(validated_input, user_data)
                
                self.logger.info(
                    "Tool executed successfully",
                    user_id=user_id,
                    tool_type=validated_input.get("type"),
                    execution_time=result.get("execution_time_ms")
                )
                
                return result
                
            except Exception as e:
                self.monitor.log_security_event("execution_error", "high")
                self.logger.error(
                    "Tool execution failed",
                    user_id=user_id,
                    error=str(e)
                )
                raise
    
    def _validate_and_sanitize_input(self, tool_input: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and sanitize tool input"""
        sanitized = {}
        
        for key, value in tool_input.items():
            if isinstance(value, str):
                # Sanitize string inputs
                if key in ["description", "name", "title"]:
                    sanitized[key] = self.content_sanitizer.sanitize_html(value)
                else:
                    sanitized[key] = bleach.clean(value, tags=[], strip=True)
            elif isinstance(value, (list, dict)):
                # Recursively sanitize nested structures
                sanitized[key] = self._sanitize_nested(value)
            else:
                sanitized[key] = value
        
        return sanitized
    
    def _sanitize_nested(self, data):
        """Recursively sanitize nested data structures"""
        if isinstance(data, dict):
            return {k: self._sanitize_nested(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_nested(item) for item in data]
        elif isinstance(data, str):
            return bleach.clean(data, tags=[], strip=True)
        else:
            return data
    
    async def _execute_tool_safely(
        self, 
        validated_input: Dict[str, Any], 
        user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute tool with additional safety measures"""
        
        # Set execution timeout based on user tier
        user_role = user_data.get("role", "user")
        timeout_seconds = {
            "user": 30,
            "premium": 60,
            "admin": 120
        }.get(user_role, 30)
        
        try:
            # Execute with timeout
            result = await asyncio.wait_for(
                self._actual_tool_execution(validated_input),
                timeout=timeout_seconds
            )
            return result
            
        except asyncio.TimeoutError:
            self.monitor.log_security_event("execution_timeout", "medium")
            raise SecurityError(f"Tool execution timed out after {timeout_seconds}s")

class SecurityError(Exception):
    """Custom exception for security-related errors"""
    pass
```

## Security Configuration

### Environment Variables Security

```bash
# .env.example - Security configuration template

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_HOURS=1
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Encryption
MASTER_PASSWORD=your-encryption-master-password
FERNET_KEY=your-fernet-encryption-key

# API Keys (encrypted in production)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# Rate Limiting
REDIS_URL=redis://localhost:6379
RATE_LIMIT_ENABLED=true

# Security Headers
SECURE_HEADERS_ENABLED=true
CORS_ORIGINS=["http://localhost:3000"]

# Monitoring
PROMETHEUS_METRICS_PORT=8000
SECURITY_MONITORING_ENABLED=true
```

### Security Headers Configuration

```python
from secure import Secure

def configure_security_headers(app: FastAPI):
    """Configure security headers for the application"""
    
    secure_headers = Secure(
        server="FACT-System",
        content_type="nosniff",
        xfo="deny",
        hsts="max-age=31536000; includeSubDomains",
        referrer="strict-origin-when-cross-origin",
        cache="no-cache, no-store, must-revalidate",
        feature="camera 'none'; microphone 'none'; geolocation 'none'",
        csp="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    )
    
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        secure_headers.framework.fastapi(response)
        return response
```

## Security Best Practices

### 1. Input Validation
- **Always validate inputs** using Pydantic models
- **Sanitize HTML content** with bleach
- **Check for path traversal** in file operations
- **Validate URLs and IPs** to prevent SSRF attacks

### 2. Authentication & Authorization
- **Use strong JWT secrets** (minimum 256 bits)
- **Implement token rotation** for long-lived sessions
- **Apply principle of least privilege** for user roles
- **Monitor failed authentication attempts**

### 3. Rate Limiting
- **Implement tiered rate limiting** based on user roles
- **Use Redis** for distributed rate limiting
- **Monitor rate limit violations**
- **Apply different limits** for different operations

### 4. Data Protection
- **Encrypt sensitive data** at rest
- **Use secure password hashing** (Argon2)
- **Implement proper key management**
- **Never log sensitive information**

### 5. Monitoring & Alerting
- **Track security events** with Prometheus
- **Set up alerts** for suspicious activities
- **Monitor API performance** and errors
- **Log all security-relevant events**

---

*Security is an ongoing process. Regularly review and update security measures based on new threats and vulnerabilities.*