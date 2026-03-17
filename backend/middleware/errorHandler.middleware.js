import logger from '../config/logger.js';

// Centralized error handler — must have 4 params for Express to recognize it
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  // Log the error with context
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode,
    userId: req.user?.id || null,
  };

  if (isServerError) {
    logger.error(err.message, { ...logPayload, stack: err.stack });
  } else {
    logger.warn(err.message, logPayload);
  }

  res.status(statusCode).json({
    success: false,
    message: isServerError && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};

export default errorHandler;
