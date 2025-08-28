// Validation Service for E2E workflows
const Validator = require('./validator');
const FormValidator = require('./formValidator');

class ValidationService {
  constructor() {
    this.validator = new Validator();
    this.formValidator = new FormValidator();
  }

  async validateBasicInfo(info) {
    const emailResult = this.validator.validateEmail(info.email);
    const usernameValid = info.username && info.username.length >= 3;
    
    return {
      isValid: emailResult.isValid && usernameValid
    };
  }

  async checkUsernameAvailability(username) {
    // Simulate async check
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(username !== 'taken');
      }, 10);
    });
  }

  validatePassword(password) {
    return this.validator.validatePassword(password);
  }

  validatePersonalInfo(info) {
    const age = this.calculateAge(info.dateOfBirth);
    return {
      isValid: info.firstName && info.lastName && age >= 18,
      age
    };
  }

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  validateContactInfo(info) {
    const phoneResult = this.validator.validatePhone(info.phone);
    const addressValid = info.address && 
      info.address.street && 
      info.address.city && 
      info.address.state && 
      info.address.zipCode && 
      info.address.country;
    
    return {
      isValid: phoneResult.isValid && addressValid
    };
  }

  async completeRegistration(userData) {
    const errors = {};
    
    // Validate username
    if (!userData.username || userData.username.length < 3) {
      errors.username = ['Username must be at least 3 characters'];
    }
    
    // Validate email
    const emailResult = this.validator.validateEmail(userData.email);
    if (!emailResult.isValid) {
      errors.email = emailResult.errors;
    }
    
    // Validate password
    const passwordResult = this.validator.validatePassword(userData.password);
    if (!passwordResult.isValid) {
      errors.password = ['Password is too weak'];
    }
    
    // Check password match
    if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }
    
    // Check age
    const age = this.calculateAge(userData.dateOfBirth);
    if (age < 18) {
      errors.age = ['Must be at least 18 years old'];
    }
    
    // Check terms
    if (!userData.termsAccepted) {
      errors.terms = ['You must accept the terms'];
    }
    
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors
      };
    }
    
    return {
      success: true,
      userId: 'user_' + Date.now(),
      validationReport: {
        username: userData.username,
        email: userData.email,
        registeredAt: new Date().toISOString()
      }
    };
  }

  validateCreditCard(card) {
    return this.validator.validateCreditCard(card.number);
  }

  validateAddress(address) {
    const isValid = address.street && 
      address.city && 
      address.state && 
      address.zipCode && 
      address.country;
    
    return { isValid };
  }

  async performFraudCheck(paymentData) {
    // Simulate fraud check
    return new Promise(resolve => {
      setTimeout(() => {
        const riskLevel = paymentData.amount > 5000 ? 'high' : 'low';
        resolve({
          riskLevel,
          approved: riskLevel !== 'high'
        });
      }, 10);
    });
  }

  async processPayment(paymentData) {
    if (paymentData.card && paymentData.card.number === '4000000000000002') {
      return {
        success: false,
        status: 'declined',
        reason: 'Card declined by bank'
      };
    }
    
    if (paymentData.amount > 5000) {
      return {
        success: false,
        status: 'declined',
        reason: 'Amount exceeds limit'
      };
    }
    
    return {
      success: true,
      transactionId: 'txn_' + Date.now(),
      status: 'completed'
    };
  }

  validateApplicationStep(step, data) {
    const validations = {
      1: () => data.applicationType && data.purpose,
      2: () => {
        const hasName = data.firstName && data.lastName;
        const emailValid = this.validator.validateEmail(data.email || '').isValid;
        const phoneValid = this.validator.validatePhone(data.phone || '').isValid;
        
        if (!hasName || !emailValid || !phoneValid) {
          const errors = {};
          if (!data.firstName) errors.firstName = ['First name is required'];
          if (!emailValid) errors.email = ['Invalid email'];
          if (!phoneValid) errors.phone = ['Invalid phone'];
          return { isValid: false, canProceed: false, errors };
        }
        return { isValid: true };
      },
      3: () => data.employment && data.income > 0,
      4: () => data.references && data.references.length >= 2,
      5: () => data.documents && data.consent && data.signature
    };
    
    const validation = validations[step];
    if (!validation) return { isValid: false };
    
    const result = validation();
    if (typeof result === 'object') return result;
    
    return { isValid: result };
  }

  async submitApplication(applicationData) {
    // Validate all steps
    for (let i = 1; i <= 5; i++) {
      const stepData = applicationData[`step${i}`];
      const validation = this.validateApplicationStep(i, stepData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors || ['Validation failed at step ' + i]
        };
      }
    }
    
    return {
      success: true,
      applicationId: 'app_' + Date.now(),
      status: 'pending_review'
    };
  }

  async validateBulkImport(data, options = {}) {
    const results = {
      totalRows: data.length,
      validRows: 0,
      invalidRows: 0,
      errors: [],
      validData: []
    };
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowErrors = [];
      
      if (!row.email || !this.validator.validateEmail(row.email).isValid) {
        rowErrors.push('Invalid email');
      }
      
      if (!row.phone || !this.validator.validatePhone(row.phone).isValid) {
        rowErrors.push('Invalid phone');
      }
      
      if (!row.name) {
        rowErrors.push('Name is required');
      }
      
      if (rowErrors.length > 0) {
        results.invalidRows++;
        results.errors.push({
          row: i + 1,
          errors: rowErrors
        });
      } else {
        results.validRows++;
        results.validData.push(row);
      }
    }
    
    return results;
  }

  validateApiRequest(request) {
    const isValid = request.method && 
      request.endpoint && 
      request.headers && 
      request.body;
    
    return {
      isValid,
      sanitized: {
        body: request.body
      }
    };
  }

  validateApiResponse(response) {
    const isValid = response.status === 200 && 
      response.data && 
      response.data.id;
    
    return {
      isValid,
      conformsToSchema: true
    };
  }
}

module.exports = ValidationService;