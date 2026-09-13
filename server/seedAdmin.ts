import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv BEFORE any imports that need env variables
dotenv.config({
  path: path.resolve(__dirname, "server.env"),
});

import mongoose from "mongoose";
import { connectDB } from "./db.js";
import UserModel from "./models/User.js";

async function seedAdmin() {
  try {
    // Validate required environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME;

    if (!adminEmail || !adminPassword || !adminName) {
      console.error("❌ Missing required environment variables:");
      console.error("   ADMIN_EMAIL:", adminEmail ? "✓" : "✗");
      console.error("   ADMIN_PASSWORD:", adminPassword ? "✓" : "✗");
      console.error("   ADMIN_NAME:", adminName ? "✓" : "✗");
      console.error("\nPlease set these variables in server.env before running the seed script.");
      process.exit(1);
    }

    await connectDB();
    console.log("🔍 Checking for admin user...");

    let adminUser = await UserModel.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (adminUser) {
      console.log("✅ Admin user already exists:", adminEmail);

      if (adminUser.role !== "admin") {
        adminUser.role = "admin";
        await adminUser.save();
        console.log("🔄 Updated admin role to admin");
      } else {
        console.log("ℹ️ Admin role is already set to admin");
      }
    } else {
      console.log("👤 Creating new admin user...");

      adminUser = new UserModel({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: "admin",
      });

      await adminUser.save();

      console.log("✅ Admin user created successfully!");
      console.log("📧 Email:", adminEmail);
      console.log("👤 Name:", adminName);
      console.log("🎭 Role: admin");
    }

    console.log("✨ Admin seed completed successfully");
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();