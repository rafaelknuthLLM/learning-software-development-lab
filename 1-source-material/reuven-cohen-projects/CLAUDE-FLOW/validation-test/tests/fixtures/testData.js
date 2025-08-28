// Test fixtures - no hardcoded values in tests
module.exports = {
  validEmails: [
    'user@example.com',
    'test.user@domain.co.uk',
    'user+tag@example.org',
    'user_123@test-domain.com'
  ],
  invalidEmails: [
    'notanemail',
    '@example.com',
    'user@',
    'user@.com',
    'user@domain',
    'user space@example.com',
    'user@domain..com'
  ],
  validPhones: [
    '+1234567890',
    '+44 20 7123 1234',
    '(555) 123-4567',
    '555-123-4567',
    '5551234567'
  ],
  invalidPhones: [
    '123',
    'phone',
    '123-456',
    '+1 234 567 890 123 456'
  ],
  validUrls: [
    'https://example.com',
    'http://subdomain.example.org',
    'https://example.com/path/to/page',
    'https://example.com:8080',
    'ftp://files.example.com'
  ],
  invalidUrls: [
    'not a url',
    'htp://example.com',
    '//example.com',
    'example.com',
    'https://'
  ],
  validPasswords: {
    strong: 'MyP@ssw0rd123!',
    medium: 'Password123',
    withSpecialChars: 'Test@2024#Secure'
  },
  invalidPasswords: {
    tooShort: '123',
    noUppercase: 'password123',
    noNumbers: 'Password',
    noSpecialChars: 'Password123'
  },
  creditCards: {
    valid: {
      visa: '4111111111111111',
      mastercard: '5500000000000004',
      amex: '340000000000009'
    },
    invalid: {
      short: '411111111111',
      letters: '4111abcd11111111',
      wrongChecksum: '4111111111111112'
    }
  }
};