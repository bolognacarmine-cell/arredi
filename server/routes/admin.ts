import { Router, Request, Response } from 'express';
import UserModel from '../models/User.js';

const router = Router();

/**
 * POST /api/admin/login
 * Login admin user with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Generic error message - don't reveal if user exists
      console.log(`❌ Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`❌ Login attempt failed: Invalid password for email ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log(`❌ Login attempt failed: User ${email} is not an admin`);
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

    console.log(`✅ Admin login successful: ${email}`);

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
 */
router.post('/logout', (req: Request, res: Response) => {
  try {
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
 */
router.get('/me', (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    res.json({ 
      success: true, 
      user: {
        id: req.session.userId,
        role: req.session.userRole,
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
 * Reset admin password to "buongiorno"
 * Protected by ADMIN_RESET_SECRET header
 */
router.post('/reset-admin-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const secret = req.headers['x-admin-reset-secret'] as string;

    // Verify secret
    const expectedSecret = process.env.ADMIN_RESET_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Invalid or missing reset secret' 
      });
    }

    // Validate email
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
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

    // Reset password to "buongiorno"
    user.password = 'buongiorno';
    await user.save();

    console.log(`🔄 Password reset for admin user: ${email}`);

    res.json({ 
      success: true, 
      message: 'Password admin resettata con successo',
      newPassword: 'buongiorno'
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
