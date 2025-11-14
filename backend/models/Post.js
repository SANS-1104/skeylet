// backend/models/Post.js
import mongoose from "mongoose";

const platformSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["draft", "scheduled", "posted", "failed"],
      default: "draft",
    },
    scheduledTime: { type: Date, default: null },
    postedAt: { type: Date, default: null },
    postId: { type: String, default: null }, // post URN or ID
    url: { type: String, default: null }, // final platform URL if available
    extra: {
      type: mongoose.Schema.Types.Mixed, // store custom platform-specific data
      default: {},
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Common post details
    title: { type: String, required: true },
    topic: { type: String, default: "General" },
    viralityScore: { type: Number, default: 0 },
    content: { type: String, required: true },
    image: String,

    // 🔹 Platforms object for LinkedIn, Reddit, Facebook, etc.
    // platforms: {
    //   linkedin: { type: platformSchema, default: {} },
    //   reddit: { type: platformSchema, default: {} },
    //   facebook: { type: platformSchema, default: {} },
    // },

    platforms: {
      linkedin: { type: platformSchema, default: () => ({}) },
      reddit: { type: platformSchema, default: () => ({}) },
      facebook: { type: platformSchema, default: () => ({}) },
    },

    // Analytics reference
    analytics: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analytics",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
