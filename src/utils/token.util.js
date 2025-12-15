import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import {
  accessTokenExpiry,
  accessTokenSecret,
  jwtAudience,
  jwtIssuer,
  refreshTokenExpiry,
  refreshTokenSecret,
} from '../config/env.config.js';

export const signAccessToken = (payload = {}) => {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000) /** Issued at time */,
      jti: uuidv4() /** Unique id for future block list */,
      typ: 'access',
    },
    accessTokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: accessTokenExpiry,
      issuer: jwtIssuer,
      audience: jwtAudience,
    },
  );
};

export const signRefreshToken = (payload = {}) => {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000) /** Issued at time */,
      jti: uuidv4() /** Unique id for future block list */,
      typ: 'refresh',
    },
    refreshTokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: refreshTokenExpiry,
      issuer: jwtIssuer,
      audience: jwtAudience,
    },
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret, {
    algorithms: ['HS256'],
    issuer: jwtIssuer,
    audience: jwtAudience,
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshTokenSecret, {
    algorithms: ['HS256'],
    issuer: jwtIssuer,
    audience: jwtAudience,
  });
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
