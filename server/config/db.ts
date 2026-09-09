import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not set - running without database');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed: ${error} - running without database`);
    // Don't exit - allow the server to run without MongoDB
  }
};
