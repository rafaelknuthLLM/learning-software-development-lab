# Phase 2: Contact Form Pseudocode Specification

## 🧠 High-Level Algorithm

```pseudocode
MAIN ContactForm Algorithm:
BEGIN
  1. Initialize form structure and elements
  2. Set up validation rules and patterns
  3. Attach event listeners for real-time validation
  4. Configure form submission handler
  5. Initialize accessibility features
  6. Apply responsive design styles
END
```

## 📝 Core Data Structures

### Form Configuration Object
```pseudocode
FormConfig = {
  fields: {
    name: {
      element: HTMLInputElement,
      rules: [required, minLength(2), maxLength(50), namePattern],
      errors: [],
      isValid: boolean
    },
    email: {
      element: HTMLInputElement,
      rules: [required, emailPattern],
      errors: [],
      isValid: boolean
    },
    message: {
      element: HTMLTextAreaElement,
      rules: [required, minLength(10), maxLength(1000)],
      errors: [],
      isValid: boolean
    }
  },
  isSubmitting: boolean,
  isValid: boolean
}
```

### Validation Rules Structure
```pseudocode
ValidationRules = {
  required: (value) -> boolean,
  minLength: (min) -> (value) -> boolean,
  maxLength: (max) -> (value) -> boolean,
  emailPattern: (value) -> boolean,
  namePattern: (value) -> boolean
}
```

## 🏗️ Core Algorithms

### 1. Form Initialization Algorithm
```pseudocode
FUNCTION initializeForm():
BEGIN
  1. SELECT form element from DOM
  2. SELECT all input elements (name, email, message)
  3. CREATE FormConfig object with field references
  4. SET initial field states to empty/invalid
  5. APPLY initial CSS classes for styling
  6. CALL setupEventListeners()
  7. CALL setupAccessibility()
  8. RETURN FormConfig object
END
```

### 2. Real-Time Validation Algorithm
```pseudocode
FUNCTION validateField(fieldName, value):
BEGIN
  1. GET validation rules for fieldName
  2. INITIALIZE errors array as empty
  3. 
  4. FOR each rule in rules:
     a. CALL rule function with value
     b. IF rule fails:
        - ADD error message to errors array
  
  5. UPDATE field.errors with errors array
  6. UPDATE field.isValid = (errors.length === 0)
  7. CALL updateFieldUI(fieldName)
  8. CALL updateFormValidity()
  9. RETURN field.isValid
END
```

### 3. Debounced Input Handler
```pseudocode
FUNCTION createDebouncedValidator(fieldName, delay):
BEGIN
  1. INITIALIZE timer as null
  
  2. RETURN FUNCTION(event):
     BEGIN
       a. CLEAR existing timer if exists
       b. SET timer = setTimeout(() => {
          - GET field value from event.target
          - CALL validateField(fieldName, value)
       }, delay)
     END
END
```

### 4. Form Submission Algorithm
```pseudocode
FUNCTION handleFormSubmission(event):
BEGIN
  1. PREVENT default form submission
  2. SET formConfig.isSubmitting = true
  3. CALL updateSubmitButtonState()
  
  4. CALL validateAllFields()
  5. IF NOT formConfig.isValid:
     a. CALL showValidationErrors()
     b. CALL focusFirstErrorField()
     c. SET formConfig.isSubmitting = false
     d. RETURN early
  
  6. CALL submitFormData()
END
```

### 5. Complete Field Validation
```pseudocode
FUNCTION validateAllFields():
BEGIN
  1. INITIALIZE allValid = true
  
  2. FOR each field in formConfig.fields:
     a. GET field value
     b. CALL validateField(field.name, value)
     c. IF NOT field.isValid:
        - SET allValid = false
  
  3. SET formConfig.isValid = allValid
  4. RETURN allValid
END
```

### 6. Form Submission Handler
```pseudocode
FUNCTION submitFormData():
BEGIN
  1. COLLECT form data into object:
     formData = {
       name: getFieldValue('name'),
       email: getFieldValue('email'),
       message: getFieldValue('message'),
       timestamp: getCurrentTimestamp()
     }
  
  2. TRY:
     a. CALL sendFormData(formData) // Future: API call
     b. CALL showSuccessMessage()
     c. CALL resetForm()
  
  3. CATCH error:
     a. CALL showErrorMessage(error)
  
  4. FINALLY:
     a. SET formConfig.isSubmitting = false
     b. CALL updateSubmitButtonState()
END
```

## 🎨 UI Update Algorithms

### 1. Field UI Update Algorithm
```pseudocode
FUNCTION updateFieldUI(fieldName):
BEGIN
  1. GET field from formConfig.fields[fieldName]
  2. GET field element and error container
  
  3. IF field.isValid:
     a. REMOVE error CSS classes
     b. CLEAR error container
     c. ADD valid CSS classes (if touched)
  
  4. ELSE:
     a. ADD error CSS classes
     b. DISPLAY first error message in container
     c. REMOVE valid CSS classes
  
  5. UPDATE aria-invalid attribute
  6. UPDATE aria-describedby for screen readers
END
```

### 2. Submit Button State Manager
```pseudocode
FUNCTION updateSubmitButtonState():
BEGIN
  1. GET submit button element
  2. 
  3. IF formConfig.isSubmitting:
     a. SET button.disabled = true
     b. ADD loading CSS class
     c. CHANGE button text to "Sending..."
     d. SHOW loading spinner
  
  4. ELSE IF NOT formConfig.isValid:
     a. SET button.disabled = true
     b. REMOVE loading classes
     c. SET button text to "Please fix errors"
  
  5. ELSE:
     a. SET button.disabled = false
     b. REMOVE loading classes
     c. SET button text to "Send Message"
     d. HIDE loading spinner
END
```

## 🔧 Utility Algorithms

### 1. Validation Rule Implementations
```pseudocode
FUNCTION required(value):
  RETURN value.trim().length > 0

FUNCTION minLength(min):
  RETURN FUNCTION(value):
    RETURN value.trim().length >= min

FUNCTION maxLength(max):
  RETURN FUNCTION(value):
    RETURN value.trim().length <= max

FUNCTION emailPattern(value):
  pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  RETURN pattern.test(value.trim())

FUNCTION namePattern(value):
  pattern = /^[a-zA-Z\s\-']+$/
  RETURN pattern.test(value.trim())
```

### 2. Error Message Generator
```pseudocode
FUNCTION generateErrorMessage(fieldName, ruleType, ruleValue):
BEGIN
  errorMessages = {
    required: {
      name: "Name is required",
      email: "Email is required", 
      message: "Message is required"
    },
    minLength: {
      name: `Name must be at least ${ruleValue} characters`,
      message: `Message must be at least ${ruleValue} characters`
    },
    maxLength: {
      name: `Name cannot exceed ${ruleValue} characters`,
      message: `Message cannot exceed ${ruleValue} characters`
    },
    emailPattern: {
      email: "Please enter a valid email address"
    },
    namePattern: {
      name: "Name can only contain letters, spaces, hyphens, and apostrophes"
    }
  }
  
  RETURN errorMessages[ruleType][fieldName]
END
```

## 🚀 Event Flow Pseudocode

### 1. Page Load Flow
```pseudocode
ON_PAGE_LOAD:
BEGIN
  1. WAIT for DOM content loaded
  2. CALL initializeForm()
  3. CALL setupResponsiveDesign()
  4. CALL announceFormToScreenReaders()
END
```

### 2. User Input Flow  
```pseudocode
ON_FIELD_INPUT(fieldName, value):
BEGIN
  1. CALL debouncedValidator[fieldName](value)
  2. UPDATE field visual state
  3. CHECK if all fields are valid
  4. UPDATE submit button state
END
```

### 3. Form Submit Flow
```pseudocode
ON_FORM_SUBMIT(event):
BEGIN
  1. PREVENT default submission
  2. VALIDATE all fields synchronously
  3. IF validation fails:
     - SHOW errors and focus first error
  4. ELSE:
     - SHOW loading state
     - SUBMIT form data
     - HANDLE success/error response
END
```

## 🧪 TDD Test Anchors

### Test Structure Templates
```pseudocode
DESCRIBE "Contact Form Validation":
  TEST "should validate required fields"
  TEST "should validate email format"  
  TEST "should validate field length constraints"
  TEST "should show/hide error messages correctly"
  TEST "should handle form submission"
  TEST "should reset form after successful submission"

DESCRIBE "Accessibility Features":
  TEST "should have proper ARIA labels"
  TEST "should support keyboard navigation"
  TEST "should announce errors to screen readers"
  
DESCRIBE "Responsive Design":
  TEST "should adapt to mobile screens"
  TEST "should maintain usability on touch devices"
```

## 🔄 State Management Flow

### Form State Transitions
```pseudocode
FormState = INITIAL | VALIDATING | INVALID | VALID | SUBMITTING | SUCCESS | ERROR

STATE_TRANSITIONS:
  INITIAL -> VALIDATING (on first input)
  VALIDATING -> VALID | INVALID (after validation)
  VALID -> SUBMITTING (on submit)
  SUBMITTING -> SUCCESS | ERROR (after API response)
  SUCCESS -> INITIAL (after timeout)
  ERROR -> VALID | INVALID (on user input)
```

This pseudocode provides a comprehensive blueprint for implementing the contact form with clear algorithms, data structures, and test anchors for TDD development.