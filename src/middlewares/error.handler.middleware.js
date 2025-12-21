/**
 * Centralized error handler
 */

import logger from '../utils/logger.util.js';

// Normalize Joi validation error messages for client responses
// - Removes transport-level prefixes (body, query, params, cookies)
// - Preserves custom Joi messages
// - Relies on default Joi messages wrapping field names in ""
const formatJoiDetails = (d) => {
  // Custom Joi message → return as-is
  if (!d.message.includes('"')) {
    return d.message;
  }

  // Remove transport-level prefix
  const field = d.path.slice(1).join('.');

  // Rebuild default Joi message with clean field name
  const [, , tail] = d.message.split('"');
  return `"${field}"${tail}`;
};

const errorHandler = (err, _req, res, _next) => {
  const isValidationError = err.isJoi && err.details;

  const status = isValidationError ? 400 : err.status || err.statusCode || 500;

  const message = isValidationError
    ? 'Request validation error!'
    : err.publicMessage || err.message || 'Internal server error!';

  const details = isValidationError
    ? err.details.map(formatJoiDetails)
    : undefined;

  logger.error(message, {
    status,
    ...(details && { details }),
    stack: err.stack,
  });
  res.status(status).json({
    message,
    ...(details && { details }),
  });
};

export default errorHandler;
