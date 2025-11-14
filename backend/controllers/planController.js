// // backend/controllers/planController.js
// import Plan from "../models/Plan.js";
// import User from "../models/User.js";

// @desc    Get all plans
// @route   GET /api/plans
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};

// // @desc    Save user's subscription after payment
// // @route   POST /api/plans/subscribe
// export const subscribePlan = async (req, res) => {
//   try {
//     const { userId, planId, billingType, price, paymentStatus } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Update fields according to your model
//     user.subscriptionPlan = planId;
//     user.subscriptionStatus = "active";

//     // Optional: store billing type and price in user object if needed
//     user.billingType = billingType;
//     user.subscriptionPrice = price;

//     // Save will trigger your pre-save hook
//     await user.save();

//     res.json({ success: true, message: "Subscription saved successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to save subscription" });
//   }
// };



import Plan from "../models/Plan.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

// @desc    Save user's subscription after payment
// @route   POST /api/plans/subscribe
export const subscribePlan = async (req, res) => {
  try {
    const { userId, planId, billingType, price, paymentStatus, razorpay_payment_id } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1️⃣ Update user's subscription
    user.subscriptionPlan = planId;
    user.subscriptionStatus = paymentStatus === "success" ? "active" : "none";
    user.billingType = billingType;
    user.subscriptionPrice = price;
    user.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // next month

    await user.save();

    // 2️⃣ Create Payment record
    const payment = new Payment({
      user: userId,
      plan: planId,
      amount: price,
      currency: "INR", // or USD
      status: paymentStatus === "success" ? "active" : "pending",
      method: "razorpay",
      PaymentId: razorpay_payment_id || undefined,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await payment.save();

    res.json({ success: true, message: "Subscription and payment saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save subscription/payment" });
  }
};
