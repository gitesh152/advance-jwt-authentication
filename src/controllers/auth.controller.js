import ms from 'ms';

import { accessTokenExpiry } from '../config/env.config.js';
import { User } from '../models/index.js';
import { authService } from '../services/index.js';
import { clearRefreshCookie, setRefreshCookie } from '../utils/cookie.util.js';
import logger from '../utils/logger.util.js';
import { hashToken } from '../utils/token.util.js';

export const register = async (req, res, next) => {
  try {
    const email = String(req.body.email || '');
    const name = String(req.body.name || '');
    const password = req.body.password;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: 'Email already registered!',
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({ name, email, passwordHash });

    const userObj = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    logger.info(`User registered.`, userObj);

    const tokens = await authService.createTokens(user, {
      ip: req?.ip,
      userAgent: req.get('User-Agent'),
    });

    setRefreshCookie(res, tokens.refreshToken);

    return res.status(201).json({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: ms(accessTokenExpiry) / 1000,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '');
    const password = req.body.password;

    const exists = await User.findOne({ email }).select('+passwordHash');

    if (!exists || !(await exists.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid Credentails!!!',
      });
    }

    const userObj = {
      id: exists._id.toString(),
      name: exists.name,
      email: exists.email,
    };

    const tokens = await authService.createTokens(exists, {
      ip: req?.ip,
      userAgent: req.get('User-Agent'),
    });

    setRefreshCookie(res, tokens.refreshToken);

    return res.status(200).json({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: ms(accessTokenExpiry) / 1000,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const tokens = await authService.rotateTokens(refreshToken, {
      ip: req?.ip,
      userAgent: req.get('User-Agent'),
    });

    setRefreshCookie(res, tokens.refreshToken);
    return res.status(200).json({
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: ms(accessTokenExpiry) / 1000,
      message: 'Token refreshed successfully...',
    });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const tokenHash = hashToken(refreshToken);

    const wasRevoked = await authService.revokeRefreshToken(tokenHash);

    if (wasRevoked) {
      logger.info(
        `Refresh token revoked successfully, tokenHashPrefix= ${tokenHash.slice(0, 8)}`,
      );
    } else {
      logger.error(
        `Attempt to revoke with invalid or already revoked refresh token, tokenHashPrefix= ${tokenHash.slice(0, 8)}`,
      );
    }

    clearRefreshCookie(res);

    /** Always respond with status 200, even If refresh token was not found in DB */
    return res.status(200).json({
      message: 'Logout Successfully...',
    });
  } catch (error) {
    /** Always clear cookie even If revokation fails. */
    clearRefreshCookie(res);
    logger.error(`Error during logout!`, { error: error.message });
    return res.status(500).json({
      message: `Error during logout!, error: ${error.message}`,
    });
  }
};

export const globalLogout = async (req, res, next) => {
  try {
    const userId = req.user.id.toString();
    const revokedCount = await authService.revokeAllRefreshToken(userId);

    let loggerMsg;
    let resMsg;
    if (revokedCount) {
      loggerMsg = `Revoked ${revokedCount} refresh tokens for user: ${userId}`;
      resMsg = `Logged out from all devices.`;
    } else {
      loggerMsg = `No active refresh tokens for user: ${userId}`;
      resMsg = `No active session to logout from.`;
    }

    clearRefreshCookie(res);
    logger.info(loggerMsg);
    return res.status(200).json({ message: resMsg });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};
