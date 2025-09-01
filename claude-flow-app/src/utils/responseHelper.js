// Standardized response helper functions

// Success response
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response
const sendError = (res, statusCode = 500, message = 'Internal Server Error', details = null) => {
  const response = {
    success: false,
    error: {
      message,
      statusCode
    },
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

// Paginated response
const sendPaginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString()
  });
};

// Created response
const sendCreated = (res, message = 'Resource created successfully', data = null) => {
  return sendSuccess(res, 201, message, data);
};

// No content response
const sendNoContent = (res) => {
  return res.status(204).send();
};

// Not found response
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

// Unauthorized response
const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, 401, message);
};

// Forbidden response
const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, 403, message);
};

// Bad request response
const sendBadRequest = (res, message = 'Bad request', details = null) => {
  return sendError(res, 400, message, details);
};

// Validation error response
const sendValidationError = (res, errors) => {
  return sendError(res, 422, 'Validation failed', errors);
};

// Server error response
const sendServerError = (res, message = 'Internal server error') => {
  return sendError(res, 500, message);
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendBadRequest,
  sendValidationError,
  sendServerError
};