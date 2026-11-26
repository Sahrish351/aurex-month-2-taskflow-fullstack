export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, _req, res, _next) {
  if (err?.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((entry) => entry.message);
    return res.status(400).json({ message: messages[0] || 'Validation failed.', errors: messages });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource identifier.' });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON request body.' });
  }

  const statusCode = err?.statusCode || 500;
  const message =
    statusCode >= 500 ? 'Internal server error.' : err.message || 'Request failed.';

  return res.status(statusCode).json({ message });
}
