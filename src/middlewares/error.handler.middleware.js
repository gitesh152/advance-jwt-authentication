/**
 * Centralized error handler
 */

import { isProd } from '../config/env.config.js';
import logger from '../utils/logger.util.js';

const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const isValidationError = err.isJoi && err.details;

  const payload = {
    status,
    message: isValidationError
      ? 'Request validation error!'
      : err.publicMessage || err.message || 'Internal server error!',
  };

  if (isValidationError) {
    payload.details = err.details.map((d) => d.message);
  }

  if (!isProd && err.stack) {
    payload.stack = err.stack;
  }

  logger.error(payload);
  res.status(status).json(payload);
};

export default errorHandler;
