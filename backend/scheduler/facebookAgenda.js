// backend/scheduler/facebookAgenda.js

import dotenv from "dotenv";
dotenv.config();

import Agenda from "agenda";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { postToFacebook } from "../utils/postToFacebook.js";

// 🔹 Initialize Agenda for Facebook
const facebookAgenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "facebookJobs" },
});

// ✅ Define Facebook job
export const defineFacebookAgendaJobs = () => {
  facebookAgenda.define("facebook:postScheduled", async (job) => {
    const { postId, selectedPages = [] } = job.attrs.data;
    console.log(`⏰ [Facebook] Job triggered for postId: ${postId}`);

    try {
      const post = await Post.findById(postId);
      if (!post) return console.log("❌ [Facebook] Post not found");

      const facebookData = post.platforms?.facebook;
      if (!facebookData || facebookData.status !== "scheduled") {
        return console.log("⚠️ [Facebook] Post not in scheduled state, skipping.");
      }

      const user = await User.findById(post.user);
      if (!user) return console.log("❌ [Facebook] User not found for post");

      if (!user.facebookPages || user.facebookPages.length === 0) {
        return console.log("⚠️ [Facebook] No Facebook pages connected for user");
      }

      const pagesToPost =
        selectedPages.length > 0
          ? user.facebookPages.filter((p) => selectedPages.includes(p.pageId))
          : user.facebookPages;

      if (!pagesToPost.length) {
        return console.log("⚠️ [Facebook] No valid pages selected for posting");
      }

      console.log(`📤 [Facebook] Posting to ${pagesToPost.length} page(s)...`);

      // Post to selected pages
      const result = await postToFacebook(pagesToPost, {
        title: post.title,
        content: post.content,
        image: post.image,
      });

      // ✅ Update post status after posting
      post.platforms.facebook.status = "posted";
      post.platforms.facebook.postedAt = new Date();
      post.platforms.facebook.results = result;
      await post.save();

      console.log("✅ [Facebook] Scheduled post completed successfully");

      // ===== 📌 QUOTA CHECK: Facebook Scheduled Post =====
      const now = new Date();
      const last = user.lastQuotaReset || new Date(2000, 0, 1);

      const resetNeeded =
        last.getMonth() !== now.getMonth() ||
        last.getFullYear() !== now.getFullYear();

      if (resetNeeded) {
        user.usageCount = 0;
        user.lastQuotaReset = now;
      }

      if (user.usageCount >= user.monthlyQuota) {
        console.log("❌ Quota exceeded. Marking Facebook post as failed.");
        post.platforms.facebook.status = "failed_quota";
        await post.save();
        await user.save();
        return;
      }

      user.usageCount += 1;
      await user.save();
      // ===== END QUOTA CHECK =====

    } catch (error) {
      console.error("❌ [Facebook] Scheduled post failed:", error.message);
      const post = await Post.findById(job.attrs.data.postId);
      if (post) {
        post.platforms.facebook.status = "failed";
        await post.save();
      }
    }
  });
};

// ✅ Start Facebook Agenda
export const startFacebookAgenda = async () => {
  defineFacebookAgendaJobs();
  await facebookAgenda.start();
  console.log("🚀 Facebook Agenda started");
};

export default facebookAgenda;
