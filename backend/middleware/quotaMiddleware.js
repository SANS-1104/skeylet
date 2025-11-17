// backend/middleware/quotaMiddleware.js
import User from "../models/User.js";

export const checkQuota = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("subscriptionPlan");

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Require active subscription
    if (user.subscriptionStatus !== "active") {
      return res.status(403).json({
        msg: "Your subscription is inactive. Upgrade to continue posting."
      });
    }

    // Monthly reset
    const now = new Date();
    const last = user.lastQuotaReset || new Date(2000, 0, 1);

    const resetNeeded =
      last.getMonth() !== now.getMonth() ||
      last.getFullYear() !== now.getFullYear();

    if (resetNeeded) {
      user.usageCount = 0;
      user.lastQuotaReset = now;
      await user.save();
    }

    const quota = user.monthlyQuota || 5; // fallback for safety

    if (user.usageCount >= quota) {
      return res.status(403).json({
        msg: `You reached your ${quota} monthly post limit.`
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Quota error:", err);
    res.status(500).json({ msg: "Quota check failed" });
  }
};
