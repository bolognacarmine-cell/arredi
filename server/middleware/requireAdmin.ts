import { Request, Response, NextFunction } from 'express';

export interface CustomSession {
  userId?: string;
  userRole?: 'user' | 'admin';
}

declare module 'express-serve-static-core' {
  interface Request {
    session?: CustomSession;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated via session
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: No active session' 
    });
  }

  // Check if user has admin role
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Admin access required' 
    });
  }

  // User is authenticated and is admin
  next();
}
