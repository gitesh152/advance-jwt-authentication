/**
 * MongoDB connection configuration
 */

import mongoose from 'mongoose';

import { isProd } from './env.config.js';
import logger from '../utils/logger.util.js';

/** Ignore fields that is not schema */
mongoose.set('strictQuery', true);

const connectDb = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri, {
      autoIndex: !isProd /** Auto-indexing in development */,
      retryWrites: true /** Improve reliability by allowing safe writes */,
      maxPoolSize: 10 /** Max 10 con-current connections in pool */,
      serverSelectionTimeoutMS: 10000 /** Don't wait forever to connect to DB */,
      socketTimeoutMS: 45000 /** Don't let query hang forever */,
    });
    logger.info(`✅ MongoDB Connected`);
  } catch (error) {
    logger.error(`❌ MongoDB connection error:`, error);
    throw error;
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn(`MongoDB Disconnected!!!`);
  });

  mongoose.connection.on('reconnected', () => {
    logger.warn(`MongoDB Reconnected!!!`);
  });
};

export default connectDb;
