import mongoose from 'mongoose';
import logger from './utils/logger.js';

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI not defined in .env');
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB', { component: 'database' });
  } catch (err) {
    logger.error('MongoDB connection failed', { component: 'database', error: err.message, stack: err.stack });
    throw err;
  }
}
