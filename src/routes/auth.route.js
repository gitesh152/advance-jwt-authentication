import express from 'express';
import rateLimit from 'express-rate-limit';

import { authController } from '../controllers/index.js';
import authentication from '../middlewares/authentication.middleware.js';
import requestBodyValidation from '../middlewares/request.body.validation.middleware.js';
import { authValidation } from '../validations/index.js';

const router = express.Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Slow down.' },
});

const refreshRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many refresh attempts. Slow down.' },
});

router.post(
  '/register',
  requestBodyValidation(authValidation.registerSchema),
  authController.register,
);

router.post(
  '/login',
  loginRateLimiter,
  requestBodyValidation(authValidation.loginSchema),
  authController.login,
);

router.post('/refresh', refreshRateLimiter, authController.refresh);

router.post('/logout', authentication, authController.logout);

router.post('/logout-all', authentication, authController.globalLogout);

export default router;
