import crypto from 'crypto';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../config/email.js';

// Short-lived access token (15 minutes)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Long-lived refresh token (7 days)
const generateRefreshToken = (id) => {
    return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ where: { email } });

        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const user = await User.create({ name, email, password, verificationToken });
        const token = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Send verification email (non-blocking)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
        sendVerificationEmail(email, verifyUrl).catch(err =>
            logger.error('Failed to send verification email', { email, error: err.message })
        );

        logger.info('User registered', { userId: user.id, email });

        res.cookie('refreshToken', refreshToken, refreshCookieOptions);
        res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, isVerified: false } });
    } catch (error) {
        logger.error('Registration failed', { email: req.body?.email, error: error.message });
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.comparePassword(password))) {
            logger.warn('Failed login attempt', { email, ip: req.ip });
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        logger.info('User logged in', { userId: user.id, email });

        res.cookie('refreshToken', refreshToken, refreshCookieOptions);
        res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        logger.error('Login failed', { email: req.body?.email, error: error.message });
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getProfile = async (req, res) => {
    if (req.user) {
        res.json({ success: true, user: req.user });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (email && email !== user.email) {
            const existing = await User.findOne({ where: { email } });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
            user.email = email;
        }
        if (name) user.name = name;

        await user.save();
        logger.info('Profile updated', { userId: user.id });

        res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (error) {
        logger.error('Profile update failed', { userId: req.user?.id, error: error.message });
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        user.password = newPassword;
        await user.save();
        logger.info('Password changed', { userId: user.id });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        logger.error('Password change failed', { userId: req.user?.id, error: error.message });
        res.status(500).json({ message: 'Failed to change password' });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Password is incorrect' });

        const userId = user.id;
        await user.destroy();
        logger.info('Account deleted', { userId });

        res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        logger.error('Account deletion failed', { userId: req.user?.id, error: error.message });
        res.status(500).json({ message: 'Failed to delete account' });
    }
};

// ── Password Recovery ──

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        await sendPasswordResetEmail(email, resetUrl);
        logger.info('Password reset requested', { email });

        res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        logger.error('Forgot password failed', { error: error.message });
        res.status(500).json({ message: 'Failed to process request' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const { Op } = await import('sequelize');
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiry: { [Op.gt]: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        logger.info('Password reset successful', { userId: user.id });
        res.json({ success: true, message: 'Password has been reset. You can now log in.' });
    } catch (error) {
        logger.error('Password reset failed', { error: error.message });
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

// ── Email Verification ──

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ message: 'Verification token is required' });

        const user = await User.findOne({ where: { verificationToken: token } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        logger.info('Email verified', { userId: user.id });
        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        logger.error('Email verification failed', { error: error.message });
        res.status(500).json({ message: 'Failed to verify email' });
    }
};

export const resendVerification = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.json({ success: true, message: 'Email is already verified' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
        await sendVerificationEmail(user.email, verifyUrl);

        res.json({ success: true, message: 'Verification email resent' });
    } catch (error) {
        logger.error('Resend verification failed', { error: error.message });
        res.status(500).json({ message: 'Failed to resend verification email' });
    }
};

// ── Token Refresh ──

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ message: 'No refresh token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: 'Invalid token type' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);

        res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);
        res.json({ success: true, token: newAccessToken });
    } catch (error) {
        logger.warn('Refresh token failed', { error: error.message });
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

export const logout = (req, res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        path: '/',
        expires: new Date(0),
    });
    res.json({ success: true, message: 'Logged out successfully' });
};
