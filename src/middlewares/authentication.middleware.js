/**
 * Authenticate requests using Bearer access token, attaches req.user on success
 */

import logger from '../utils/logger.util.js';
import { verifyAccessToken } from '../utils/token.util.js';

const authentication = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader?.startsWith('Bearer')) {
      return res.status(401).json({
        message: 'Access token missing or malformed!',
      });
    }
    const accessToken = authHeader.split(' ')[1];
    const payload = verifyAccessToken(accessToken);
    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.error(`Access token expired!`, { error: error.message });
      return res.status(401).json({
        message: 'Access token expired!',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      logger.error(`Invalid access token!`, { error: error.message });
      return res.status(401).json({
        message: 'Invalid access token!',
      });
    }
    next(error);
  }
};

export default authentication;
