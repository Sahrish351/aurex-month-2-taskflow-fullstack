import crypto from 'node:crypto';

let ephemeralJwtSecret = null;

export function getJwtSecret() {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) {
    return configured;
  }
  if (!ephemeralJwtSecret) {
    ephemeralJwtSecret = crypto.randomBytes(32).toString('hex');
  }
  return ephemeralJwtSecret;
}

export function getAllowedOrigins() {
  const defaults = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];
  const configured = [process.env.CORS_ORIGIN, process.env.APP_URL]
    .filter(Boolean)
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaults, ...configured]));
}
