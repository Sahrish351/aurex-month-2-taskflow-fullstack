import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return { mode: memoryServer ? 'memory' : 'atlas' };
  }

  const configuredUri = process.env.MONGODB_URI?.trim();
  if (configuredUri) {
    await mongoose.connect(configuredUri);
    return { mode: 'atlas' };
  }

  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_MEMORY_DB) {
    throw new Error('MONGODB_URI environment variable must be configured in production.');
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  return { mode: 'memory' };
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
