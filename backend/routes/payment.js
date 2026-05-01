// backend/routes/payment.js
import express from "express";
import { getPaymentStatus } from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/paymentStatus
router.get("/", authMiddleware, getPaymentStatus);
router.get("/key", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

export default router;
