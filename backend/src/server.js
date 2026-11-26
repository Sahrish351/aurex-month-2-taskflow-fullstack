import 'dotenv/config';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  const dbInfo = await connectDB();
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`TaskFlow API listening on http://localhost:${PORT} (${dbInfo.mode})`);
  });
}

start().catch((err) => {
  console.error('Failed to start TaskFlow backend:', err.message);
  process.exit(1);
});
