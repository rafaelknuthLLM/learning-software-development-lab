// Integration tests for form validation scenarios
const Validator = require('../../src/validator');
const FormValidator = require('../../src/formValidator');
const testData = require('../fixtures/testData');

describe('Form Validation Integration', () => {
  let formValidator;

  beforeEach(() => {
    formValidator = new FormValidator();
  });

  describe('User Registration Form', () => {
    const registrationRules = {
      username: { required: true, minLength: 3, maxLength: 20 },
      email: { required: true, type: 'email' },
      password: { required: true, type: 'password', strength: 'medium' },
      confirmPassword: { required: true, matches: 'password' },
      age: { required: true, type: 'number', min: 18 },
      terms: { required: true, type: 'boolean', value: true }
    };

    test('should validate complete registration form', () => {
      const formData = {
        username: 'testuser123',
        email: 'user@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        age: 25,
        terms: true
      };

      const result = formValidator.validate(formData, registrationRules);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect password mismatch', () => {
      const formData = {
        username: 'testuser123',
        email: 'user@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        age: 25,
        terms: true
      };

      const result = formValidator.validate(formData, registrationRules);
      
      expect(result.isValid).toBe(false);
      expect(result.fields.confirmPassword.errors).toContain('Passwords do not match');
    });

    test('should enforce age restrictions', () => {
      const formData = {
        username: 'younguser',
        email: 'young@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        age: 16,
        terms: true
      };

      const result = formValidator.validate(formData, registrationRules);
      
      expect(result.isValid).toBe(false);
      expect(result.fields.age.errors).toContain('Must be at least 18');
    });

    test('should require terms acceptance', () => {
      const formData = {
        username: 'testuser123',
        email: 'user@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        age: 25,
        terms: false
      };

      const result = formValidator.validate(formData, registrationRules);
      
      expect(result.isValid).toBe(false);
      expect(result.fields.terms.errors).toContain('You must accept the terms');
    });
  });

  describe('Payment Form', () => {
    const paymentRules = {
      cardNumber: { required: true, type: 'creditCard' },
      cardHolder: { required: true, minLength: 2 },
      expiryMonth: { required: true, type: 'number', min: 1, max: 12 },
      expiryYear: { required: true, type: 'number', min: new Date().getFullYear() },
      cvv: { required: true, pattern: /^\d{3,4}$/ },
      billingAddress: {
        street: { required: true },
        city: { required: true },
        zipCode: { required: true, pattern: /^\d{5}(-\d{4})?$/ },
        country: { required: true }
      }
    };

    test('should validate complete payment form', () => {
      const formData = {
        cardNumber: '4111111111111111',
        cardHolder: 'John Doe',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        billingAddress: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA'
        }
      };

      const result = formValidator.validate(formData, paymentRules);
      
      expect(result.isValid).toBe(true);
      expect(result.cardType).toBe('visa');
    });

    test('should reject expired cards', () => {
      const formData = {
        cardNumber: '4111111111111111',
        cardHolder: 'John Doe',
        expiryMonth: 12,
        expiryYear: 2020,
        cvv: '123',
        billingAddress: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA'
        }
      };

      const result = formValidator.validate(formData, paymentRules);
      
      expect(result.isValid).toBe(false);
      expect(result.fields.expiryYear.errors).toContain('Card has expired');
    });

    test('should validate nested billing address', () => {
      const formData = {
        cardNumber: '4111111111111111',
        cardHolder: 'John Doe',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        billingAddress: {
          street: '',
          city: 'New York',
          zipCode: 'invalid',
          country: 'USA'
        }
      };

      const result = formValidator.validate(formData, paymentRules);
      
      expect(result.isValid).toBe(false);
      expect(result.fields.billingAddress.street.errors).toContain('Street is required');
      expect(result.fields.billingAddress.zipCode.errors).toContain('Invalid zip code format');
    });
  });

  describe('Dynamic Form Validation', () => {
    test('should handle conditional validation rules', () => {
      const conditionalRules = {
        accountType: { required: true, enum: ['personal', 'business'] },
        businessName: { 
          required: (data) => data.accountType === 'business',
          minLength: 2
        },
        taxId: {
          required: (data) => data.accountType === 'business',
          pattern: /^\d{2}-\d{7}$/
        }
      };

      const personalAccount = {
        accountType: 'personal'
      };

      const businessAccount = {
        accountType: 'business',
        businessName: 'ACME Corp',
        taxId: '12-3456789'
      };

      const personalResult = formValidator.validate(personalAccount, conditionalRules);
      const businessResult = formValidator.validate(businessAccount, conditionalRules);

      expect(personalResult.isValid).toBe(true);
      expect(businessResult.isValid).toBe(true);

      const invalidBusiness = {
        accountType: 'business'
      };

      const invalidResult = formValidator.validate(invalidBusiness, conditionalRules);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.fields.businessName.errors).toContain('Business name is required');
      expect(invalidResult.fields.taxId.errors).toContain('Tax ID is required');
    });

    test('should support field dependencies', () => {
      const dependencyRules = {
        country: { required: true },
        state: { 
          required: (data) => data.country === 'USA',
          enum: (data) => data.country === 'USA' ? ['CA', 'NY', 'TX'] : null
        },
        province: {
          required: (data) => data.country === 'Canada',
          enum: (data) => data.country === 'Canada' ? ['ON', 'QC', 'BC'] : null
        }
      };

      const usAddress = {
        country: 'USA',
        state: 'CA'
      };

      const canadianAddress = {
        country: 'Canada',
        province: 'ON'
      };

      const usResult = formValidator.validate(usAddress, dependencyRules);
      const canadaResult = formValidator.validate(canadianAddress, dependencyRules);

      expect(usResult.isValid).toBe(true);
      expect(canadaResult.isValid).toBe(true);
    });
  });

  describe('Real-time Validation', () => {
    test('should support field-level validation', () => {
      const rules = {
        email: { required: true, type: 'email' }
      };

      const result1 = formValidator.validateField('email', '', rules.email);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Email is required');

      const result2 = formValidator.validateField('email', 'invalid', rules.email);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Invalid email format');

      const result3 = formValidator.validateField('email', 'user@example.com', rules.email);
      expect(result3.isValid).toBe(true);
    });

    test('should debounce validation for performance', (done) => {
      const originalValidate = formValidator.validateField.bind(formValidator);
      let callCount = 0;
      
      formValidator._validateFieldSpy = jest.fn(() => {
        callCount++;
      });
      
      formValidator.enableDebounce(100);
      
      formValidator.validateField('username', 'a', {});
      formValidator.validateField('username', 'ab', {});
      formValidator.validateField('username', 'abc', {});
      
      setTimeout(() => {
        expect(callCount).toBe(1);
        expect(formValidator._validateFieldSpy).toHaveBeenCalledWith('username', 'abc', {});
        done();
      }, 150);
    });
  });
});