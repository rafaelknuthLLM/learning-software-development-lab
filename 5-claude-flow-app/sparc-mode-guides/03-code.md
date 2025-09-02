# 🧠 Code Mode

## Purpose

Code mode is the implementation specialist that transforms specifications and architecture into clean, production-ready code. It focuses on writing maintainable, efficient, and well-structured code that follows best practices and design patterns while strictly adhering to environment safety.

## Non-Technical Analogy

Think of Code mode like a **master craftsman building custom furniture**. The craftsman:
- Takes the blueprint (specification) and starts with quality materials
- Uses the right tools for each specific task
- Follows time-tested techniques and joinery methods
- Ensures each piece fits perfectly with others
- Finishes with attention to detail and durability
- Never cuts corners that would compromise structural integrity

Just as a craftsman transforms raw materials into functional furniture, Code mode transforms requirements into working software.

## When to Use This Mode

✅ **Use Code mode when:**
- Implementing new features from specifications
- Building components defined in architecture
- Creating utility functions and helpers
- Implementing business logic
- Writing API endpoints
- Building data access layers
- Creating service integrations
- Implementing algorithms from pseudocode

❌ **Skip this mode when:**
- You need test-first development (use TDD mode)
- Planning or designing (use spec-pseudocode or architect)
- Only fixing simple typos
- Pure documentation tasks

## Typical Workflow

### 1. **Context Analysis** (5-10 minutes)
```bash
# Start implementation
npx claude-flow sparc run code "Implement user authentication with JWT"
```

The mode will:
- Review specifications from memory
- Check architectural decisions
- Identify required dependencies
- Plan implementation approach
- Set up file structure

### 2. **Implementation Process**
The mode follows these steps:
- **Environment Setup**: Configuration files, env variables
- **Core Logic**: Main functionality implementation
- **Error Handling**: Comprehensive error management
- **Input Validation**: Data sanitization and validation
- **Integration Points**: Connecting with other services
- **Code Organization**: Proper file structure and modularity

### 3. **Code Quality Standards**
Every implementation includes:
```javascript
// Clean function signatures
async function authenticateUser(credentials) {
  // Input validation
  validateCredentials(credentials);
  
  // Core logic with error handling
  try {
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Security considerations
    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Return structured response
    return {
      token: generateJWT(user),
      user: sanitizeUserData(user)
    };
  } catch (error) {
    logger.error('Authentication failed', { error, email: credentials.email });
    throw error;
  }
}
```

### 4. **Environment Safety**
```javascript
// NEVER hardcode secrets
const config = {
  jwtSecret: process.env.JWT_SECRET, // ✅ From environment
  dbUrl: process.env.DATABASE_URL,    // ✅ From environment
  apiKey: "sk-abc123..."              // ❌ NEVER do this
};

// Always use configuration files
import { config } from './config/app.config';
```

## Example Usage

### Basic Feature Implementation
```bash
npx claude-flow sparc run code "Create REST API for product catalog"
```

### Complex Business Logic
```bash
npx claude-flow sparc run code "Implement shopping cart with discount calculation engine"
```

### Service Integration
```bash
npx claude-flow sparc run code "Integrate Stripe payment processing"
```

### Data Processing
```bash
npx claude-flow sparc run code "Build CSV import processor with validation"
```

## Output Structure

Code mode generates:

```
/src
  /controllers
    - userController.js     # Request handling
  /services
    - userService.js        # Business logic
  /repositories
    - userRepository.js     # Data access
  /models
    - user.model.js        # Data models
  /utils
    - validation.js        # Helper functions
  /config
    - app.config.js        # Configuration
  /middleware
    - auth.middleware.js   # Cross-cutting concerns
```

## Best Practices

### ✅ DO:
- Keep functions small and focused (< 50 lines)
- Use descriptive variable and function names
- Handle errors at appropriate levels
- Validate all inputs
- Use dependency injection
- Follow SOLID principles
- Keep files under 500 lines
- Use async/await for asynchronous code
- Implement proper logging
- Write self-documenting code

### ❌ DON'T:
- Hardcode environment-specific values
- Mix business logic with infrastructure code
- Create deeply nested code (> 3 levels)
- Use global variables
- Ignore error cases
- Write overly clever code
- Create circular dependencies
- Mix concerns in single functions

## Integration with Other Modes

Code mode connects to:

1. **← Spec-Pseudocode**: Implements defined logic
2. **← Architect**: Follows structural design
3. **→ TDD**: Code can be verified with tests
4. **→ Debug**: When issues arise during implementation
5. **→ Refinement**: For optimization after initial implementation

## Memory Integration

Implementation details are stored:
```bash
# Store implementation decisions
npx claude-flow memory store code_auth "JWT implementation with refresh tokens"

# Store patterns used
npx claude-flow memory store code_patterns "Repository pattern for data access"

# Query implementation details
npx claude-flow memory query code_auth
```

## Common Implementation Patterns

### 1. **Repository Pattern**
```javascript
class UserRepository {
  constructor(database) {
    this.db = database;
  }

  async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0];
  }

  async create(userData) {
    const query = `
      INSERT INTO users (email, name, created_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [userData.email, userData.name, new Date()];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }
}
```

### 2. **Service Layer Pattern**
```javascript
class UserService {
  constructor(userRepository, emailService) {
    this.userRepo = userRepository;
    this.emailService = emailService;
  }

  async registerUser(userData) {
    // Business logic
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new BusinessError('User already exists');
    }

    // Create user
    const user = await this.userRepo.create(userData);
    
    // Send welcome email
    await this.emailService.sendWelcome(user);
    
    return user;
  }
}
```

### 3. **Controller Pattern**
```javascript
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async register(req, res, next) {
    try {
      // Validate input
      const { error, value } = validateUserInput(req.body);
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Call service
      const user = await this.userService.registerUser(value);
      
      // Return response
      res.status(201).json({
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### 4. **Factory Pattern**
```javascript
class PaymentProcessorFactory {
  static create(type) {
    switch (type) {
      case 'stripe':
        return new StripeProcessor(process.env.STRIPE_KEY);
      case 'paypal':
        return new PayPalProcessor(process.env.PAYPAL_KEY);
      default:
        throw new Error(`Unknown payment processor: ${type}`);
    }
  }
}
```

## Error Handling Strategies

### Structured Error Classes
```javascript
class ApplicationError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class ValidationError extends ApplicationError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}
```

### Global Error Handler
```javascript
function errorHandler(err, req, res, next) {
  const { statusCode = 500, message } = err;
  
  logger.error({
    error: err,
    request: req.url,
    method: req.method
  });

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal server error' : message
  });
}
```

## Security Considerations

### Input Validation
```javascript
function validateUserInput(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required()
  });
  
  return schema.validate(data);
}
```

### SQL Injection Prevention
```javascript
// Always use parameterized queries
const safeQuery = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(safeQuery, [userEmail]);

// Never concatenate user input
const unsafeQuery = `SELECT * FROM users WHERE email = '${userEmail}'`; // ❌
```

## Performance Optimization Tips

1. **Use Caching**: Cache frequently accessed data
2. **Lazy Loading**: Load resources only when needed
3. **Database Indexing**: Index frequently queried columns
4. **Connection Pooling**: Reuse database connections
5. **Async Operations**: Don't block the event loop
6. **Batch Operations**: Process multiple items together

## Tips for Success

1. **Start Simple**: Get basic functionality working first
2. **Refactor Early**: Don't let technical debt accumulate
3. **Think Modular**: Create reusable components
4. **Handle Edge Cases**: Consider what could go wrong
5. **Optimize Later**: Make it work, then make it fast
6. **Stay Consistent**: Follow project conventions
7. **Document Complex Logic**: Future you will thank you

## Conclusion

Code mode is your **implementation expert** that transforms ideas into working software. It ensures your code is not just functional, but also maintainable, secure, and scalable. By following best practices and patterns, Code mode helps you build software that stands the test of time.

Remember: **Clean code is written once but read many times. Make it count!**