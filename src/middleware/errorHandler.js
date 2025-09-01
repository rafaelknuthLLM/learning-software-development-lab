const winston = require('winston');

// Custom error class
class AppError extends Error {
  constructor(statusCode, message, details = null, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Create error utility function
const createError = (statusCode, message, details = null) => {
  return new AppError(statusCode, message, details);
};

// Handle Cast Error (Invalid ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

// Handle Duplicate Field Error
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists. Please use a different value.`;
  return new AppError(400, message);
};

// Handle Validation Error
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(400, message, errors);
};

// Handle JWT Error
const handleJWTError = () => {
  return new AppError(401, 'Invalid token. Please log in again.');
};

// Handle JWT Expired Error
const handleJWTExpiredError = () => {
  return new AppError(401, 'Your token has expired. Please log in again.');
};

// Send error response for development
const sendErrorDev = (err, res) => {
  winston.error('Error in development:', {
    error: err,
    stack: err.stack,
    statusCode: err.statusCode,
    status: err.status
  });

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    details: err.details,
    stack: err.stack
  });
};

// Send error response for production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    winston.error('Operational error:', {
      message: err.message,
      statusCode: err.statusCode,
      details: err.details
    });

    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      details: err.details
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    winston.error('Programming error:', {
      error: err,
      stack: err.stack
    });

    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong on our end. Please try again later.'
    });
  }
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Handle unhandled routes
const notFound = (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  next(new AppError(404, message));
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  createError,
  globalErrorHandler,
  notFound,
  asyncHandler
};