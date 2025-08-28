# Test Scenarios Documentation

## Email Validation

### Valid Cases
- Standard email: `user@example.com`
- With subdomain: `test.user@domain.co.uk`
- With plus sign: `user+tag@example.org`
- With underscore: `user_123@test-domain.com`

### Invalid Cases
- Missing @ symbol: `notanemail`
- Missing local part: `@example.com`
- Missing domain: `user@`
- Invalid domain: `user@.com`
- Contains spaces: `user space@example.com`
- Double dots: `user@domain..com`

## Phone Number Validation

### Valid Cases
- International format: `+1234567890`
- With spaces: `+44 20 7123 1234`
- US format with parentheses: `(555) 123-4567`
- With dashes: `555-123-4567`
- Plain numbers: `5551234567`

### Invalid Cases
- Too short: `123`
- Contains letters: `phone`
- Incomplete: `123-456`
- Too long: `+1 234 567 890 123 456`

## URL Validation

### Valid Cases
- HTTPS: `https://example.com`
- HTTP: `http://subdomain.example.org`
- With path: `https://example.com/path/to/page`
- With port: `https://example.com:8080`
- FTP: `ftp://files.example.com`

### Invalid Cases
- Plain text: `not a url`
- Typo in protocol: `htp://example.com`
- Missing protocol: `//example.com`
- No protocol: `example.com`
- Incomplete: `https://`

## Password Validation

### Strength Levels
- **Weak**: Less than 8 characters, missing uppercase/numbers
- **Medium**: 8+ characters with mixed case and numbers
- **Strong**: 8+ characters with mixed case, numbers, and special characters

### Validation Rules
- Minimum length: 8 characters (configurable)
- Must contain uppercase letters
- Must contain numbers
- Optional: special characters
- Custom rules supported

## Credit Card Validation

### Supported Card Types
- **Visa**: Starts with 4, 16 digits
- **MasterCard**: Starts with 51-55, 16 digits
- **American Express**: Starts with 34 or 37, 15 digits

### Validation Method
- Luhn algorithm for checksum validation
- Card type detection based on prefix
- Length validation

## Form Validation Scenarios

### User Registration
- Username: 3-20 characters
- Email: Valid format required
- Password: Medium strength minimum
- Confirm Password: Must match
- Age: Must be 18+
- Terms: Must accept

### Payment Form
- Card number validation
- Expiry date checking
- CVV format validation
- Billing address validation
- Fraud detection simulation

### Dynamic Forms
- Conditional field requirements
- Field dependencies (country → state/province)
- Real-time validation with debouncing
- Progressive disclosure

## Bulk Data Validation

### CSV Import
- Email format validation
- Phone number validation
- Required field checking
- Error reporting by row
- Batch processing support

### Performance
- Handle 1000+ records efficiently
- Parallel processing option
- Configurable batch sizes
- Sub-5 second processing for large datasets

## API Validation

### Request Validation
- Method validation
- Header checking
- Body schema validation
- Authentication token presence

### Response Validation
- Status code checking
- Schema conformance
- Data type validation
- Required field presence

## Edge Cases Covered

1. **Null/Undefined Handling**: All validators handle null/undefined gracefully
2. **Whitespace Trimming**: Automatic trimming of input values
3. **Type Coercion**: Safe type checking without coercion issues
4. **Async Timeouts**: Configurable timeouts for async validations
5. **Memory Efficiency**: Debouncing for real-time validation
6. **Error Accumulation**: Collecting all errors, not stopping at first
7. **Internationalization**: Support for multiple locales
8. **Custom Rules**: Extensible validation system