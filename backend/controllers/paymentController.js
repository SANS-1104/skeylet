// // backend/controllers/paymentController.js
// import Payment from "../models/Payment.js";

// // ✅ Get user payment status
// export const getPaymentStatus = async (req, res) => {
//   try {
//     const payment = await Payment.findOne({ user: req.user.id })
//       .sort({ createdAt: -1 }) // get latest payment
//       .populate("plan");

//     if (!payment) {
//       return res.json({ status: "none" });
//     }

//     // check expiry
//     if (payment.validUntil && payment.validUntil < new Date()) {
//       return res.json({ status: "none" });
//     }

//     res.json({
//       status: payment.status,
//       plan: payment.plan?.name,
//       validUntil: payment.validUntil,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching payment status:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };



// // backend/controllers/paymentController.js
// import Payment from "../models/Payment.js";

// export const getPaymentStatus = async (req, res) => {
//   try {
//     const payment = await Payment.findOne({ user: req.user.id })
//       .sort({ createdAt: -1 }) // get latest payment
//       .populate("plan");

//     if (!payment) {
//       return res.json({ status: "none" });
//     }

//     // check if expired
//     if (payment.validUntil && payment.validUntil < new Date()) {
//       return res.json({ status: "expired", plan: null });
//     }

//     res.json({
//       status: payment.status,
//       plan: payment.plan?.name || null,
//       validUntil: payment.validUntil,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching payment status:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


import User from "../models/User.js";

export const getPaymentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("subscriptionPlan");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      status: user.subscriptionStatus,         // active, none, expired, etc.
      plan: user.subscriptionPlan?.name || null,
      nextBillingDate: user.nextBillingDate,
    });
  } catch (err) {
    console.error("❌ Error fetching payment status:", err);
    res.status(500).json({ error: "Server error" });
  }
};
