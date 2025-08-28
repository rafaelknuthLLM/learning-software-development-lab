# Validation Library Test Guide

## Overview
This validation library has been built using Test-Driven Development (TDD) principles with comprehensive test coverage.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual components
│   └── validator.test.js
├── integration/       # Integration tests for component interactions
│   └── formValidation.test.js
├── e2e/              # End-to-end workflow tests
│   └── validation.e2e.test.js
├── fixtures/         # Test data and mock data
│   └── testData.js
└── helpers/          # Testing utilities
    └── testHelpers.js
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### End-to-End Tests Only
```bash
npm run test:e2e
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run coverage
```

## Test Coverage

The project maintains a minimum of 90% code coverage across:
- Statements
- Branches
- Functions
- Lines

Coverage reports are generated in the `coverage/` directory.

## Testing Best Practices

1. **No Hardcoded Values**: All test data is stored in fixtures
2. **Test Independence**: Each test runs in isolation
3. **Mock External Dependencies**: External services are mocked
4. **Behavior Testing**: Tests focus on behavior, not implementation
5. **Descriptive Names**: Test names clearly describe what is being tested

## Test Categories

### Unit Tests
- Email validation
- Phone number validation
- URL validation
- Password strength validation
- Credit card validation
- Custom validation rules
- Async validation
- Batch validation

### Integration Tests
- User registration forms
- Payment forms
- Dynamic form validation
- Real-time validation
- Field dependencies
- Conditional validation

### E2E Tests
- Complete registration workflow
- Payment processing workflow
- Multi-step forms
- Bulk data import
- API validation
- Large dataset handling

## Debugging Tests

To debug a specific test:
```bash
node --inspect-brk node_modules/.bin/jest tests/unit/validator.test.js
```

## CI/CD Integration

Tests run automatically on:
- Push to main branch
- Pull requests
- Pre-commit hooks (if configured)

See `.github/workflows/test.yml` for CI configuration.