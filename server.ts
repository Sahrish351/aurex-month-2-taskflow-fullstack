import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { connectDB } from './backend/src/config/db.js';
import { createApp } from './backend/src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  let dbReady = false;
  let dbError: Error | null = null;
  const dbPromise = connectDB()
    .then((info) => {
      dbReady = true;
      console.log(`TaskFlow database connected (mode: ${info.mode})`);
      return info;
    })
    .catch((err) => {
      dbError = err instanceof Error ? err : new Error(String(err));
      console.error('Database initialization error:', dbError);
      throw dbError;
    });

  const apiApp = createApp({ mountSpaFallback: true });
  const app = express();

  // Ensure DB initialization finishes before handling API mutations/queries,
  // while keeping /api/health and frontend port 3000 responsive immediately.
  app.use('/api', async (req, res, next) => {
    if (req.path === '/health') {
      return next();
    }
    if (!dbReady) {
      try {
        await dbPromise;
      } catch (err) {
        return res.status(503).json({
          message: err instanceof Error ? err.message : 'Database is initializing. Please retry.',
        });
      }
    }
    return next();
  });

  app.use(apiApp);

  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(__dirname, 'dist');

  if (!isProd || !fs.existsSync(distDir)) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start TaskFlow server:', err);
  process.exit(1);
});
