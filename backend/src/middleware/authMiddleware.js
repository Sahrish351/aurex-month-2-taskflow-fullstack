import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAllowedOrigins, getJwtSecret } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'taskflow_token';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;
    let usedCookie = false;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies?.[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
      usedCookie = true;
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please sign in.' });
    }

    // Protect cookie-authenticated state-changing calls against CSRF
    if (usedCookie && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const hasCustomHeader = req.headers['x-requested-with'] === 'TaskFlow';
      const origin = req.headers.origin;
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const allowedOrigins = getAllowedOrigins();
      const originMatchesHost =
        typeof origin === 'string' &&
        (allowedOrigins.includes(origin) ||
          (typeof host === 'string' && (origin === `https://${host}` || origin === `http://${host}`)));

      if (!hasCustomHeader && !originMatchesHost) {
        return res.status(403).json({ message: 'Request origin could not be verified.' });
      }
    }

    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Session is no longer valid. Please sign in again.' });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    if (err?.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }
    return next(err);
  }
}
