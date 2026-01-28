// file: backend/index.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db.js";
import User from "./models/User.js"; 

// 🧩 Import Agenda schedulers
import {startAgendas } from "./scheduler/agenda.js"; // LinkedIn
import  {startRedditAgenda } from "./scheduler/redditAgenda.js"; // Reddit
import { startFacebookAgenda } from "./scheduler/facebookAgenda.js"; // Facebook


// 🛣️ Import routes
import authRoutes from "./routes/auth.js"; 
import postRoutes from "./routes/post.js";
import scheduleRoutes from "./routes/post.js";
import analyticsRoutes from "./routes/post.js";
import planRoutes from "./routes/plan.js";
import paymentRoutes from "./routes/payment.js";
import adminRoutes from "./routes/studioAdmin.js";
import adminAuthRoutes from "./routes/adminAuth.js";
import razorpayRoutes from "./routes/razorPay.js";
import redditRoutes from "./routes/redditRoutes.js";
import unifiedRoutes from "./routes/unifiedPost.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import facebookRoutes from "./routes/facebookRoutes.js";

import variantPayRoutes from "./routes/variantPay.js";

const app = express();


// -------------------- PASSPORT CONFIG --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            profileImage: profile.photos[0].value,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
// ----------------------------------------------------------


// -------------------- MIDDLEWARE --------------------
app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ extended: true, limit: "40mb" }));
app.use(cors({
  origin: ["http://localhost:3000", "https://www.skeylet.com","https://localhost:3000"], // 🔹 live frontend
  credentials: true,
}));
// ----------------------------------------------------------


// -------------------- ROUTES --------------------

// -------------------- ROOT ROUTE --------------------
app.get("/", (req, res) => {
  res.send("✅ Skeylet backend API running");
});
// ----------------------------------------------------

app.use("/auth/google", googleAuthRoutes);
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api/blog", postRoutes);
app.use("/api/linkedin", authRoutes);
app.use("/api/reddit", redditRoutes);
app.use("/api/facebook", facebookRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/paymentStatus", paymentRoutes);
app.use("/api/studioAdmin", adminRoutes);
// app.use("/api/payments", razorpayRoutes);
app.use("/api/payments", variantPayRoutes);
app.use("/api/unifiedPost", unifiedRoutes);
app.use("/api/admin", adminAuthRoutes);

// ----------------------------------------------------------

// -------------------- SERVER STARTUP --------------------
const PORT = process.env.PORT || 5001;

connectDB()
  .then(async () => {
    // Start LinkedIn Agenda
    await startAgendas();

    // Start Reddit Agenda
    await startRedditAgenda();

    await startFacebookAgenda();

    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB or server failed:", err.message));