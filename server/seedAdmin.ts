import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import UserModel from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'server.env') });

async function seedAdmin() {
  try {
    await connectDB();
    console.log('🔍 Checking for admin user...');

    const adminEmail = 'admin@farcom.local';
    const adminPassword = 'Farcom2026';
    const adminName = 'Admin Farcom';

    // Check if admin user exists
    let adminUser = await UserModel.findOne({ email: adminEmail });

    if (adminUser) {
      console.log('✅ Admin user already exists:', adminEmail);
      
      // Update role to admin if not already
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('🔄 Updated admin role to admin');
      } else {
        console.log('ℹ️  Admin role is already set to admin');
      }
    } else {
      console.log('👤 Creating new admin user...');
      
      adminUser = new UserModel({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin',
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('👤 Name:', adminName);
      console.log('🎭 Role: admin');
    }

    console.log('\n✨ Admin seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
