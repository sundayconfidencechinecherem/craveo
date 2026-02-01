// backend/src/index.ts - UPDATED VERSION
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { createApolloServer } from './config/apollo.config';
import uploadRoutes from './routes/upload.routes'; // Import upload routes

dotenv.config();

const startServer = async () => {
  try {
    // Initialize Express
    const app = express();

    // Middleware - INCREASE PAYLOAD LIMITS
    app.use(cors({ 
      origin: process.env.CLIENT_URL || 'http://localhost:3000', 
      credentials: true 
    }));
    app.use(cookieParser());
    app.use(express.json({ limit: '50mb' })); // Increase JSON limit
    app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase URL-encoded limit

    // Upload routes (needs to be before Apollo to handle multipart/form-data)
    app.use('/api/upload', uploadRoutes);

    // Connect to MongoDB
    await connectDB();

    // Apollo Server
    const { httpServer } = await createApolloServer(app);

    const PORT = process.env.PORT || 5001;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      console.log(`📤 Upload API ready at http://localhost:${PORT}/api/upload`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();