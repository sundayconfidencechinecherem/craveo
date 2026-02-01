import { AuthRequest } from '../../middleware/auth.middleware';
import { Response } from 'express';

export interface GraphQLContext {
  user?: any;
  req: AuthRequest;
  res: Response;
}

// Context builder: attaches authenticated user + req/res
export const createContext = ({ req, res }: { req: AuthRequest; res: Response }): GraphQLContext => {
  return {
    user: req.user,
    req,
    res
  };
};
