// Run this file initially to create an admin user in production, Because i have not added a registration route for admin users i was not able to figure that out.

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@company.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "sample123";

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      // console.log("Admin user already exists. Skipping creation.");
      // console.log(`Email: ${adminEmail}`);
      process.exit(0);
    }

    // Create admin user
    await User.create({
      name: "System Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    // console.log("Production admin created successfully!");
    // console.log("---");
    // console.log(`Email: ${adminEmail}`);
    // console.log("IMPORTANT: Change this password after first login!");
    // console.log("---");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
