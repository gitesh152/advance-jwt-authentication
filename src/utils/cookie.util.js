import ms from 'ms';

import { isProd, refreshTokenExpiry } from '../config/env.config.js';

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
    maxAge: ms(refreshTokenExpiry),
  });
};

export const clearRefreshCookie = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
    expires: new Date(0) /** past date to force expire */,
  });
};
