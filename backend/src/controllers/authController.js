import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/env.js';
import { AUTH_COOKIE_NAME } from '../middleware/authMiddleware.js';
import { isPlainString } from '../utils/validators.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signAuthToken(userId) {
  return jwt.sign({ sub: userId.toString() }, getJwtSecret(), { expiresIn: '7d' });
}

function setAuthCookie(req, res, token) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    partitioned: isHttps,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearAuthCookie(req, res) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    partitioned: isHttps,
    path: '/',
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body ?? {};

    if (!isPlainString(name) || name.trim().length < 2 || name.trim().length > 60) {
      return res.status(400).json({ message: 'Full name must be between 2 and 60 characters.' });
    }
    if (!isPlainString(email) || !EMAIL_PATTERN.test(email.trim().toLowerCase())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!isPlainString(password) || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = signAuthToken(user._id);
    setAuthCookie(req, res, token);

    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (!isPlainString(email) || !isPlainString(password) || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signAuthToken(user._id);
    setAuthCookie(req, res, token);

    return res.status(200).json({ user: user.toJSON(), token });
  } catch (err) {
    return next(err);
  }
}

export function logout(req, res) {
  clearAuthCookie(req, res);
  return res.status(200).json({ message: 'Logged out successfully.' });
}

export function getMe(req, res) {
  return res.status(200).json({ user: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, currentPassword, newPassword } = req.body ?? {};
    const user = await User.findById(req.user._id).select('+passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    if (name !== undefined) {
      if (!isPlainString(name) || name.trim().length < 2 || name.trim().length > 60) {
        return res.status(400).json({ message: 'Full name must be between 2 and 60 characters.' });
      }
      user.name = name.trim();
    }

    if (newPassword !== undefined && newPassword !== '') {
      if (!isPlainString(currentPassword) || !currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password.' });
      }
      if (!isPlainString(newPassword) || newPassword.length < 8 || newPassword.length > 128) {
        return res.status(400).json({ message: 'New password must be between 8 and 128 characters.' });
      }
      const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatches) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();
    return res.status(200).json({ user: user.toJSON() });
  } catch (err) {
    return next(err);
  }
}
