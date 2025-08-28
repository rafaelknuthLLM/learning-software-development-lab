// Test helper utilities
class TestHelpers {
  static createMockValidator(options = {}) {
    return {
      validate: jest.fn().mockReturnValue(options.isValid || false),
      errors: options.errors || [],
      rules: options.rules || {}
    };
  }

  static createValidationContext(data, rules) {
    return {
      data,
      rules,
      errors: [],
      warnings: []
    };
  }

  static generateTestCases(validData, invalidData, testName) {
    const cases = [];
    
    validData.forEach((data, index) => {
      cases.push({
        name: `${testName} - valid case ${index + 1}`,
        input: data,
        expected: true
      });
    });
    
    invalidData.forEach((data, index) => {
      cases.push({
        name: `${testName} - invalid case ${index + 1}`,
        input: data,
        expected: false
      });
    });
    
    return cases;
  }

  static mockAsyncValidator(delay = 100, result = true) {
    return jest.fn().mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(result), delay)
      )
    );
  }
}

module.exports = TestHelpers;