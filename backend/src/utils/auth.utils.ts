import jwt from 'jsonwebtoken';
import { IUser } from '../models/User.model';

// Secrets (fallbacks provided for dev, but override in production via env vars)
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret_in_production';

// Token lifetimes
const ACCESS_TOKEN_EXPIRES_IN = '24h';   // 24 hours  
const REFRESH_TOKEN_EXPIRES_IN = '7d';   // 7 days

// Generate access token
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { _id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

// Generate refresh token
export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    { _id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

// Verify access token
export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token shit');
  }
};
