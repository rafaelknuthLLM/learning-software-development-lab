# Validation Test Library

A comprehensive validation library built using Test-Driven Development (TDD) principles with full test coverage.

## Features

- ✅ Email validation
- ✅ Phone number validation
- ✅ URL validation
- ✅ Password strength checking
- ✅ Credit card validation (with Luhn algorithm)
- ✅ Form validation with field dependencies
- ✅ Async validation support
- ✅ Batch validation for large datasets
- ✅ Real-time validation with debouncing
- ✅ Custom validation rules
- ✅ Internationalization support

## Installation

```bash
npm install
```

## Usage

### Basic Validation

```javascript
const { Validator } = require('./src');

const validator = new Validator();

// Email validation
const emailResult = validator.validateEmail('user@example.com');
console.log(emailResult.isValid); // true

// Password validation
const passwordResult = validator.validatePassword('MyP@ssw0rd123!');
console.log(passwordResult.strength); // 'strong'

// Credit card validation
const cardResult = validator.validateCreditCard('4111111111111111');
console.log(cardResult.cardType); // 'visa'
```

### Form Validation

```javascript
const { FormValidator } = require('./src');

const formValidator = new FormValidator();

const formData = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!',
  age: 25,
  terms: true
};

const rules = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'password' },
  confirmPassword: { required: true, matches: 'password' },
  age: { required: true, min: 18 },
  terms: { required: true, value: true }
};

const result = formValidator.validate(formData, rules);
console.log(result.isValid); // true
```

## Testing

Run all tests:
```bash
npm test
```

Generate coverage report:
```bash
npm run coverage
```

## Test Coverage

The library maintains >85% test coverage across:
- Unit tests
- Integration tests
- End-to-end tests

## Documentation

- [Test Guide](docs/TEST_GUIDE.md) - How to run and write tests
- [Test Scenarios](docs/TEST_SCENARIOS.md) - Detailed test case documentation

## CI/CD

Tests run automatically via GitHub Actions on:
- Push to main branch
- Pull requests
- Multiple Node.js versions (18.x, 20.x)

## License

MIT