import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { getAllowedOrigins } from './config/env.js';
import { apiNotFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp({ mountSpaFallback = false } = {}) {
  const app = express();
  app.set('trust proxy', 1);

  const allowedOrigins = getAllowedOrigins();

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ status: 'ok', service: 'taskflow-api', database: dbState });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  app.use('/api', apiNotFoundHandler);

  if (!mountSpaFallback) {
    app.use(apiNotFoundHandler);
  }

  app.use(errorHandler);

  return app;
}
