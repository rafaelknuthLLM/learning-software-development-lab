// End-to-end tests for complete validation workflows
const ValidationService = require('../../src/validationService');
const testData = require('../fixtures/testData');

describe('E2E Validation Workflows', () => {
  let validationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('Complete User Registration Flow', () => {
    test('should handle full registration workflow', async () => {
      const userData = {
        username: 'newuser2024',
        email: 'newuser@example.com',
        password: 'SecureP@ss2024!',
        confirmPassword: 'SecureP@ss2024!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        phone: '+1 555-123-4567',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        preferences: {
          newsletter: true,
          notifications: 'email',
          language: 'en'
        },
        termsAccepted: true,
        privacyAccepted: true
      };

      // Step 1: Validate basic info
      const basicValidation = await validationService.validateBasicInfo({
        username: userData.username,
        email: userData.email
      });
      expect(basicValidation.isValid).toBe(true);

      // Step 2: Check username availability (async)
      const usernameAvailable = await validationService.checkUsernameAvailability(userData.username);
      expect(usernameAvailable).toBe(true);

      // Step 3: Validate password strength
      const passwordValidation = validationService.validatePassword(userData.password);
      expect(passwordValidation.strength).toBe('strong');

      // Step 4: Validate personal information
      const personalValidation = validationService.validatePersonalInfo({
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: userData.dateOfBirth
      });
      expect(personalValidation.isValid).toBe(true);
      expect(personalValidation.age).toBeGreaterThanOrEqual(18);

      // Step 5: Validate contact information
      const contactValidation = validationService.validateContactInfo({
        phone: userData.phone,
        address: userData.address
      });
      expect(contactValidation.isValid).toBe(true);

      // Step 6: Complete registration
      const registrationResult = await validationService.completeRegistration(userData);
      expect(registrationResult.success).toBe(true);
      expect(registrationResult.userId).toBeDefined();
      expect(registrationResult.validationReport).toBeDefined();
    });

    test('should handle validation failures gracefully', async () => {
      const invalidUserData = {
        username: 'ab',  // Too short
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
        firstName: '',
        lastName: '',
        dateOfBirth: '2010-01-01',  // Too young
        phone: '123',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: 'invalid',
          country: ''
        },
        termsAccepted: false
      };

      const registrationResult = await validationService.completeRegistration(invalidUserData);
      
      expect(registrationResult.success).toBe(false);
      expect(registrationResult.errors).toBeDefined();
      expect(registrationResult.errors.username).toContain('Username must be at least 3 characters');
      expect(registrationResult.errors.email).toContain('Invalid email format');
      expect(registrationResult.errors.password).toContain('Password is too weak');
      expect(registrationResult.errors.confirmPassword).toContain('Passwords do not match');
      expect(registrationResult.errors.age).toContain('Must be at least 18 years old');
      expect(registrationResult.errors.terms).toContain('You must accept the terms');
    });
  });

  describe('Complete Payment Processing Flow', () => {
    test('should validate and process payment', async () => {
      const paymentData = {
        amount: 99.99,
        currency: 'USD',
        card: {
          number: '4111111111111111',
          holder: 'John Doe',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        },
        billing: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        email: 'customer@example.com',
        phone: '+1 555-123-4567'
      };

      // Step 1: Validate card details
      const cardValidation = validationService.validateCreditCard(paymentData.card);
      expect(cardValidation.isValid).toBe(true);
      expect(cardValidation.cardType).toBe('visa');

      // Step 2: Validate billing address
      const billingValidation = validationService.validateAddress(paymentData.billing);
      expect(billingValidation.isValid).toBe(true);

      // Step 3: Fraud check (async)
      const fraudCheck = await validationService.performFraudCheck(paymentData);
      expect(fraudCheck.riskLevel).toBe('low');
      expect(fraudCheck.approved).toBe(true);

      // Step 4: Process payment
      const paymentResult = await validationService.processPayment(paymentData);
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.transactionId).toBeDefined();
      expect(paymentResult.status).toBe('completed');
    });

    test('should handle declined payments', async () => {
      const declinedPayment = {
        amount: 10000,  // High amount triggers decline
        card: {
          number: '4000000000000002',  // Test card that declines
          holder: 'John Doe',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        }
      };

      const paymentResult = await validationService.processPayment(declinedPayment);
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.status).toBe('declined');
      expect(paymentResult.reason).toBeDefined();
    });
  });

  describe('Multi-step Form Validation', () => {
    test('should validate multi-step application form', async () => {
      const applicationSteps = {
        step1: {
          applicationType: 'individual',
          purpose: 'personal'
        },
        step2: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1 555-987-6543'
        },
        step3: {
          employment: 'employed',
          employer: 'Tech Corp',
          income: 75000,
          yearsEmployed: 3
        },
        step4: {
          references: [
            { name: 'John Ref', phone: '555-111-2222', relationship: 'colleague' },
            { name: 'Mary Ref', phone: '555-333-4444', relationship: 'manager' }
          ]
        },
        step5: {
          documents: {
            id: 'uploaded',
            proof_of_income: 'uploaded',
            references: 'uploaded'
          },
          consent: true,
          signature: 'Jane Smith'
        }
      };

      // Validate each step
      const step1Result = validationService.validateApplicationStep(1, applicationSteps.step1);
      expect(step1Result.isValid).toBe(true);

      const step2Result = validationService.validateApplicationStep(2, applicationSteps.step2);
      expect(step2Result.isValid).toBe(true);

      const step3Result = validationService.validateApplicationStep(3, applicationSteps.step3);
      expect(step3Result.isValid).toBe(true);

      const step4Result = validationService.validateApplicationStep(4, applicationSteps.step4);
      expect(step4Result.isValid).toBe(true);

      const step5Result = validationService.validateApplicationStep(5, applicationSteps.step5);
      expect(step5Result.isValid).toBe(true);

      // Submit complete application
      const submissionResult = await validationService.submitApplication(applicationSteps);
      expect(submissionResult.success).toBe(true);
      expect(submissionResult.applicationId).toBeDefined();
      expect(submissionResult.status).toBe('pending_review');
    });

    test('should prevent progression with invalid steps', () => {
      const invalidStep2 = {
        firstName: '',  // Required field missing
        lastName: 'Smith',
        email: 'invalid-email',
        phone: '123'
      };

      const result = validationService.validateApplicationStep(2, invalidStep2);
      expect(result.isValid).toBe(false);
      expect(result.canProceed).toBe(false);
      expect(result.errors).toHaveProperty('firstName');
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('phone');
    });
  });

  describe('Bulk Data Validation', () => {
    test('should validate CSV import data', async () => {
      const csvData = [
        { email: 'user1@example.com', phone: '555-111-1111', name: 'User One' },
        { email: 'user2@example.com', phone: '555-222-2222', name: 'User Two' },
        { email: 'invalid-email', phone: '123', name: '' },  // Invalid row
        { email: 'user4@example.com', phone: '555-444-4444', name: 'User Four' },
        { email: '', phone: '555-555-5555', name: 'User Five' }  // Missing email
      ];

      const validationResult = await validationService.validateBulkImport(csvData);

      expect(validationResult.totalRows).toBe(5);
      expect(validationResult.validRows).toBe(3);
      expect(validationResult.invalidRows).toBe(2);
      expect(validationResult.errors).toHaveLength(2);
      expect(validationResult.errors[0].row).toBe(3);
      expect(validationResult.errors[1].row).toBe(5);
      expect(validationResult.validData).toHaveLength(3);
    });

    test('should handle large dataset validation efficiently', async () => {
      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        email: `user${i}@example.com`,
        phone: `555-${String(i).padStart(3, '0')}-${String(i % 10000).padStart(4, '0')}`,
        name: `User ${i}`
      }));

      const startTime = Date.now();
      const result = await validationService.validateBulkImport(largeDataset, {
        batchSize: 100,
        parallel: true
      });
      const endTime = Date.now();

      expect(result.validRows).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000);  // Should complete within 5 seconds
    });
  });

  describe('API Integration Validation', () => {
    test('should validate API request payload', () => {
      const apiRequest = {
        method: 'POST',
        endpoint: '/api/users',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        },
        body: {
          username: 'apiuser',
          email: 'api@example.com',
          role: 'user',
          permissions: ['read', 'write']
        }
      };

      const validation = validationService.validateApiRequest(apiRequest);
      expect(validation.isValid).toBe(true);
      expect(validation.sanitized).toBeDefined();
      expect(validation.sanitized.body.email).toBe('api@example.com');
    });

    test('should validate API response format', () => {
      const apiResponse = {
        status: 200,
        data: {
          id: 123,
          username: 'apiuser',
          email: 'api@example.com',
          createdAt: '2024-01-01T00:00:00Z'
        },
        meta: {
          version: '1.0',
          timestamp: Date.now()
        }
      };

      const validation = validationService.validateApiResponse(apiResponse);
      expect(validation.isValid).toBe(true);
      expect(validation.conformsToSchema).toBe(true);
    });
  });
});