import { Router, Request, Response } from 'express';
import UserModel from '../models/User.js';

const router = Router();

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
