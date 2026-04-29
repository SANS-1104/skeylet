// backend/controllers/postController.js
import User from "../models/User.js";
import Post from "../models/Post.js";
import { postToLinkedIn } from "../utils/postToLinkedIn.js";
import { postToFacebook } from "../utils/postToFacebook.js";
import { postToSubreddit, refreshRedditToken } from "../utils/postToReddit.js";
import redditAgenda from "../scheduler/redditAgenda.js";
import agenda from "../scheduler/agenda.js";
import facebookAgenda from "../scheduler/facebookAgenda.js";


export const createPost = async (req, res) => {
  try {
    const {
      postId,
      title,
      content,
      image,
      topic,
      viralityScore,
      platform, // optional, for backward compatibility
      status,
      scheduledTime,
      extra,
      platforms, // ✅ new multi-platform support
    } = req.body;

    // at least one platform must exist
    if (!platform && !platforms) {
      return res.status(400).json({ error: "Platform is required" });
    }

    let post = postId
      ? await Post.findOne({ _id: postId, user: req.user.id })
      : null;

    if (postId && !post)
      return res.status(404).json({ error: "Post not found" });

    // ✅ Shared post details
    const commonFields = {
      title,
      content,
      topic: topic || "General",
      image,
      viralityScore: Number(viralityScore) || 50,
    };

    if (post) Object.assign(post, commonFields);
    else post = new Post({ user: req.user.id, ...commonFields, platforms: {} });

    // ✅ Handle either multiple or single platforms
    if (platforms && typeof platforms === "object") {
      for (const [plat, data] of Object.entries(platforms)) {
        post.platforms[plat] = {
          ...(post.platforms?.[plat] || {}),
          status: data.status || "draft",
          scheduledTime: data.scheduledTime || null,
          postedAt: data.postedAt || null,
          extra: { ...(post.platforms?.[plat]?.extra || {}), ...(data.extra || {}) },
        };
      }
    } else if (platform) {
      // fallback for old format
      let extraData = {};

      if (platform === "reddit") {
        extraData = {
          subreddit: extra?.subreddit || "",
          flairId: extra?.flairId || "",
          url: extra?.url || "",
        };
      } else if (extra) {
        extraData = extra;
      }

      post.platforms[platform] = {
        ...(post.platforms?.[platform] || {}),
        status: status || post.platforms?.[platform]?.status || "draft",
        scheduledTime: scheduledTime || post.platforms?.[platform]?.scheduledTime || null,
        postedAt: post.platforms?.[platform]?.postedAt || null,
        extra: { ...post.platforms?.[platform]?.extra, ...extraData },
      };
    }

    await post.save();

    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error("❌ Error creating/updating post:", err.message);
    res.status(500).json({ error: "Failed to create/update post" });
  }
};

export const manualPost = async (req, res) => {
  try {
    const { postId, platform } = req.body;
    if (!platform) return res.status(400).json({ error: "Platform is required" });

    const post = await Post.findOne({ _id: postId, user: req.user.id });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    /* -----------------------------------------
     🔹 A) RESET QUOTA automatically on new month 
    ------------------------------------------ */
    const now = new Date();
    const lastReset = user.lastQuotaReset || new Date();

    const isNewMonth =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
      user.usageCount = 0;
      user.lastQuotaReset = now;
      await user.save();
    }

    /* -----------------------------------------
     🔹 B) CHECK QUOTA before posting
    ------------------------------------------ */
    const quota = user.monthlyQuota || 0;
    const used = user.usageCount || 0;

    if (used >= quota) {
      return res.status(403).json({
        error: "Your monthly quota is exhausted. Upgrade your plan to continue posting.",
        remaining: 0,
      });
    }

    let result = {};

    /* -----------------------------------------
     🔹 POST TO LINKED PLATFORM
    ------------------------------------------ */
    const TAGLINE = "~ Powered by Markvance";
    const tags = "#markvance"

    // const finalTitle = `${post.title}\n${TAGLINE}\n`;
    const finalTitle = `${TAGLINE}\n`;
    const finalContent = `${post.content} ${tags}`

    // ---------- LinkedIn ----------
    if (platform === "linkedin") {
      if (!user.linkedinAccessToken || !user.linkedinPersonURN) {
        return res.status(400).json({ error: "LinkedIn not connected" });
      }

      result = await postToLinkedIn(user, {
        title: finalTitle,
        content: finalContent,
        image: post.image,
      });
    }

    // ---------- Reddit ----------
    if (platform === "reddit") {
      if (!user.redditAccessToken) {
        return res.status(400).json({ error: "Reddit not connected" });
      }

      const accessToken = (await refreshRedditToken(user)) || user.redditAccessToken;
      const redditUsername = user.redditUsername || "UnknownUser";
      const redditData = post.platforms.reddit?.extra;

      if (!redditData?.subreddit) {
        return res.status(400).json({ error: "Missing subreddit info" });
      }

      result = await postToSubreddit(
        accessToken,
        redditUsername,
        redditData.subreddit,
        finalTitle,
        finalContent,
        redditData.url,
        redditData.flairId
      );
    }

    // ---------- Facebook ----------
    if (platform === "facebook" || platform === "Facebook") {
      if (!user.facebookPages || user.facebookPages.length === 0) {
        return res.status(400).json({ error: "No Facebook Pages connected" });
      }

      const selectedPages = req.body.selectedPages || [];
      const pagesToPost = user.facebookPages.filter((p) =>
        selectedPages.includes(p.pageId)
      );

      if (!pagesToPost.length)
        return res.status(400).json({ error: "No valid pages selected" });

      result = await postToFacebook(pagesToPost, {
        title: finalTitle,
        content: finalContent,
        image: post.image,
      });
    }
    

    /* -----------------------------------------
     🔹 UPDATE POST STATUS
    ------------------------------------------ */
    post.platforms[platform] = {
      ...post.platforms[platform],
      status: "posted",
      postedAt: new Date(),
      postId: result?.id || result?.postId || null,
      url: result?.url || null,
    };
    await post.save();

    /* -----------------------------------------
     🔹 C) INCREASE USAGE COUNT ONLY AFTER SUCCESS
    ------------------------------------------ */
    user.usageCount += 1;
    await user.save();

    res.json({ success: true, platform, result });

  } catch (err) {
    console.error("❌ Manual post failed:", err.message);

    // Set platform status = failed
    const { postId, platform } = req.body;
    const post = await Post.findById(postId);
    if (post && platform) {
      post.platforms[platform].status = "failed";
      await post.save();
    }

    res.status(500).json({ error: `Failed to post on ${platform}` });
  }
};

export const schedulePost = async (req, res) => {
  try {
    const { postId, platform, scheduledTime, selectedPages } = req.body; // added selectedPages for FB
    if (!postId || !platform || !scheduledTime) {
      return res
        .status(400)
        .json({ error: "postId, platform, and scheduledTime are required" });
    }

    const post = await Post.findOne({ _id: postId, user: req.user.id });
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Update post status
    post.platforms[platform] = {
      ...post.platforms[platform],
      status: "scheduled",
      scheduledTime: new Date(scheduledTime),
      ...(selectedPages ? { selectedPages } : {}), // save selected pages for FB
    };
    await post.save();

    // Schedule Agenda job per platform
    const time = new Date(scheduledTime);

    if (platform === "linkedin") {
      await agenda.schedule(time, "linkedin:postScheduled", { postId: post._id });
    } else if (platform === "reddit") {
      await redditAgenda.schedule(time, "reddit:postScheduled", { postId: post._id });
    } else if (platform === "facebook") {
      await facebookAgenda.schedule(time, "facebook:postScheduled", {
        postId: post._id,
        selectedPages: selectedPages || [],
      });
    }

    res.json({
      success: true,
      message: `Scheduled ${platform} post successfully`,
      post,
    });
  } catch (err) {
    console.error("❌ Scheduling failed:", err);
    res.status(500).json({ error: "Failed to schedule post" });
  }
};

export const cancelScheduledPost = async (req, res) => {
  try {
    const { postId, platform } = req.params;

    const post = await Post.findOne({ _id: postId, user: req.user.id });
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!platform || !post.platforms[platform]) {
      return res.status(400).json({ error: "Invalid or missing platform" });
    }

    // Reset platform status
    post.platforms[platform].status = "draft";
    post.platforms[platform].scheduledTime = null;
    await post.save();

    // Cancel scheduled Agenda job
    const cancelQuery = { "data.postId": post._id };

    if (platform === "linkedin") {
      await agenda.cancel({ name: "linkedin:postScheduled", ...cancelQuery });
    } else if (platform === "reddit") {
      await redditAgenda.cancel({ name: "reddit:postScheduled", ...cancelQuery });
    } else if (platform === "facebook") {
      await agenda.cancel({ name: "facebook:postScheduled", ...cancelQuery });
    }

    res.json({
      success: true,
      message: `Cancelled ${platform} schedule and moved to drafts`,
      post,
    });
  } catch (err) {
    console.error("❌ Cancel schedule failed:", err);
    res.status(500).json({ error: "Failed to cancel scheduled post" });
  }
};

export const reschedulePost = async (req, res) => {
  try {
    const { postId, platform, newScheduledTime, selectedPages } = req.body;
    if (!postId || !platform || !newScheduledTime) {
      return res
        .status(400)
        .json({ error: "postId, platform, and newScheduledTime are required" });
    }

    const post = await Post.findOne({ _id: postId, user: req.user.id });
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Cancel previous job
    const cancelQuery = { "data.postId": post._id };
    if (platform === "linkedin") {
      await agenda.cancel({ name: "linkedin:postScheduled", ...cancelQuery });
    } else if (platform === "reddit") {
      await redditAgenda.cancel({ name: "reddit:postScheduled", ...cancelQuery });
    } else if (platform === "facebook") {
      await agenda.cancel({ name: "facebook:postScheduled", ...cancelQuery });
    }

    // Update post info
    post.platforms[platform] = {
      ...post.platforms[platform],
      status: "scheduled",
      scheduledTime: new Date(newScheduledTime),
      ...(selectedPages ? { selectedPages } : {}),
    };
    await post.save();

    // Schedule new job
    const time = new Date(newScheduledTime);
    if (platform === "linkedin") {
      await agenda.schedule(time, "linkedin:postScheduled", { postId: post._id });
    } else if (platform === "reddit") {
      await redditAgenda.schedule(time, "reddit:postScheduled", { postId: post._id });
    } else if (platform === "facebook") {
      await agenda.schedule(time, "facebook:postScheduled", {
        postId: post._id,
        selectedPages: selectedPages || [],
      });
    }

    res.json({ success: true, message: `${platform} post rescheduled`, post });
  } catch (err) {
    console.error("❌ Reschedule failed:", err);
    res.status(500).json({ error: "Failed to reschedule post" });
  }
};

export const getScheduledPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id });

    // Include any post where at least one platform is draft or scheduled
    const filtered = posts.filter(post =>
      Object.values(post.platforms || {}).some(
        p => p.status === "draft" || p.status === "scheduled"
      )
    );

    res.json({ success: true, posts: filtered });
  } catch (err) {
    console.error("❌ Failed to fetch scheduled posts:", err);
    res.status(500).json({ error: "Failed to fetch scheduled posts" });
  }
};
