// routes/instagram.routes.js
import express from "express";
import authenticateUser  from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/status", authenticateUser, async (req, res) => {
  const user = req.user;

  const instagramPages = (user.facebookPages || []).filter(
    (p) => p.instagram?.connected
  );

  res.json({
    connected: instagramPages.length > 0,
    pages: instagramPages.map((p) => ({
      pageId: p.pageId,
      pageName: p.pageName,
      igBusinessId: p.instagram.igBusinessId,
    })),
  });
});

export default router;

router.put("/preferences", authenticateUser, async (req, res) => {
  const { autoPostInstagram } = req.body;

  if (typeof autoPostInstagram !== "boolean") {
    return res.status(400).json({ error: "Invalid value" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { autoPostInstagram },
    { new: true }
  ).select("autoPostInstagram");

  res.json({
    success: true,
    autoPostInstagram: user.autoPostInstagram,
  });
});


router.post("/validate", authenticateUser, (req, res) => {
  const { caption, imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      valid: false,
      message: "Instagram requires an image",
    });
  }

  if (caption && caption.length > 2200) {
    return res.status(400).json({
      valid: false,
      message: "Caption exceeds 2200 characters",
    });
  }

  res.json({ valid: true });
});
