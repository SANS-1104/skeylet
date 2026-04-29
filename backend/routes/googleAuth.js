// backend/routes/googleAuth.js

import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Step 1: Start Google login
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2: Google callback
router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      // Debug: Check secrets
    //   console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ set" : "❌ missing");
    //   console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET ? "✅ set" : "❌ missing");

      // Make sure we have a user
      const user = req.user;
    //   console.log("✅ Passport returned user:", user);

      if (!user) {
        return res.redirect("https://markvance.in/auth?error=NoUser");
      }

      // ✅ Create tokens exactly like /login route
      const accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "6h" }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // console.log("Generated tokens:", { accessToken, refreshToken });

      const name = encodeURIComponent(user.name || "user");

      // 🔍 Log the final redirect URL for debugging
      const redirectUrl = `https://markvance.in/login-success?accessToken=${encodeURIComponent(
        accessToken
      )}&refreshToken=${encodeURIComponent(refreshToken)}&name=${name}`;

    //   console.log("🔍 Redirecting to frontend with:", redirectUrl);

      // ✅ Redirect to frontend with tokens
      res.redirect(redirectUrl);

    } catch (err) {
      console.error("Google login error:", err);
      res.redirect("https://markvance.in/auth?error=ServerError");
    }
  }
);

export default router;
