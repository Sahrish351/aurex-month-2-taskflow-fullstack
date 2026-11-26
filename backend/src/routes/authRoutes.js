import { Router } from 'express';
import { getMe, login, logout, register, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 50 });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

export default router;
