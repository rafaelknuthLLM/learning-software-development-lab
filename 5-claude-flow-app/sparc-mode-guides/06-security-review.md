# 🛡️ Security-Review Mode

## Purpose

Security-Review mode is the vigilant guardian that systematically audits your code for vulnerabilities, exposed secrets, and security best practice violations. It thinks like an attacker to defend like a professional, ensuring your application is hardened against common and sophisticated threats.

## Non-Technical Analogy

Think of Security-Review mode like a **bank's security consultant**. The consultant:
- Tests every door, window, and vault (entry points)
- Looks for ways thieves might break in (attack vectors)
- Checks if valuable items are properly secured (data protection)
- Ensures alarm systems work (monitoring and logging)
- Verifies staff follow security protocols (secure coding practices)
- Creates emergency response plans (incident handling)

Just as a bank wouldn't open without a security audit, your code shouldn't deploy without a security review.

## When to Use This Mode

✅ **Use Security-Review when:**
- Before deploying to production
- Handling sensitive user data
- Implementing authentication/authorization
- Processing payments or financial data
- Integrating with external APIs
- After major architectural changes
- Following a security incident
- During compliance audits
- Working with file uploads
- Implementing cryptographic functions

❌ **Skip this mode when:**
- Building pure UI components without data
- Working on internal tools with no sensitive data
- Creating documentation
- Writing unit tests

## Typical Workflow

### 1. **Security Scan Initiation** (15-30 minutes)
```bash
# Start security review
npx claude-flow sparc run security-review "Audit user authentication and data handling"
```

The mode will:
- Scan for hardcoded secrets
- Check authentication mechanisms
- Review authorization logic
- Analyze data validation
- Inspect encryption usage
- Examine error handling
- Review logging practices
- Check dependency vulnerabilities

### 2. **Vulnerability Assessment**

#### Secret Detection
```javascript
// ❌ CRITICAL: Hardcoded secrets
const config = {
  apiKey: "sk_live_abcd1234efgh5678",  // EXPOSED SECRET!
  dbPassword: "admin123",               // EXPOSED PASSWORD!
  jwtSecret: "my-secret-key"           // EXPOSED KEY!
};

// ✅ SECURE: Environment variables
const config = {
  apiKey: process.env.API_KEY,
  dbPassword: process.env.DB_PASSWORD,
  jwtSecret: process.env.JWT_SECRET
};

// Also check .env is in .gitignore
// .gitignore
.env
.env.local
.env.*.local
```

#### SQL Injection Prevention
```javascript
// ❌ VULNERABLE: String concatenation
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
db.query(query); // SQL INJECTION RISK!

// ❌ VULNERABLE: Template literals
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ SECURE: Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
db.query(query, [userInput]);

// ✅ SECURE: Prepared statements
const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
stmt.run(userInput);
```

#### XSS Prevention
```javascript
// ❌ VULNERABLE: Direct HTML insertion
element.innerHTML = userInput; // XSS RISK!
document.write(userInput);     // XSS RISK!

// ✅ SECURE: Text content
element.textContent = userInput;

// ✅ SECURE: Sanitization
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// ✅ SECURE: React automatically escapes
return <div>{userInput}</div>;
```

#### Authentication Issues
```javascript
// ❌ VULNERABLE: Weak password requirements
function validatePassword(password) {
  return password.length >= 4; // TOO WEAK!
}

// ✅ SECURE: Strong password requirements
function validatePassword(password) {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  
  return password.length >= minLength &&
         hasUpperCase && hasLowerCase &&
         hasNumbers && hasSpecialChar;
}

// ❌ VULNERABLE: Password stored in plain text
const user = {
  email: 'user@example.com',
  password: 'userPassword123' // NEVER DO THIS!
};

// ✅ SECURE: Password hashing
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(password, 12);
const user = {
  email: 'user@example.com',
  passwordHash: hashedPassword
};
```

### 3. **Security Report Generation**
The mode produces a comprehensive security report:

```markdown
## Security Audit Report

### Critical Issues (Fix Immediately)
1. **Hardcoded API Key** - Line 45 in config.js
   - Risk: API key exposed in source code
   - Fix: Move to environment variable

2. **SQL Injection** - Line 78 in userService.js
   - Risk: Database compromise possible
   - Fix: Use parameterized queries

### High Priority Issues
1. **Missing Rate Limiting** - API endpoints
   - Risk: DDoS attacks, brute force
   - Fix: Implement rate limiting middleware

### Medium Priority Issues
1. **Weak Password Policy**
   - Risk: Easy to crack passwords
   - Fix: Enforce stronger requirements

### Recommendations
- Enable HTTPS everywhere
- Implement CSP headers
- Add security monitoring
- Regular dependency updates
```

## Example Usage

### API Security Audit
```bash
npx claude-flow sparc run security-review "Review REST API authentication and authorization"
```

### Data Protection Review
```bash
npx claude-flow sparc run security-review "Audit PII handling and encryption"
```

### Third-Party Integration
```bash
npx claude-flow sparc run security-review "Review OAuth implementation and token storage"
```

### File Upload Security
```bash
npx claude-flow sparc run security-review "Audit file upload validation and storage"
```

## Output Structure

Security-Review generates:

```
/security
  - audit-report.md           # Comprehensive findings
  - vulnerabilities.json      # Machine-readable issues
  - remediation-plan.md       # Fix priorities and steps
  
/src/security
  - middleware/
    - auth.middleware.js      # Secured authentication
    - rateLimit.middleware.js # Rate limiting
    - validation.middleware.js # Input sanitization
  - utils/
    - encryption.js          # Encryption utilities
    - sanitizer.js          # Input/output sanitization
```

## Best Practices

### ✅ DO:
- Validate all input data
- Sanitize all output data
- Use parameterized queries
- Hash passwords with bcrypt/argon2
- Implement rate limiting
- Use HTTPS everywhere
- Keep dependencies updated
- Log security events
- Implement proper session management
- Use security headers

### ❌ DON'T:
- Store passwords in plain text
- Trust user input
- Use eval() or Function()
- Expose stack traces to users
- Log sensitive data
- Use outdated cryptography
- Implement custom crypto
- Disable security features for convenience
- Share sessions across domains
- Ignore security warnings

## Integration with Other Modes

Security-Review connects to:

1. **← Code**: Reviews implementation for vulnerabilities
2. **← TDD**: Creates security-focused tests
3. **→ Debug**: When security issues are found
4. **→ DevOps**: Implements security in deployment
5. **→ Docs-Writer**: Documents security measures

## Memory Integration

Security findings are tracked:
```bash
# Store vulnerability patterns
npx claude-flow memory store security_vuln "SQL injection in user search"

# Store security decisions
npx claude-flow memory store security_decision "Using JWT with 15min expiry"

# Query security history
npx claude-flow memory query security
```

## Common Vulnerability Patterns

### 1. **OWASP Top 10**

#### A01: Broken Access Control
```javascript
// ❌ VULNERABLE: No authorization check
app.delete('/api/users/:id', async (req, res) => {
  await User.delete(req.params.id);
  res.json({ success: true });
});

// ✅ SECURE: Proper authorization
app.delete('/api/users/:id', authenticate, async (req, res) => {
  // Check if user can delete
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  await User.delete(req.params.id);
  res.json({ success: true });
});
```

#### A02: Cryptographic Failures
```javascript
// ❌ VULNERABLE: Weak encryption
const crypto = require('crypto');
const encrypted = crypto.createCipher('aes-128-ecb', 'password');

// ✅ SECURE: Strong encryption
const encrypted = crypto.createCipheriv(
  'aes-256-gcm',
  crypto.scryptSync(password, salt, 32),
  crypto.randomBytes(16)
);
```

#### A03: Injection
```javascript
// ❌ VULNERABLE: Command injection
const { exec } = require('child_process');
exec(`ping ${userInput}`); // DANGEROUS!

// ✅ SECURE: Use safe alternatives
const { spawn } = require('child_process');
spawn('ping', [userInput], { shell: false });
```

### 2. **Authentication Security**

#### Session Management
```javascript
// ✅ SECURE: Proper session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // No JS access
    maxAge: 900000,      // 15 minutes
    sameSite: 'strict'   // CSRF protection
  }
}));
```

#### JWT Security
```javascript
// ✅ SECURE: JWT with expiry and refresh
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}
```

### 3. **Input Validation**

#### Schema Validation
```javascript
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(12).required(),
  age: Joi.number().integer().min(13).max(120),
  website: Joi.string().uri().optional()
});

function validateUser(data) {
  const { error, value } = userSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true  // Remove unknown fields
  });
  
  if (error) {
    throw new ValidationError(error.details);
  }
  
  return value;
}
```

### 4. **Security Headers**

```javascript
// Helmet.js for Express
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Security Testing

### Automated Security Tests
```javascript
describe('Security Tests', () => {
  it('should not expose sensitive data in errors', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'invalid' });
    
    expect(response.text).not.toContain('password');
    expect(response.text).not.toContain('stack');
    expect(response.text).not.toContain('SQL');
  });
  
  it('should rate limit requests', async () => {
    const requests = Array(100).fill().map(() =>
      request(app).get('/api/users')
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
```

### Penetration Testing Checklist
- [ ] SQL Injection attempts
- [ ] XSS payload testing
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization boundary testing
- [ ] Session fixation testing
- [ ] File upload exploits
- [ ] XXE injection testing
- [ ] Rate limiting verification
- [ ] Error message analysis

## Security Tools Integration

```bash
# Dependency vulnerability scanning
npm audit
npm audit fix

# Static analysis
npx eslint-plugin-security

# Secret scanning
npx secretlint "**/*"

# OWASP dependency check
dependency-check --project "MyApp" --scan .
```

## Tips for Success

1. **Think Like an Attacker**: What would you try to break?
2. **Defense in Depth**: Multiple layers of security
3. **Principle of Least Privilege**: Minimum necessary access
4. **Fail Securely**: Errors shouldn't expose information
5. **Keep It Simple**: Complex security often fails
6. **Stay Updated**: Security landscape changes rapidly
7. **Regular Audits**: Schedule periodic reviews
8. **Document Security**: Make security measures clear

## Conclusion

Security-Review mode is your **digital security guard** that protects your application and users from malicious actors. It ensures your code not only works correctly but also resists attacks and protects sensitive data.

Remember: **Security is not a feature, it's a fundamental requirement. Build it in from the start, not bolted on at the end!**