import 'dotenv/config';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 4003;

async function start() {
  const dbInfo = await connectDB();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Week 3 CRUD API listening on http://localhost:${PORT} (${dbInfo.mode})`);
  });
}

start().catch((err) => {
  console.error('Failed to start Week 3 CRUD API:', err.message);
  process.exit(1);
});
