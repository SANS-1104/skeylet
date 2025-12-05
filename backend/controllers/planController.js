// backend/controllers/planController.js

// export const getPlans = async (req, res) => {
//   try {
//     const plans = await Plan.find({});
//     res.json(plans);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch plans" });
//   }
// };

// import Plan from "../models/Plan.js";
// import User from "../models/User.js";
// import Payment from "../models/Payment.js";

// export const subscribePlan = async (req, res) => {
//   try {
//     const { userId, planId, billingType, price, paymentStatus, razorpay_payment_id } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 1️⃣ Update user's subscription
//     user.subscriptionPlan = planId;
//     user.subscriptionStatus = paymentStatus === "success" ? "active" : "none";
//     user.billingType = billingType;
//     user.subscriptionPrice = price;
//     user.nextBillingDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

//     await user.save();

//     // 2️⃣ Create Payment record
//     const payment = new Payment({
//       user: userId,
//       plan: planId,
//       amount: price,
//       currency: "INR", // or USD
//       status: paymentStatus === "success" ? "active" : "pending",
//       method: "razorpay",
//       PaymentId: razorpay_payment_id || undefined,
//       validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//     });

//     await payment.save();

//     res.json({ success: true, message: "Subscription and payment saved successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to save subscription/payment" });
//   }
// };

// backend/controllers/planController.js

import Plan from "../models/Plan.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

// ---------------------- GET PLANS ----------------------
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};

// ---------------------- SUBSCRIBE PLAN (After Payment Success) ----------------------
// This is called AFTER VariantPay callback verifies payment.
export const subscribePlan = async (req, res) => {
  try {
    const { userId, planId, paymentStatus, paymentId, referenceId, amount } = req.body;
    console.log(req.body)

    if (!userId || !planId || !referenceId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Fetch user + plan
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // ---------------------- 1️⃣ Update User Subscription ----------------------
    const isSuccess = paymentStatus === "SUCCESS";

    user.subscriptionPlan = planId;
    user.subscriptionStatus = isSuccess ? "active" : "none";
    user.billingType = "yearly";
    user.subscriptionPrice = amount || plan.yearlyPriceNew;

    // Next billing date = 1 year
    user.nextBillingDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    );

    await user.save();

    // ---------------------- 2️⃣ Update/Create Payment Record ----------------------
    let payment = await Payment.findOne({ referenceId });

    if (!payment) {
      // If somehow not created earlier, create it now
      payment = new Payment({
        user: userId,
        plan: planId,
        amount: amount || plan.yearlyPriceNew,
        currency: "INR",
        method: "variantpay",
        referenceId,
      });
    }

    payment.status = isSuccess ? "active" : "failed";
    payment.PaymentId = paymentId || payment.PaymentId;
    payment.validUntil = user.nextBillingDate;
    payment.updatedAt = new Date();

    await payment.save();

    return res.json({
      success: true,
      message: "Subscription updated using VariantPay",
      subscriptionStatus: user.subscriptionStatus,
    });

  } catch (err) {
    console.error("SubscribePlan Error:", err);
    res.status(500).json({ message: "Failed to update subscription/payment" });
  }
};

