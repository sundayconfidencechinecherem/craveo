// backend/src/middleware/auth.middleware.ts - FIXED
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';

// Extend Request type to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await UserModel.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }
};

// Optional: Middleware for GraphQL context
export const graphqlAuth = async (req: Request) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return { user: null };
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await UserModel.findById(decoded._id).select('-password');
    
    return { user };
  } catch (error) {
    console.error('GraphQL auth error:', error);
    return { user: null };
  }
};