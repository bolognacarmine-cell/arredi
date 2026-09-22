import { Request, Response, NextFunction } from 'express';

export interface CustomSession {
  userId?: string;
  userRole?: 'user' | 'admin';
  destroy(callback?: (err?: Error) => void): void;
}

declare module 'express-serve-static-core' {
  interface Request {
    session?: CustomSession;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Only log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[REQUIRE ADMIN] Checking admin access for:', req.method, req.url);
    console.log('[REQUIRE ADMIN] Session exists:', !!req.session);
    console.log('[REQUIRE ADMIN] User ID present:', !!req.session?.userId);
    console.log('[REQUIRE ADMIN] User role:', req.session?.userRole || 'missing');
  }

  // Check if user is authenticated via session
  if (!req.session || !req.session.userId) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[REQUIRE ADMIN] Access denied - No valid session');
    }
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No active session'
    });
  }

  // Check if user has admin role
  if (req.session.userRole !== 'admin') {
    if (process.env.NODE_ENV === 'development') {
      console.log('[REQUIRE ADMIN] Access denied - Not admin');
    }
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access required'
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[REQUIRE ADMIN] Access granted');
  }
  // User is authenticated and is admin
  next();
}
