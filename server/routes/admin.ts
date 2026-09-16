import { Router, Request, Response } from 'express';
import UserModel from '../models/User.js';

const router = Router();

/**
 * POST /api/admin/login
 * Login admin user with email and password
 * Security: Only POST method allowed for security best practices
 */
router.post('/login', async (req: Request, res: Response) => {
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
    console.log('[AUTH CHECK] Method:', req.method, 'URL:', req.url);
    console.log('[AUTH CHECK] Session object exists:', !!req.session);
    console.log('[AUTH CHECK] User ID in session:', req.session?.userId ? 'present' : 'missing');
    console.log('[AUTH CHECK] User role in session:', req.session?.userRole || 'missing');
    console.log('[AUTH CHECK] Response status:', req.session?.userId ? '200' : '401');

    if (!req.session || !req.session.userId) {
      console.log('[AUTH CHECK] Returning 401 - No valid session');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Fetch user details from database to get email and name
    const user = await UserModel.findById(req.session.userId);
    if (!user) {
      console.log('[AUTH CHECK] User not found in database');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('[AUTH CHECK] Auth check successful');
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
 * POST /api/admin/reset-admin-password
 * Reset admin password by providing the reset code "buongiorno"
 * Security: Only POST method allowed for security best practices
 */
router.post('/reset-admin-password', async (req: Request, res: Response) => {
  try {
    // Security: Ensure only POST method is accepted
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }
    const { email, resetCode } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Validate reset code
    if (!resetCode || resetCode !== 'buongiorno') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid reset code' 
      });
    }

    // Find user
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin users can have their password reset' 
      });
    }

    // Reset password to environment variable value - no default for security
    const resetPassword = process.env.ADMIN_RESET_PASSWORD;
    if (!resetPassword) {
      return res.status(500).json({
        success: false,
        message: 'ADMIN_RESET_PASSWORD environment variable not configured'
      });
    }
    
    user.password = resetPassword;
    await user.save();

    console.log(`🔄 Password reset for admin user: ${email}`);

    res.json({ 
      success: true, 
      message: 'Password resettata con successo'
    });
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

export default router;
