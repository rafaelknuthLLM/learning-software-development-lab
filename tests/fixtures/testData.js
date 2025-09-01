const { faker } = require('@faker-js/faker');

/**
 * Test Data Fixtures and Factories
 * 
 * This module provides reusable test data fixtures and factory functions
 * for creating consistent test data across different test suites.
 */

/**
 * User Data Fixtures
 */
const userFixtures = {
  validUser: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    phone: '+1-555-0123',
    address: {
      street: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    role: 'user',
    isActive: true,
    isEmailVerified: true
  },

  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPass123!',
    phone: '+1-555-0001',
    address: {
      street: '456 Admin Ave',
      city: 'Admin City',
      state: 'CA',
      zipCode: '54321',
      country: 'USA'
    },
    role: 'admin',
    isActive: true,
    isEmailVerified: true
  },

  inactiveUser: {
    name: 'Inactive User',
    email: 'inactive@example.com',
    password: 'InactivePass123!',
    role: 'user',
    isActive: false,
    isEmailVerified: true
  },

  unverifiedUser: {
    name: 'Unverified User',
    email: 'unverified@example.com',
    password: 'UnverifiedPass123!',
    role: 'user',
    isActive: true,
    isEmailVerified: false
  }
};

/**
 * Product Data Fixtures
 */
const productFixtures = {
  electronics: {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 149.99,
    category: 'Electronics',
    brand: 'TechBrand',
    sku: 'WBH-001',
    stock: 50,
    images: ['https://example.com/headphones.jpg'],
    specifications: {
      weight: '250g',
      dimensions: '20x18x8cm',
      color: 'Black',
      batteryLife: '30 hours',
      wireless: true
    },
    tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
    isActive: true,
    rating: 4.5,
    reviewCount: 128
  },

  clothing: {
    name: 'Premium Cotton T-Shirt',
    description: 'Comfortable 100% organic cotton t-shirt',
    price: 29.99,
    category: 'Clothing',
    brand: 'EcoWear',
    sku: 'TS-001',
    stock: 100,
    images: ['https://example.com/tshirt.jpg'],
    specifications: {
      material: '100% Organic Cotton',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Black', 'Navy'],
      care: 'Machine wash cold'
    },
    tags: ['cotton', 'organic', 'casual', 'comfortable'],
    isActive: true,
    rating: 4.2,
    reviewCount: 64
  },

  book: {
    name: 'JavaScript: The Definitive Guide',
    description: 'Comprehensive guide to JavaScript programming',
    price: 59.99,
    category: 'Books',
    brand: 'Tech Publisher',
    sku: 'BOOK-JS-001',
    stock: 25,
    images: ['https://example.com/js-book.jpg'],
    specifications: {
      pages: 1096,
      isbn: '978-1491952023',
      format: 'Paperback',
      language: 'English',
      edition: '7th'
    },
    tags: ['javascript', 'programming', 'web development'],
    isActive: true,
    rating: 4.7,
    reviewCount: 245
  },

  outOfStock: {
    name: 'Limited Edition Smartwatch',
    description: 'Special edition smartwatch with premium features',
    price: 399.99,
    category: 'Electronics',
    brand: 'WatchTech',
    sku: 'SW-LE-001',
    stock: 0,
    images: ['https://example.com/smartwatch.jpg'],
    isActive: true,
    tags: ['smartwatch', 'limited edition', 'wearable'],
    rating: 4.8,
    reviewCount: 89
  }
};

/**
 * Order Data Fixtures
 */
const orderFixtures = {
  pendingOrder: {
    items: [
      {
        name: 'Wireless Bluetooth Headphones',
        price: 149.99,
        quantity: 1
      }
    ],
    shippingAddress: {
      street: '123 Customer Street',
      city: 'Customer City',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    paymentMethod: {
      type: 'credit_card',
      last4: '1234'
    },
    pricing: {
      subtotal: 149.99,
      tax: 12.00,
      shipping: 9.99,
      total: 171.98
    },
    status: 'pending'
  },

  completedOrder: {
    items: [
      {
        name: 'Premium Cotton T-Shirt',
        price: 29.99,
        quantity: 2
      },
      {
        name: 'JavaScript Book',
        price: 59.99,
        quantity: 1
      }
    ],
    shippingAddress: {
      street: '456 Buyer Avenue',
      city: 'Purchase City',
      state: 'NY',
      zipCode: '54321',
      country: 'USA'
    },
    paymentMethod: {
      type: 'paypal',
      email: 'buyer@example.com'
    },
    pricing: {
      subtotal: 119.97,
      tax: 9.60,
      shipping: 0, // Free shipping over $100
      total: 129.57
    },
    status: 'completed',
    tracking: 'TRK123456789'
  },

  cancelledOrder: {
    items: [
      {
        name: 'Limited Edition Smartwatch',
        price: 399.99,
        quantity: 1
      }
    ],
    status: 'cancelled',
    cancelReason: 'Customer request'
  }
};

/**
 * API Response Fixtures
 */
const apiResponseFixtures = {
  success: {
    success: true,
    message: 'Operation completed successfully'
  },

  error: {
    success: false,
    message: 'An error occurred',
    errors: []
  },

  validationError: {
    success: false,
    message: 'Validation failed',
    errors: [
      {
        field: 'email',
        message: 'Valid email is required'
      },
      {
        field: 'password',
        message: 'Password must be at least 8 characters'
      }
    ]
  },

  unauthorized: {
    success: false,
    message: 'Unauthorized access'
  },

  notFound: {
    success: false,
    message: 'Resource not found'
  },

  rateLimit: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
};

/**
 * Authentication Test Data
 */
const authFixtures = {
  validCredentials: {
    email: 'test@example.com',
    password: 'TestPass123!'
  },

  invalidCredentials: {
    email: 'test@example.com',
    password: 'wrongpassword'
  },

  registrationData: {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'NewUserPass123!',
    confirmPassword: 'NewUserPass123!'
  },

  passwordReset: {
    email: 'user@example.com',
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!'
  },

  invalidEmails: [
    'invalid-email',
    '@invalid.com',
    'invalid@',
    'invalid..email@example.com',
    'invalid@.com',
    'invalid@com',
    'invalid email@example.com'
  ],

  weakPasswords: [
    '123',
    'password',
    'PASSWORD',
    '12345678',
    'abcdefgh',
    'Password',
    '123456789'
  ],

  strongPasswords: [
    'StrongPass123!',
    'My$ecureP@ssw0rd',
    'C0mpl3x!P@ssw0rd',
    'Secure123#Password'
  ]
};

/**
 * Performance Test Data
 */
const performanceFixtures = {
  bulkUsers: (count = 100) => Array.from({ length: count }, (_, i) => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'TestPass123!',
    role: i % 10 === 0 ? 'admin' : 'user',
    isActive: i % 20 !== 0, // 95% active
    createdAt: faker.date.past()
  })),

  bulkProducts: (count = 50) => Array.from({ length: count }, (_, i) => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    category: faker.commerce.department(),
    brand: faker.company.name(),
    sku: `SKU-${i.toString().padStart(6, '0')}`,
    stock: faker.number.int({ min: 0, max: 100 }),
    isActive: i % 10 !== 0 // 90% active
  })),

  bulkOrders: (userIds, productIds, count = 30) => 
    Array.from({ length: count }, () => ({
      user: faker.helpers.arrayElement(userIds),
      items: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
        product: faker.helpers.arrayElement(productIds),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: parseFloat(faker.commerce.price())
      })),
      status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'completed']),
      createdAt: faker.date.past()
    }))
};

/**
 * Security Test Data
 */
const securityFixtures = {
  sqlInjection: [
    "'; DROP TABLE users; --",
    "admin'; --",
    "1' OR '1'='1",
    "1' UNION SELECT * FROM users --",
    "'; UPDATE users SET role='admin' WHERE email='test@example.com'; --"
  ],

  xssPayloads: [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(1)">',
    'javascript:alert("XSS")',
    '<svg onload="alert(1)">',
    '"><script>alert("XSS")</script>',
    "';alert(String.fromCharCode(88,83,83))//';alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>\">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>"
  ],

  noSqlInjection: [
    { $ne: null },
    { $gt: '' },
    { $where: 'function() { return true; }' },
    { $regex: '.*' },
    { $exists: true }
  ],

  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '....//....//....//etc/passwd',
    '..%2F..%2F..%2Fetc%2Fpasswd'
  ],

  oversizedPayloads: {
    largeString: 'A'.repeat(10 * 1024 * 1024), // 10MB string
    largeObject: {
      data: 'x'.repeat(5 * 1024 * 1024) // 5MB object
    }
  }
};

/**
 * Edge Case Test Data
 */
const edgeCaseFixtures = {
  emptyStrings: ['', '   ', '\n', '\t'],
  nullValues: [null, undefined],
  extremeNumbers: [
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    NaN
  ],
  unicodeStrings: [
    'Hello 世界',
    'émojis 🚀🎉🔥',
    'Ñoño café',
    'Здравствуй мир',
    '🏳️‍🌈🏳️‍⚧️'
  ],
  specialCharacters: [
    '!@#$%^&*()_+-=[]{}|;:,.<>?',
    'quotes "single" \'double\'',
    'backslashes \\ and slashes /',
    'newlines\nand\ttabs'
  ]
};

module.exports = {
  userFixtures,
  productFixtures,
  orderFixtures,
  apiResponseFixtures,
  authFixtures,
  performanceFixtures,
  securityFixtures,
  edgeCaseFixtures
};