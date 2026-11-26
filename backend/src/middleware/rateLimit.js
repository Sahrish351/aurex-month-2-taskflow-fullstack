const buckets = new Map();

export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 40 } = {}) {
  return function rateLimit(req, res, next) {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = buckets.get(key);

    if (!record || now > record.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        message: 'Too many authentication attempts. Please wait a few minutes and try again.',
      });
    }

    record.count += 1;
    return next();
  };
}
