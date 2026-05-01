import dotenv from "dotenv";
dotenv.config();

import Agenda from "agenda";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { postToLinkedIn } from "../utils/postToLinkedIn.js";

const agenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "scheduledJobs" },
});

// ✅ Define LinkedIn job
const defineLinkedInJob = () => {
  agenda.define("linkedin:postScheduled", async (job) => {
    const { postId } = job.attrs.data;
    console.log(`⏰ LinkedIn job triggered for postId: ${postId}`);

    const post = await Post.findById(postId);
    if (!post) return console.log("❌ Post not found for LinkedIn job");

    const platformData = post.platforms?.linkedin;
    if (!platformData || platformData.status !== "scheduled") {
      return console.log("⚠️ LinkedIn job skipped — not scheduled or already posted");
    }

    const user = await User.findById(post.user);
    if (!user?.linkedinAccessToken || !user?.linkedinPersonURN) {
      console.log("❌ LinkedIn not connected for user");
      return;
    }

    try {
      const result = await postToLinkedIn(user, {
        title: post.title,
        content: post.content,
        image: post.image,
      });

      // 🟦 Quota logic
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
        console.log("❌ Quota exceeded. Marking LinkedIn post as failed.");
        post.platforms.linkedin.status = "failed_quota";
        await post.save();
        await user.save();
        return;
      }

      // increment usage
      user.usageCount += 1;
      await user.save();
      // ===== END QUOTA CHECK =====

      post.platforms.linkedin.status = "posted";
      post.platforms.linkedin.postedAt = new Date();
      post.platforms.linkedin.postId = result?.postId || null;
      post.platforms.linkedin.url = result?.url || null;

      await post.save();
      console.log(`✅ LinkedIn post "${post.title}" posted successfully.`);
    } catch (err) {
      console.error("❌ LinkedIn scheduled post failed:", err.message);
      post.platforms.linkedin.status = "failed";
      await post.save();
    }
  });
};

// ✅ Export functions
export const defineAgendaJobs = () => defineLinkedInJob();

export const startAgendas = async () => {
  defineLinkedInJob();
  await agenda.start();
  console.log("🚀 LinkedIn Agenda started");
};

export default agenda;
