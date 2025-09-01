const { body, param, query, validationResult } = require('express-validator');
const { createError } = require('./errorHandler');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return next(createError(400, 'Validation failed', errorMessages));
  }
  
  next();
};

// Custom validators
const isStrongPassword = (value) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  return strongPasswordRegex.test(value);
};

// User validation rules
const userValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .custom(isStrongPassword)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('profile.firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    
    body('profile.lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    
    handleValidationErrors
  ],

  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    handleValidationErrors
  ],

  updateProfile: [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('profile.firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    
    body('profile.lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    
    body('profile.bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters'),
    
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .custom(isStrongPassword)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    handleValidationErrors
  ]
};

// Post validation rules
const postValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('content')
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Content must be between 10 and 5000 characters'),
    
    body('excerpt')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Excerpt cannot exceed 300 characters'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be one of: draft, published, archived'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage('Each tag cannot exceed 30 characters'),
    
    body('seo.metaTitle')
      .optional()
      .trim()
      .isLength({ max: 60 })
      .withMessage('Meta title cannot exceed 60 characters'),
    
    body('seo.metaDescription')
      .optional()
      .trim()
      .isLength({ max: 160 })
      .withMessage('Meta description cannot exceed 160 characters'),
    
    handleValidationErrors
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    
    body('content')
      .optional()
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Content must be between 10 and 5000 characters'),
    
    body('excerpt')
      .optional()
      .trim()
      .isLength({ max: 300 })
      .withMessage('Excerpt cannot exceed 300 characters'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be one of: draft, published, archived'),
    
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    
    body('tags.*')
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage('Each tag cannot exceed 30 characters'),
    
    handleValidationErrors
  ]
};

// Query validation
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('sort')
      .optional()
      .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title', 'publishedAt', '-publishedAt'])
      .withMessage('Invalid sort field'),
    
    handleValidationErrors
  ],

  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    
    query('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be one of: draft, published, archived'),
    
    query('tags')
      .optional()
      .isString()
      .withMessage('Tags must be a comma-separated string'),
    
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  userValidation,
  postValidation,
  queryValidation,
  isStrongPassword
};