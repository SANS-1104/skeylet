// backend/routes/facebookRoutes.js

import express from "express";
import { facebookAuth, facebookCallback, disconnectFacebook, getFacebookPages, updateFacebookPreferences } from "../controllers/facebookAuthController.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/auth", facebookAuth);
router.get("/callback", facebookCallback);
router.post("/disconnect", authenticateUser, disconnectFacebook);
router.put("/preferences",authenticateUser, updateFacebookPreferences)

// ✅ New route to get saved pages
router.get("/pages", authenticateUser, getFacebookPages);

export default router;
