// backend/models/User.js
import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import Plan from "./Plan.js";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email format"],
    },

    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    jobPost: { type: String, trim: true },

    password: { type: String },

    autoPostToLinkedIn: { type: Boolean, default: false },
    linkedinAccessToken: String,
    linkedinPersonURN: String,

    redditAccessToken: { type: String },
    redditRefreshToken: { type: String },
    redditUsername: { type: String },
    autoPostReddit: { type: Boolean, default: false },

    // Facebook Integration Fields
    facebookPages: [
      {
        pageId: { type: String },
        pageName: { type: String },
        accessToken: { type: String },
      },
    ],
    autoPostFacebook: { type: Boolean, default: false },
    facebookRefreshToken: { type: String },
    facebookUserAccessToken: { type: String },

    // Instagram Integration Fields
    instagramBusinessAccountId: { type: String },
    instagramAccessToken: { type: String },
    autoPostInstagram: { type: Boolean, default: false },


    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: false, 
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "expired", "canceled"], 
      default: "none",
    },
    nextBillingDate: { type: Date },
    stripeSubscriptionId: { type: String },
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    monthlyQuota: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    lastQuotaReset: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("subscriptionPlan")) {
    if (!this.subscriptionPlan) {
      // ✅ No plan selected = no subscription
      this.subscriptionStatus = "none";
      this.monthlyQuota = 0;
      this.usageCount = 0;
      this.nextBillingDate = null;
    } else {
      // ✅ If plan exists, apply it
      const plan = await Plan.findById(this.subscriptionPlan);
      if (plan) {
        this.monthlyQuota = plan.monthlyQuota;
        this.usageCount = 0;
        this.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // next month
        this.subscriptionStatus = "active";
      }
    }
  }

  next();
});

export default model("User", UserSchema);
