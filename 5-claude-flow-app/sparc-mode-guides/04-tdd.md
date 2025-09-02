# 🧪 TDD (Test-Driven Development) Mode

## Purpose

TDD mode is the quality-first implementation specialist that follows the red-green-refactor cycle to build robust, well-tested code. It ensures every line of code has a purpose by writing tests first, then implementing just enough code to make them pass, creating a safety net for future changes.

## Non-Technical Analogy

Think of TDD mode like a **chef developing a new recipe**. The chef:
- First decides what the dish should taste like (writes the test)
- Creates a small sample and tastes it (runs the test - it fails)
- Adjusts ingredients until it tastes right (writes code to pass)
- Refines the technique for consistency (refactors)
- Documents each step so others can reproduce it perfectly
- Ensures every ingredient has a purpose

Just as a chef perfects a recipe through iterative tasting and adjusting, TDD perfects code through iterative testing and implementation.

## When to Use This Mode

✅ **Use TDD when:**
- Building critical business logic
- Creating new features from scratch
- Implementing complex algorithms
- Working with financial calculations
- Building APIs with contracts
- Developing reusable libraries
- Need high confidence in correctness
- Working in a team environment
- Creating code that will be maintained long-term

❌ **Skip this mode when:**
- Prototyping or exploring ideas
- Writing simple scripts
- Pure UI styling work
- Working with legacy code without tests
- Time is extremely constrained for POC

## Typical Workflow

### 1. **The TDD Cycle** (Red-Green-Refactor)
```bash
# Start TDD process
npx claude-flow sparc run tdd "Build shopping cart with discount calculation"
```

The mode follows this cycle:

#### 🔴 RED Phase (Write Failing Test)
```javascript
describe('ShoppingCart', () => {
  it('should calculate total with 10% discount for orders over $100', () => {
    const cart = new ShoppingCart();
    cart.addItem({ id: 1, price: 50, quantity: 3 }); // $150
    
    expect(cart.getTotal()).toBe(135); // $150 - 10% = $135
  });
});
// Test fails: ShoppingCart doesn't exist yet
```

#### 🟢 GREEN Phase (Make Test Pass)
```javascript
class ShoppingCart {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }

  getTotal() {
    const subtotal = this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    if (subtotal > 100) {
      return subtotal * 0.9; // Apply 10% discount
    }
    return subtotal;
  }
}
// Test passes!
```

#### 🔵 REFACTOR Phase (Improve Code)
```javascript
class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountThreshold = 100;
    this.discountRate = 0.1;
  }

  addItem(item) {
    this.items.push(item);
  }

  getTotal() {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount(subtotal);
    return subtotal - discount;
  }

  calculateSubtotal() {
    return this.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
  }

  calculateDiscount(subtotal) {
    if (subtotal > this.discountThreshold) {
      return subtotal * this.discountRate;
    }
    return 0;
  }
}
// Test still passes, code is cleaner!
```

### 2. **Test Organization**
The mode creates comprehensive test suites:

```javascript
describe('UserService', () => {
  describe('registration', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      
      // Act
      const user = await userService.register(userData);
      
      // Assert
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = { email: 'existing@example.com', name: 'Test' };
      await userService.register(userData);
      
      // Act & Assert
      await expect(userService.register(userData))
        .rejects
        .toThrow('User already exists');
    });

    it('should send welcome email after registration', async () => {
      // Arrange
      const spy = jest.spyOn(emailService, 'sendWelcome');
      const userData = { email: 'new@example.com', name: 'New User' };
      
      // Act
      await userService.register(userData);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ email: userData.email })
      );
    });
  });
});
```

### 3. **Coverage Goals**
TDD mode aims for:
- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: 100%
- **Edge Cases**: Comprehensive

## Example Usage

### API Endpoint Testing
```bash
npx claude-flow sparc run tdd "Create REST API for user management with CRUD operations"
```

### Algorithm Implementation
```bash
npx claude-flow sparc run tdd "Implement binary search tree with insertion and traversal"
```

### Business Logic
```bash
npx claude-flow sparc run tdd "Build invoice generation with tax calculation and discounts"
```

### Integration Testing
```bash
npx claude-flow sparc run tdd "Create payment processing with Stripe integration"
```

## Output Structure

TDD mode generates parallel test and implementation files:

```
/src
  /services
    - userService.js           # Implementation
    - userService.test.js      # Unit tests
  /controllers
    - userController.js        # Implementation
    - userController.test.js   # Unit tests
  /utils
    - validation.js           # Implementation
    - validation.test.js      # Unit tests
/tests
  /integration
    - api.test.js            # Integration tests
  /e2e
    - userFlow.test.js       # End-to-end tests
```

## Best Practices

### ✅ DO:
- Write the test first, always
- Keep tests simple and focused
- Test one thing at a time
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test edge cases and error conditions
- Mock external dependencies
- Keep tests independent
- Run tests frequently
- Maintain test code quality

### ❌ DON'T:
- Write implementation before tests
- Test implementation details
- Create interdependent tests
- Use real external services in unit tests
- Ignore failing tests
- Write overly complex tests
- Test framework/library code
- Skip the refactor phase

## Integration with Other Modes

TDD mode connects to:

1. **← Spec-Pseudocode**: Tests verify specifications
2. **← Architect**: Tests validate architectural boundaries
3. **↔ Code**: Alternates between test and implementation
4. **→ Debug**: When tests reveal issues
5. **→ Refinement**: Refactoring with test safety net

## Memory Integration

Test patterns and coverage are stored:
```bash
# Store test patterns
npx claude-flow memory store tdd_patterns "Using factory pattern for test data"

# Store coverage metrics
npx claude-flow memory store tdd_coverage "95% line coverage achieved"

# Query test strategies
npx claude-flow memory query tdd
```

## Testing Patterns

### 1. **Unit Testing Pattern**
```javascript
describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(calculator.add(-2, 3)).toBe(1);
    });

    it('should handle decimal numbers', () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });
});
```

### 2. **Integration Testing Pattern**
```javascript
describe('API Integration', () => {
  let app;
  let database;

  beforeAll(async () => {
    database = await setupTestDatabase();
    app = createApp(database);
  });

  afterAll(async () => {
    await database.close();
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const response = await request(app)
        .post('/users')
        .send({ email: 'test@example.com', name: 'Test' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
    });
  });
});
```

### 3. **Mocking Pattern**
```javascript
describe('EmailService', () => {
  it('should send email via SMTP', async () => {
    // Mock external dependency
    const mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
    };

    const emailService = new EmailService(mockTransporter);
    await emailService.send({
      to: 'user@example.com',
      subject: 'Test',
      body: 'Hello'
    });

    expect(mockTransporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Test'
      })
    );
  });
});
```

### 4. **Test Data Builder Pattern**
```javascript
class UserBuilder {
  constructor() {
    this.user = {
      id: '123',
      email: 'default@example.com',
      name: 'Default User',
      role: 'user'
    };
  }

  withEmail(email) {
    this.user.email = email;
    return this;
  }

  withRole(role) {
    this.user.role = role;
    return this;
  }

  build() {
    return { ...this.user };
  }
}

// Usage in tests
const adminUser = new UserBuilder()
  .withRole('admin')
  .withEmail('admin@example.com')
  .build();
```

## Testing Strategies

### Test Pyramid
```
         /\
        /e2e\        <- Few, slow, expensive
       /------\
      /  int   \     <- Some, moderate speed
     /----------\
    /   unit     \   <- Many, fast, cheap
   /--------------\
```

### Coverage Types

1. **Statement Coverage**: Every line executed
2. **Branch Coverage**: Every if/else path taken
3. **Function Coverage**: Every function called
4. **Line Coverage**: Every line tested
5. **Path Coverage**: Every possible route through code

### Test Types

1. **Unit Tests**: Individual functions/methods
2. **Integration Tests**: Component interactions
3. **API Tests**: Endpoint functionality
4. **Contract Tests**: Service agreements
5. **E2E Tests**: Complete user workflows

## Common Testing Scenarios

### Async Testing
```javascript
it('should fetch user data', async () => {
  const userData = await userService.getUser('123');
  expect(userData).toBeDefined();
  expect(userData.id).toBe('123');
});
```

### Error Testing
```javascript
it('should throw error for invalid input', () => {
  expect(() => {
    validateEmail('not-an-email');
  }).toThrow('Invalid email format');
});
```

### Timeout Testing
```javascript
it('should timeout after 5 seconds', async () => {
  const promise = longRunningOperation();
  await expect(promise).rejects.toThrow('Operation timed out');
}, 10000); // Test timeout
```

### Snapshot Testing
```javascript
it('should match expected output structure', () => {
  const result = formatUserData(userData);
  expect(result).toMatchSnapshot();
});
```

## Tips for Success

1. **Start Small**: Write the simplest failing test first
2. **Baby Steps**: Make small incremental changes
3. **YAGNI**: Don't write code until a test requires it
4. **Listen to Tests**: Hard-to-test code is often poorly designed
5. **Refactor Fearlessly**: Tests provide safety net
6. **Test Behavior**: Not implementation details
7. **Keep DRY**: But readability over DRY in tests
8. **Fast Feedback**: Run tests continuously

## Conclusion

TDD mode is your **quality assurance expert** that ensures every piece of code is purposeful, tested, and maintainable. By writing tests first, you clarify requirements, prevent bugs, and create documentation through executable specifications.

Remember: **TDD is not about testing, it's about design. Tests are a pleasant side effect of good design!**