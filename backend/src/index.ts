// =====================
// LOAD ENV FIRST (VERY IMPORTANT)
// =====================
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// Debug (remove later)
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET loaded:', !!process.env.JWT_REFRESH_SECRET);
console.log('CLOUDINARY_NAME:', process.env.CLOUDINARY_CLOUD_NAME);

// =====================
// NORMAL IMPORTS (AFTER DOTENV)
// =====================
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database';
import { createApolloServer } from './config/apollo.config';
import uploadRoutes from './routes/upload.routes';

// =====================
// START SERVER
// =====================
const startServer = async () => {
  try {
    const app = express();

    // Middleware
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    }));
    app.use(cookieParser());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Upload route (before Apollo)
    app.use('/api/upload', uploadRoutes);

    // DB
    await connectDB();

    // Apollo
    const { httpServer } = await createApolloServer(app);

    const PORT = process.env.PORT || 5001;
    httpServer.listen(PORT, () => {
      console.log(`🚀 GraphQL: http://localhost:${PORT}/graphql`);
      console.log(`📤 Upload: http://localhost:${PORT}/api/upload`);
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();
