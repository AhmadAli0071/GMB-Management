import mongoose from 'mongoose';
import logger from './utils/logger.js';

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected', { component: 'database' });
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected', { component: 'database' });
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { component: 'database', error: err.message });
});

async function connectWithRetry(retries = 5, delayMs = 3000) {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI not defined in .env');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      });
      logger.info('Connected to MongoDB', { component: 'database', attempt });
      return;
    } catch (err) {
      logger.error('MongoDB connection failed', {
        component: 'database',
        attempt: `${attempt}/${retries}`,
        error: err.message,
      });
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
}

export { connectWithRetry as connectDB };
