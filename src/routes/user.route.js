import express from 'express';

import { userController } from '../controllers/index.js';
import authentication from '../middlewares/authentication.middleware.js';

const router = express.Router();
router.get('/profile', authentication, userController.profile);

export default router;
