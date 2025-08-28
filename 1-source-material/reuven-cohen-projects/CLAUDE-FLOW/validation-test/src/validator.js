// Main Validator class
class Validator {
  constructor() {
    this.customRules = {};
    this.asyncRules = {};
    this.errorMessages = {
      email: 'Invalid email format',
      required: 'This field is required',
      phone: 'Invalid phone number',
      url: 'Invalid URL format',
      password: {
        minLength: 'Password must be at least 8 characters',
        uppercase: 'Password must contain uppercase letters',
        numbers: 'Password must contain numbers',
        special: 'Password must contain special characters'
      }
    };
    this.locale = 'en';
    this.chainedValidations = [];
  }

  validateEmail(email) {
    if (email === null || email === undefined) {
      return {
        isValid: false,
        errors: ['Email is required']
      };
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(trimmedEmail);

    return {
      isValid,
      errors: isValid ? [] : [this.errorMessages.email]
    };
  }

  validatePhone(phone) {
    if (!phone) {
      return {
        isValid: false,
        errors: ['Phone number is required']
      };
    }

    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    const isValid = phoneRegex.test(phone);
    const normalized = phone.replace(/\D/g, '');

    return {
      isValid,
      errors: isValid ? [] : ['Invalid phone number'],
      normalized
    };
  }

  validateUrl(url, options = {}) {
    if (!url) {
      return {
        isValid: false,
        errors: ['URL is required']
      };
    }

    try {
      const urlObj = new URL(url);
      
      if (options.protocols) {
        const isValidProtocol = options.protocols.includes(urlObj.protocol.replace(':', ''));
        return {
          isValid: isValidProtocol,
          errors: isValidProtocol ? [] : ['Invalid protocol']
        };
      }

      return {
        isValid: true,
        errors: []
      };
    } catch {
      return {
        isValid: false,
        errors: [this.errorMessages.url]
      };
    }
  }

  validatePassword(password, rules = {}) {
    const defaultRules = {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    };

    const mergedRules = { ...defaultRules, ...rules };
    const errors = [];
    let strength = 'weak';

    if (!password) {
      return {
        isValid: false,
        errors: ['Password is required'],
        strength
      };
    }

    if (password.length < mergedRules.minLength) {
      errors.push(`Password must be at least ${mergedRules.minLength} characters`);
    }

    if (mergedRules.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }

    if (mergedRules.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain numbers');
    }

    if (mergedRules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain special characters');
    }

    // Calculate strength
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) strength = 'weak';
    else if (score <= 4) strength = 'medium';
    else strength = 'strong';

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }

  validateCreditCard(number) {
    if (!number) {
      return {
        isValid: false,
        errors: ['Credit card number is required']
      };
    }

    const cleanNumber = number.replace(/\D/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return {
        isValid: false,
        errors: ['Invalid credit card number length']
      };
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const checksumValid = sum % 10 === 0;
    
    // Detect card type
    let cardType = 'unknown';
    if (/^4/.test(cleanNumber)) cardType = 'visa';
    else if (/^5[1-5]/.test(cleanNumber)) cardType = 'mastercard';
    else if (/^3[47]/.test(cleanNumber)) cardType = 'amex';

    return {
      isValid: checksumValid,
      errors: checksumValid ? [] : ['Invalid credit card number'],
      cardType,
      checksumValid
    };
  }

  addCustomRule(field, validator) {
    this.customRules[field] = validator;
  }

  addAsyncRule(field, validator) {
    this.asyncRules[field] = validator;
  }

  validate(data, rules) {
    const result = {
      isValid: true,
      errors: []
    };

    for (const field in rules) {
      if (this.customRules[field]) {
        const isValid = this.customRules[field](data[field], data);
        if (!isValid) {
          result.isValid = false;
          result.errors.push(`${field} validation failed`);
        }
      }
    }

    return result;
  }

  async validateAsync(data, options = {}) {
    const timeout = options.timeout || 30000;
    const promises = [];

    for (const field in this.asyncRules) {
      if (data[field] !== undefined) {
        const promise = Promise.race([
          this.asyncRules[field](data[field], data),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Validation timeout')), timeout)
          )
        ]);
        promises.push(promise);
      }
    }

    try {
      const results = await Promise.all(promises);
      return {
        isValid: results.every(r => r === true),
        errors: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }

  validateBatch(data, rules) {
    const result = {
      isValid: true,
      fields: {},
      errors: []
    };

    for (const field in rules) {
      let fieldResult;
      
      switch (rules[field]) {
        case 'email':
          fieldResult = this.validateEmail(data[field]);
          break;
        case 'phone':
          fieldResult = this.validatePhone(data[field]);
          break;
        case 'url':
          fieldResult = this.validateUrl(data[field]);
          break;
        case 'password':
          fieldResult = this.validatePassword(data[field]);
          break;
        default:
          fieldResult = { isValid: true, errors: [] };
      }

      result.fields[field] = fieldResult;
      
      if (!fieldResult.isValid) {
        result.isValid = false;
        result.errors.push(...fieldResult.errors);
      }
    }

    return result;
  }

  chain() {
    this.chainedValidations = [];
    const chainableValidator = {
      validateEmail: (email) => {
        this.chainedValidations.push(this.validateEmail(email));
        return chainableValidator;
      },
      validatePhone: (phone) => {
        this.chainedValidations.push(this.validatePhone(phone));
        return chainableValidator;
      },
      validateUrl: (url) => {
        this.chainedValidations.push(this.validateUrl(url));
        return chainableValidator;
      },
      execute: () => {
        const isValid = this.chainedValidations.every(v => v.isValid);
        return {
          isValid,
          validations: this.chainedValidations
        };
      }
    };
    return chainableValidator;
  }

  setErrorMessages(messages) {
    this.errorMessages = { ...this.errorMessages, ...messages };
  }

  setLocale(locale) {
    this.locale = locale;
    if (locale === 'es') {
      this.errorMessages.email = 'Formato de correo electrónico inválido';
    }
  }
}

module.exports = Validator;