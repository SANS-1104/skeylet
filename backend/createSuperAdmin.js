import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  await User.create({
    name: "Super Admin",
    email: "superadmin@skeylet.com",
    password: "superad123",
    role: "superadmin",
  });

  console.log("✅ Superadmin created");
  console.log("Email: superadmin@skeylet.com");
  console.log("Password: superad123");

  process.exit(0);
}

run();
