const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const User = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');

/**
 * Test Helpers - Utility functions for testing
 */
class TestHelpers {
  /**
   * Generate test user data
   */
  static generateUserData(overrides = {}) {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'TestPass123!',
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      ...overrides
    };
  }

  /**
   * Generate test product data
   */
  static generateProductData(overrides = {}) {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      brand: faker.company.name(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      stock: faker.number.int({ min: 0, max: 100 }),
      images: [faker.image.url()],
      specifications: {
        weight: `${faker.number.int({ min: 100, max: 5000 })}g`,
        dimensions: `${faker.number.int({ min: 10, max: 50 })}x${faker.number.int({ min: 10, max: 50 })}cm`,
        color: faker.color.human()
      },
      tags: faker.helpers.arrayElements(
        ['electronics', 'clothing', 'home', 'sports', 'books'],
        { min: 1, max: 3 }
      ),
      isActive: true,
      ...overrides
    };
  }

  /**
   * Generate test order data
   */
  static generateOrderData(userId, overrides = {}) {
    const items = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      product: new mongoose.Types.ObjectId(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      quantity: faker.number.int({ min: 1, max: 5 })
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    return {
      user: userId,
      items,
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      paymentMethod: {
        type: 'credit_card',
        last4: faker.finance.creditCardNumber().slice(-4)
      },
      pricing: {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: shipping,
        total: Math.round(total * 100) / 100
      },
      status: 'pending',
      ...overrides
    };
  }

  /**
   * Create test user in database
   */
  static async createTestUser(userData = {}) {
    const defaultData = this.generateUserData(userData);
    
    // Hash password if provided
    if (defaultData.password) {
      defaultData.password = await bcrypt.hash(defaultData.password, 10);
    }
    
    const user = new User(defaultData);
    await user.save();
    
    // Return user with plain password for testing
    const userObject = user.toObject();
    userObject.password = userData.password || 'TestPass123!';
    
    return userObject;
  }

  /**
   * Generate JWT token for testing
   */
  static generateTestToken(userId, role = 'user') {
    return jwt.sign(
      { 
        userId, 
        role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  /**
   * Generate expired JWT token for testing
   */
  static generateExpiredToken(userId, role = 'user') {
    return jwt.sign(
      { 
        userId, 
        role,
        iat: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      },
      process.env.JWT_SECRET,
      { expiresIn: '1s' } // Already expired
    );
  }

  /**
   * Generate invalid JWT token for testing
   */
  static generateInvalidToken() {
    return 'invalid.jwt.token';
  }

  /**
   * Create authentication headers
   */
  static createAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Assert API response structure
   */
  static assertApiResponse(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    
    if (expectedStatus >= 200 && expectedStatus < 300) {
      expect(response.body.success).toBe(true);
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    }
  }

  /**
   * Assert pagination structure
   */
  static assertPaginationResponse(response) {
    this.assertApiResponse(response);
    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('current');
    expect(response.body.pagination).toHaveProperty('pageSize');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('pages');
  }

  /**
   * Wait for async operations
   */
  static async wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate test email data
   */
  static generateTestEmail() {
    return {
      to: faker.internet.email(),
      subject: faker.lorem.sentence(),
      html: faker.lorem.paragraphs(2, '<br>')
    };
  }

  /**
   * Mock external API responses
   */
  static mockExternalApi(url, response) {
    const nock = require('nock');
    return nock(url).persist().get(/.*/).reply(200, response);
  }

  /**
   * Generate stress test data
   */
  static generateBulkTestData(count, generator, ...args) {
    return Array.from({ length: count }, () => generator(...args));
  }

  /**
   * Create test database indexes
   */
  static async createTestIndexes() {
    // This would create indexes for better test performance
    // Implementation depends on your models
  }

  /**
   * Clean up test artifacts
   */
  static async cleanupTestData() {
    // Remove test files, clear caches, etc.
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const testUploads = path.join(__dirname, '../../uploads/test');
      await fs.rmdir(testUploads, { recursive: true });
    } catch (error) {
      // Directory doesn't exist, ignore
    }
  }
}

module.exports = TestHelpers;