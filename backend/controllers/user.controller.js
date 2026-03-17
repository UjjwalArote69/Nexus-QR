import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ where: { email } });

        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        const token = generateToken(user.id);

        logger.info('User registered', { userId: user.id, email });

        res.cookie('token', token, cookieOptions);
        res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
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

        const token = generateToken(user.id);
        logger.info('User logged in', { userId: user.id, email });

        res.cookie('token', token, cookieOptions);
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

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
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

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ success: true, message: 'Logged out successfully' });
};
