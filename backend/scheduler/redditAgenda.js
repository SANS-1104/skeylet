import dotenv from "dotenv";
dotenv.config();

import Agenda from "agenda";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { refreshRedditToken, postToSubreddit } from "../utils/postToReddit.js";

const redditAgenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "redditJobs" },
});

// ✅ Define Reddit job
export const defineRedditAgendaJobs = () => {
  redditAgenda.define("reddit:postScheduled", async (job) => {
    const { postId } = job.attrs.data;
    console.log(`⏰ [Reddit] Job triggered for postId: ${postId}`);

    const post = await Post.findById(postId);
    if (!post) return console.log("❌ Post not found");

    const redditData = post.platforms?.reddit;
    if (!redditData || redditData.status !== "scheduled") {
      return console.log("⚠️ Reddit post not in scheduled state, skipping.");
    }

    const user = await User.findById(post.user);
    if (!user) return console.log("❌ User not found for Reddit post.");

    try {
      const token = (await refreshRedditToken(user)) || user.redditAccessToken;
      const username = user.redditUsername || "UnknownUser";
      const { subreddit, flairId, url } = redditData.extra || {};

      if (!subreddit) {
        throw new Error("Missing subreddit for scheduled Reddit post.");
      }

      const res = await postToSubreddit(
        token,
        username,
        subreddit,
        post.title,
        post.content,
        url,
        flairId
      );

      // ===== 📌 QUOTA CHECK: Reddit Scheduled Post =====
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
        console.log("❌ Quota exceeded. Marking Reddit post as failed.");
        post.platforms.reddit.status = "failed_quota";
        await post.save();
        await user.save();
        return;
      }

      user.usageCount += 1;
      await user.save();
      // ===== END QUOTA CHECK =====


      post.platforms.reddit.status = "posted";
      post.platforms.reddit.postedAt = new Date();
      post.platforms.reddit.postUrl = res?.url || null;
      await post.save();

      console.log(`✅ Reddit post "${post.title}" posted successfully.`);
    } catch (err) {
      console.error("❌ Reddit scheduled post failed:", err.message);
      post.platforms.reddit.status = "failed";
      await post.save();
    }
  });
};

// ✅ Start Reddit Agenda
export const startRedditAgenda = async () => {
  defineRedditAgendaJobs();
  await redditAgenda.start();
  console.log("🚀 Reddit Agenda started");
};

export default redditAgenda;
