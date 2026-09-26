import { Router, Request, Response } from 'express';
import UserModel from '../models/User.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

/**
 * POST /api/admin/login
 * Login admin user with email and password
 * Security: Only POST method allowed for security best practices
 */
// @ts-ignore - TypeScript version conflict between project and server folder
router.post('/login', loginRateLimiter as any, async (req: Request, res: Response) => {
  try {
    // Security: Ensure only POST method is accepted
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    const { email, password } = req.body;

    // Validate input - basic type and presence checks
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Ensure email is a string and password is a string
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input types' 
      });
    }
    
    // Email length validation (RFC 5321 max 254 characters, but we use 254 for safety)
    if (email.length > 254) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email too long' 
      });
    }
    
    // Basic email format validation (minimal, non-blocking)
    if (!email.includes('@') || email.length < 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    // Password length validation (min 6, max 128 for security and practicality)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password too long'
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generic error message - don't reveal if user exists
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Set session
    if (req.session) {
      req.session.userId = user._id.toString();
      req.session.userRole = user.role;
    }

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * POST /api/admin/logout
 * Logout admin user
 * Security: Only POST method allowed for security best practices
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
    // Security: Ensure only POST method is accepted
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Error destroying session:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error during logout' 
          });
        }
      });
    }

    res.clearCookie('farcom.sid');
    res.json({ 
      success: true, 
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('❌ Error during logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * GET /api/admin/me
 * Get current admin user info
 * Security: Only GET method allowed for security best practices
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Security: Ensure only GET method is accepted
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    // Only log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH CHECK] Method:', req.method, 'URL:', req.url);
      console.log('[AUTH CHECK] Session object exists:', !!req.session);
      console.log('[AUTH CHECK] User ID in session:', req.session?.userId ? 'present' : 'missing');
      console.log('[AUTH CHECK] User role in session:', req.session?.userRole || 'missing');
      console.log('[AUTH CHECK] Response status:', req.session?.userId ? '200' : '401');
    }

    if (!req.session || !req.session.userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH CHECK] Returning 401 - No valid session');
      }
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Fetch user details from database to get email and name
    const user = await UserModel.findById(req.session.userId);
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH CHECK] User not found in database');
      }
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH CHECK] Auth check successful');
    }
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('❌ Error getting user info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users (admin only)
 * Security: Only GET method allowed, requires admin authentication
 */
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Security: Ensure only GET method is accepted
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    const users = await UserModel.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users.map(user => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 * Security: Only DELETE method allowed, requires admin authentication
 */
router.delete('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Security: Ensure only DELETE method is accepted
    if (req.method !== 'DELETE') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    const { id } = req.params;

    // Prevent deletion of the current user
    if (req.session?.userId === id) {
      return res.status(403).json({
        success: false,
        message: 'Non puoi eliminare il tuo stesso account'
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of the last admin user
    if (user.role === 'admin') {
      const adminCount = await UserModel.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(403).json({
          success: false,
          message: 'Non puoi eliminare l\'ultimo utente admin'
        });
      }
    }

    await UserModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Utente eliminato con successo'
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
