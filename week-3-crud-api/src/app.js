import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import itemRoutes from './routes/itemRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  app.use(cors({ origin: allowedOrigin.split(',').map((o) => o.trim()) }));
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ status: 'ok', service: 'week-3-crud-api', database: dbState });
  });

  app.use('/api/items', itemRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
