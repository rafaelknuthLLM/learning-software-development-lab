# REST API Test Suite

A comprehensive test suite for the REST API with 90%+ code coverage, including unit tests, integration tests, security tests, and performance tests.

## 🎯 Overview

This test suite provides comprehensive testing coverage for the REST API application, including:

- **Unit Tests**: Test individual functions and methods in isolation
- **Integration Tests**: Test complete API endpoints and workflows
- **Security Tests**: Test for common vulnerabilities (XSS, SQL injection, etc.)
- **Performance Tests**: Load testing and response time benchmarks
- **Test Utilities**: Reusable helpers and data factories

## 📊 Coverage Goals

- **Lines**: >90%
- **Functions**: >85%
- **Branches**: >85%
- **Statements**: >90%

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (or MongoDB Memory Server for testing)
- Redis (mocked in tests)

### Installation

```bash
cd tests
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:security
npm run test:performance

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test:watch

# Run tests for CI/CD
npm run test:ci
```

## 📁 Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── auth.controller.test.js
│   ├── user.controller.test.js
│   └── ...
├── integration/          # Integration tests
│   ├── auth.integration.test.js
│   ├── users.integration.test.js
│   └── ...
├── security/            # Security tests
│   └── security.test.js
├── performance/         # Performance tests
│   └── performance.test.js
├── utils/               # Test utilities
│   └── testHelpers.js
├── fixtures/            # Test data
│   └── testData.js
├── scripts/             # Test runner scripts
│   └── runTests.js
├── setup.js            # Global test setup
├── jest.config.js      # Jest configuration
└── README.md           # This file
```

## 🧪 Test Types

### Unit Tests

Test individual controllers, services, and utilities in isolation:

```javascript
describe('Auth Controller', () => {
  it('should register a new user successfully', async () => {
    // Test implementation
  });
});
```

**Features:**
- Mock external dependencies
- Test business logic
- Validate error handling
- Fast execution

### Integration Tests

Test complete API endpoints with real database interactions:

```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUserData)
      .expect(201);
    
    TestHelpers.assertApiResponse(response, 201);
  });
});
```

**Features:**
- Real HTTP requests
- Database transactions
- Complete workflows
- Authentication flows

### Security Tests

Test for common security vulnerabilities:

```javascript
describe('SQL Injection Protection', () => {
  it('should prevent SQL injection in email field', async () => {
    const sqlInjectionPayload = "admin@example.com'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: sqlInjectionPayload, password: 'password123' });
    
    // Verify injection was prevented
  });
});
```

**Security areas covered:**
- SQL/NoSQL Injection
- XSS Protection
- Authentication bypass
- Authorization flaws
- Rate limiting
- Input validation
- CORS protection
- Session security

### Performance Tests

Benchmark API response times and load handling:

```javascript
describe('Response Time Benchmarks', () => {
  it('should handle authentication within acceptable time limits', async () => {
    const start = performance.now();
    const response = await request(app)
      .post('/api/auth/login')
      .send(validCredentials);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(1000); // 1 second
  });
});
```

**Performance areas:**
- Response time benchmarks
- Concurrent request handling
- Memory usage monitoring
- Database query performance
- Load testing simulation

## 🛠 Test Utilities

### TestHelpers Class

Provides utility functions for consistent testing:

```javascript
// Generate test data
const userData = TestHelpers.generateUserData();

// Create test user in database
const user = await TestHelpers.createTestUser(userData);

// Generate JWT tokens
const token = TestHelpers.generateTestToken(user._id);

// Assert API response structure
TestHelpers.assertApiResponse(response, 200);
TestHelpers.assertPaginationResponse(response);
```

### Test Fixtures

Pre-defined test data for consistent testing:

```javascript
const { userFixtures, securityFixtures } = require('./fixtures/testData');

// Use predefined valid user data
const response = await request(app)
  .post('/api/auth/register')
  .send(userFixtures.validUser);

// Test with XSS payloads
securityFixtures.xssPayloads.forEach(payload => {
  // Test XSS prevention
});
```

## 📊 Coverage Reports

Test coverage reports are generated in multiple formats:

- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-final.json`
- **LCOV**: `coverage/lcov.info`
- **Text**: Console output

### Viewing Coverage

```bash
# Generate and open HTML coverage report
npm test
open coverage/lcov-report/index.html
```

## 🔧 Configuration

### Jest Configuration

Key Jest settings in `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./setup.js'],
  collectCoverageFrom: [
    '../src/**/*.js',
    '../server.js',
    '!../src/seeders/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90
    }
  }
};
```

### Environment Variables

Test environment variables in `setup.js`:

```javascript
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = mongoUri; // In-memory database
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REDIS_URL = 'redis://localhost:6379'; // Mocked
```

## 🎪 Mocking Strategy

### Database Mocking

Uses MongoDB Memory Server for fast, isolated testing:

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});
```

### Redis Mocking

Redis operations are mocked for consistent testing:

```javascript
jest.mock('ioredis', () => jest.fn().mockImplementation(() => ({
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1)
})));
```

### Email Mocking

Email sending is mocked to prevent actual emails:

```javascript
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  })
}));
```

## 🏗 CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: coverallsapp/github-action@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          path-to-lcov: ./coverage/lcov.info
```

### Test Reports

The test runner generates detailed reports:

- **JSON Report**: Machine-readable results
- **HTML Report**: Human-readable with charts
- **JUnit Report**: CI/CD integration

## 🎯 Best Practices

### Test Organization

1. **Arrange-Act-Assert**: Structure tests clearly
2. **One Assertion**: Each test should verify one behavior
3. **Descriptive Names**: Test names should explain what and why
4. **Independent Tests**: Tests should not depend on each other
5. **Clean Up**: Reset state between tests

### Data Management

1. **Use Factories**: Generate test data dynamically
2. **Fixtures for Constants**: Use fixtures for static data
3. **Realistic Data**: Use faker.js for realistic test data
4. **Clean State**: Start each test with clean database

### Mock Management

1. **Mock External Services**: Don't test third-party APIs
2. **Clear Mocks**: Reset mocks between tests
3. **Verify Mock Calls**: Assert that mocks were called correctly
4. **Mock Consistently**: Use consistent mocking patterns

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npx jest tests/unit/auth.controller.test.js --runInBand

# Run with verbose output
npm run test:verbose
```

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Issues

1. **Database Connection**: Ensure MongoDB Memory Server starts correctly
2. **Async Operations**: Use proper async/await patterns
3. **Mock Timing**: Clear mocks in beforeEach/afterEach
4. **Memory Leaks**: Close connections in afterAll hooks

## 📈 Performance Monitoring

### Benchmarks

Key performance metrics monitored:

- Authentication: <1000ms
- CRUD operations: <500ms
- List operations: <1000ms
- Search operations: <1500ms

### Memory Usage

Tests monitor memory usage to prevent leaks:

```javascript
it('should not leak memory during bulk operations', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Perform operations
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // <100MB
});
```

## 🔒 Security Testing

### Vulnerability Coverage

- **OWASP Top 10**: All major vulnerabilities tested
- **Input Validation**: Malicious input handling
- **Authentication**: Bypass attempts
- **Authorization**: Privilege escalation
- **Session Management**: Token security
- **Rate Limiting**: Brute force protection

### Security Test Categories

1. **Injection Tests**: SQL, NoSQL, XSS prevention
2. **Authentication Tests**: Login security, token validation
3. **Authorization Tests**: Access control, role verification
4. **Input Validation**: Malformed data handling
5. **Session Security**: Token management, logout
6. **Rate Limiting**: Abuse prevention

## 📝 Writing New Tests

### Test Template

```javascript
const request = require('supertest');
const app = require('../server');
const TestHelpers = require('./utils/testHelpers');

describe('Feature Name', () => {
  let testUser, authToken;

  beforeEach(async () => {
    // Setup test data
    testUser = await TestHelpers.createTestUser();
    authToken = TestHelpers.generateTestToken(testUser._id);
  });

  describe('Specific Functionality', () => {
    it('should handle expected case', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'test' })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data).toHaveProperty('expectedProperty');
    });

    it('should handle error case', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalidData: true })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });
  });
});
```

### Adding Test Data

1. **Add to fixtures**: Static test data in `fixtures/testData.js`
2. **Extend helpers**: Dynamic data generation in `utils/testHelpers.js`
3. **Update factories**: Bulk data generation functions

## 🤝 Contributing

### Code Style

- Use ES6+ features
- Follow existing patterns
- Add JSDoc comments
- Use descriptive test names

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Coverage thresholds met
- [ ] Security tests updated if needed
- [ ] Documentation updated

## 📞 Support

For questions or issues with the test suite:

1. Check existing test examples
2. Review documentation
3. Check common issues section
4. Create detailed issue with reproduction steps

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 📊 Test Suite Statistics

- **Total Test Files**: 6+
- **Test Categories**: 4 (Unit, Integration, Security, Performance)
- **Coverage Target**: 90%+
- **Security Tests**: 50+ vulnerability checks
- **Performance Benchmarks**: Response time monitoring
- **Mock Services**: Database, Redis, Email
- **CI/CD Ready**: GitHub Actions compatible