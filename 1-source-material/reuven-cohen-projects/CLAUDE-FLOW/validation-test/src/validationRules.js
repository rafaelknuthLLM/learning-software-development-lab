// Validation Rules class
class ValidationRules {
  constructor() {
    this.rules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
      url: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      numeric: /^[0-9]+$/,
      alpha: /^[a-zA-Z]+$/
    };
  }

  getRules() {
    return this.rules;
  }

  addRule(name, pattern) {
    this.rules[name] = pattern;
  }

  removeRule(name) {
    delete this.rules[name];
  }

  validate(value, ruleName) {
    if (!this.rules[ruleName]) {
      throw new Error(`Rule ${ruleName} not found`);
    }
    return this.rules[ruleName].test(value);
  }
}

module.exports = ValidationRules;