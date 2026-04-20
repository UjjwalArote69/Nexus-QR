import express from 'express';
import { register, login, googleLogin, getProfile, updateProfile, changePassword, deleteAccount, logout, refreshToken, forgotPassword, resetPassword, verifyEmail, resendVerification } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../middleware/validator.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, googleLogin);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/verify-email', verifyEmail);

// Private Routes (Require JWT)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);
router.post('/resend-verification', protect, resendVerification);

export default router;