const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate slug from text
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
};

// Calculate reading time (words per minute = 200)
const calculateReadingTime = (text) => {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD HH:mm:ss':
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    default:
      return d.toISOString();
  }
};

// Paginate query results
const paginate = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    select = '',
    populate = ''
  } = options;

  const skip = (page - 1) * limit;

  let queryBuilder = model.find(query);

  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(pop => {
        queryBuilder = queryBuilder.populate(pop);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }

  const [results, total] = await Promise.all([
    queryBuilder
      .sort(sort)
      .skip(skip)
      .limit(limit),
    model.countDocuments(query)
  ]);

  return {
    results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
};

// Deep merge objects
const deepMerge = (target, source) => {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
};

// Check if value is object
const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// Remove undefined/null values from object
const cleanObject = (obj) => {
  const cleaned = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (isObject(obj[key])) {
        const cleanedNested = cleanObject(obj[key]);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = obj[key];
      }
    }
  });
  
  return cleaned;
};

// Validate JWT token without throwing error
const validateJWT = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Generate API key
const generateApiKey = () => {
  const timestamp = Date.now().toString();
  const random = generateRandomString(16);
  return `ak_${timestamp}_${random}`;
};

// Rate limiting key generator
const generateRateLimitKey = (req, identifier = 'ip') => {
  switch (identifier) {
    case 'ip':
      return req.ip;
    case 'user':
      return req.user ? req.user._id : req.ip;
    case 'api_key':
      return req.headers['x-api-key'] || req.ip;
    default:
      return req.ip;
  }
};

// Extract public fields from user object
const getPublicUserFields = (user) => {
  if (!user) return null;
  
  const publicFields = {
    _id: user._id,
    username: user.username,
    profile: {
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      avatar: user.profile?.avatar,
      bio: user.profile?.bio
    },
    createdAt: user.createdAt
  };

  return cleanObject(publicFields);
};

// Convert mongoose document to plain object
const toObject = (doc) => {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : doc;
};

module.exports = {
  generateRandomString,
  generateSlug,
  isValidEmail,
  sanitizeInput,
  calculateReadingTime,
  formatDate,
  paginate,
  deepMerge,
  isObject,
  cleanObject,
  validateJWT,
  generateApiKey,
  generateRateLimitKey,
  getPublicUserFields,
  toObject
};