// Unit tests for Validator class - London School TDD
const Validator = require('../../src/validator');
const ValidationRules = require('../../src/validationRules');
const testData = require('../fixtures/testData');
const TestHelpers = require('../helpers/testHelpers');

describe('Validator', () => {
  let validator;
  let mockRules;

  beforeEach(() => {
    validator = new Validator();
    mockRules = jest.spyOn(ValidationRules.prototype, 'getRules');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Email Validation', () => {
    test.each(testData.validEmails)('should validate valid email: %s', (email) => {
      const result = validator.validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test.each(testData.invalidEmails)('should reject invalid email: %s', (email) => {
      const result = validator.validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatch(/invalid email/i);
    });

    test('should handle null email input', () => {
      const result = validator.validateEmail(null);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/email is required/i);
    });

    test('should trim whitespace from email', () => {
      const result = validator.validateEmail('  user@example.com  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Phone Number Validation', () => {
    test.each(testData.validPhones)('should validate valid phone: %s', (phone) => {
      const result = validator.validatePhone(phone);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test.each(testData.invalidPhones)('should reject invalid phone: %s', (phone) => {
      const result = validator.validatePhone(phone);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    test('should normalize phone numbers', () => {
      const result = validator.validatePhone('(555) 123-4567');
      expect(result.normalized).toBe('5551234567');
    });
  });

  describe('URL Validation', () => {
    test.each(testData.validUrls)('should validate valid URL: %s', (url) => {
      const result = validator.validateUrl(url);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test.each(testData.invalidUrls)('should reject invalid URL: %s', (url) => {
      const result = validator.validateUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    test('should validate URLs with specific protocols', () => {
      const result = validator.validateUrl('https://example.com', { protocols: ['https'] });
      expect(result.isValid).toBe(true);
      
      const httpResult = validator.validateUrl('http://example.com', { protocols: ['https'] });
      expect(httpResult.isValid).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      const result = validator.validatePassword(testData.validPasswords.strong);
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    test('should reject weak passwords with detailed errors', () => {
      const result = validator.validatePassword(testData.invalidPasswords.tooShort);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    test('should enforce custom password rules', () => {
      const customRules = {
        minLength: 12,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      };
      
      const result = validator.validatePassword('Short123!', customRules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters');
    });

    test('should calculate password strength', () => {
      const weak = validator.validatePassword('password');
      const medium = validator.validatePassword('Password123');
      const strong = validator.validatePassword('MyP@ssw0rd123!');
      
      expect(weak.strength).toBe('weak');
      expect(medium.strength).toBe('medium');
      expect(strong.strength).toBe('strong');
    });
  });

  describe('Credit Card Validation', () => {
    test.each(Object.entries(testData.creditCards.valid))(
      'should validate valid %s card',
      (type, number) => {
        const result = validator.validateCreditCard(number);
        expect(result.isValid).toBe(true);
        expect(result.cardType).toBe(type);
      }
    );

    test.each(Object.values(testData.creditCards.invalid))(
      'should reject invalid card: %s',
      (number) => {
        const result = validator.validateCreditCard(number);
        expect(result.isValid).toBe(false);
      }
    );

    test('should use Luhn algorithm for checksum validation', () => {
      const result = validator.validateCreditCard('4111111111111111');
      expect(result.isValid).toBe(true);
      expect(result.checksumValid).toBe(true);
    });
  });

  describe('Custom Validation Rules', () => {
    test('should allow custom validation functions', () => {
      const customRule = jest.fn().mockReturnValue(true);
      validator.addCustomRule('customField', customRule);
      
      const result = validator.validate({ customField: 'test' }, { customField: 'custom' });
      
      expect(customRule).toHaveBeenCalledWith('test', expect.any(Object));
      expect(result.isValid).toBe(true);
    });

    test('should chain multiple validators', () => {
      const result = validator
        .chain()
        .validateEmail('user@example.com')
        .validatePhone('555-123-4567')
        .validateUrl('https://example.com')
        .execute();
      
      expect(result.isValid).toBe(true);
      expect(result.validations).toHaveLength(3);
    });
  });

  describe('Async Validation', () => {
    test('should handle async validation rules', async () => {
      const asyncValidator = TestHelpers.mockAsyncValidator(100, true);
      validator.addAsyncRule('username', asyncValidator);
      
      const result = await validator.validateAsync({ username: 'testuser' });
      
      expect(asyncValidator).toHaveBeenCalled();
      expect(result.isValid).toBe(true);
    });

    test('should timeout long-running async validations', async () => {
      const slowValidator = TestHelpers.mockAsyncValidator(5000, true);
      validator.addAsyncRule('slowField', slowValidator);
      
      const result = await validator.validateAsync(
        { slowField: 'test' },
        { timeout: 1000 }
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Validation timeout');
    });
  });

  describe('Batch Validation', () => {
    test('should validate multiple fields in batch', () => {
      const data = {
        email: 'user@example.com',
        phone: '555-123-4567',
        url: 'https://example.com',
        password: 'MyP@ssw0rd123!'
      };
      
      const rules = {
        email: 'email',
        phone: 'phone',
        url: 'url',
        password: 'password'
      };
      
      const result = validator.validateBatch(data, rules);
      
      expect(result.isValid).toBe(true);
      expect(result.fields).toHaveProperty('email');
      expect(result.fields).toHaveProperty('phone');
      expect(result.fields).toHaveProperty('url');
      expect(result.fields).toHaveProperty('password');
    });

    test('should collect all errors in batch validation', () => {
      const data = {
        email: 'invalid',
        phone: '123',
        url: 'not-a-url'
      };
      
      const rules = {
        email: 'email',
        phone: 'phone',
        url: 'url'
      };
      
      const result = validator.validateBatch(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.fields.email.isValid).toBe(false);
      expect(result.fields.phone.isValid).toBe(false);
      expect(result.fields.url.isValid).toBe(false);
    });
  });

  describe('Error Messages', () => {
    test('should provide customizable error messages', () => {
      validator.setErrorMessages({
        email: 'Please provide a valid email address',
        required: 'This field is mandatory'
      });
      
      const result = validator.validateEmail('invalid');
      expect(result.errors[0]).toBe('Please provide a valid email address');
    });

    test('should support internationalization', () => {
      validator.setLocale('es');
      const result = validator.validateEmail('invalid');
      expect(result.errors[0]).toMatch(/correo electrónico/i);
    });
  });
});