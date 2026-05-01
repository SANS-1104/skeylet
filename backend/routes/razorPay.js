// // backend/routes/razorPay.js

// import express from "express";
// import Razorpay from "razorpay";
// import crypto from "crypto";

// const router = express.Router(); 

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // 1️⃣ Create Order
// router.post("/create-order", async (req, res) => {
//   try {
//     const { amount } = req.body; // amount in INR
//     const options = {
//       amount: amount * 100, // amount in paise
//       currency: "INR",
//       receipt: `receipt_order_${Math.random()}`,
//     };
//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error creating Razorpay order" });
//   }
// });

// // 2️⃣ Verify Payment
// router.post("/verify-payment", async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature === expectedSign) {
//       res.json({ success: true, message: "Payment verified successfully" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid signature" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error verifying payment" });
//   }
// });

// export default router;


// backend/routes/razorPay.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,       // from Razorpay dashboard (test mode)
  key_secret: process.env.RAZORPAY_KEY_SECRET, // from Razorpay dashboard (test mode)
});

// 1️⃣ Create Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR
    const options = {
      amount: Math.round(amount * 100), // Convert rupees to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Order created:", order);
    res.json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Error creating Razorpay order" });
  }
});

// 2️⃣ Verify Payment
router.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log("Verify payment body:", req.body);

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (razorpay_signature === expectedSignature) {
      console.log("Payment verified successfully!");
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      console.warn("Invalid signature!");
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Error verifying payment" });
  }
});

export default router;
