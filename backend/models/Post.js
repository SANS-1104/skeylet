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
    postId: { type: String, default: null }, 
    url: { type: String, default: null }, 
    extra: {
      type: mongoose.Schema.Types.Mixed, 
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

    platforms: {
      linkedin: { type: platformSchema, default: () => ({}) },
      reddit: { type: platformSchema, default: () => ({}) },
      facebook: { type: platformSchema, default: () => ({}) },
      instagram: { type: platformSchema, default: () => ({}) },
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
