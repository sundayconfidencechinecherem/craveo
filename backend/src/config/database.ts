import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI  as string;

    const conn = await mongoose.connect(MONGODB_URI, {
      // recommended options for modern Mongoose
      autoIndex: true,
      serverSelectionTimeoutMS: 5001,
      maxPoolSize: 10
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
