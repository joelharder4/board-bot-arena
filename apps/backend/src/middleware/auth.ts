import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../env.ts';
import type { UserRole } from '@board-bot-arena/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: UserRole;
      };
    }
  }
}

// anyone signed in
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  try {
    const token = authHeader.split(' ')[1]!;
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as { userId: number; role: UserRole };
    req.user = payload;
    
    next();
  } catch (error) {
    res.status(403).json({ error: "Token is invalid or expired" });
    return;
  }
};

// only specific roles
export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "You do not have permission to perform this action" });
      return;
    }

    next();
  };
};