/**
 * Middleware for request context
 */

import { v4 as uuidv4 } from 'uuid';

import requestContext from '../utils/request.context.util.js';

const requestContextMiddleware = (req, res, next) => {
  /** If upstream service or client already sent the request ID, use it */
  const incomingId = req.headers['x-request-id'];

  /** Otherwise generate a new one */
  const requestId = incomingId || uuidv4();

  /** Store it in async local storage for downsstream logger access */
  requestContext.setContext({ requestId });

  /** Attach request id to request object for app-level handlers */
  req.requestId = requestId;

  /** Always expose it in response headers */
  res.setHeader('X-Request-ID', requestId);

  next();
};

export default requestContextMiddleware;
