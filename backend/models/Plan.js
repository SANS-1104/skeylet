// backend/models/Plan.js
import { Schema, model } from "mongoose";

const PlanSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["pro"],
      required: true,
      unique: true,
    },
    monthlyQuota: { type: Number, required: true },
    yearlyPriceOld: { type: Number, default: 200 }, 
    yearlyPriceNew: { type: Number, default: 49 }, 
    features: [{ type: String }], // optional, store feature list
  },
  { timestamps: true }
);

export default model("Plan", PlanSchema);
