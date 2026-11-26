import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  const configuredUri = process.env.MONGODB_URI?.trim();

  if (configuredUri) {
    await mongoose.connect(configuredUri);
    return { mode: 'atlas', uri: 'MONGODB_URI (configured)' };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI environment variable is required in production.');
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  return { mode: 'memory', uri };
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
