import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, deleteAccount, logout } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../middleware/validator.middleware.js';

const router = express.Router();

// Public Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

// Private Routes (Require JWT via Cookie)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

export default router;