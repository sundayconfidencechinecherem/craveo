import { Request, Response } from 'express';
import UserModel from '../models/User.model';
import { verifyAccessToken } from '../utils/auth.utils';

export const createContext = async ({ req, res }: { req: Request; res: Response }) => {
  let user = null;
  
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        user = await UserModel.findById(decoded._id).select('id username email fullName avatar isVerified');
      }
    }
  } catch (error) {
    console.warn('Invalid token:', error);
  }
  
  return { req, res, user };
};