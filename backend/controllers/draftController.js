// ✅ controllers/draftController.js
import Post from "../models/Post.js";
import User from "../models/User.js";

// ------------------ Get all unscheduled drafts ------------------
export const getDrafts = async (req, res) => {
  try {
    const drafts = await Post.find({
      user: req.user.id,
      $or: [
        { "platforms.linkedin.status": "draft" },
        { "platforms.linkedin.scheduledTime": null },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(drafts);
  } catch (err) {
    console.error("Error fetching drafts:", err);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
};


// ------------------ Create a new draft ------------------
export const createDraft = async (req, res) => {
  try {
     const { title, content, image, topic, viralityScore } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

    const user = await User.findById(req.user.id);
    // ---- SaaS subscription check ----
    // if (user.subscriptionStatus !== "active") {
    //   return res.status(403).json({ error: "Subscription inactive. Please renew your plan." });
    // }
    // if (user.usageCount >= user.monthlyQuota) {
    //   return res.status(403).json({ error: "Monthly quota exceeded. Upgrade your plan to continue posting." });
    // }

    const draft = await Post.create({
      user: req.user.id,
      title,
      content,
      topic: topic || "General",
      image,
      viralityScore: Number(viralityScore) || 0,
      platforms: {
        linkedin: {
          status: "draft",
          scheduledTime: null,
          postedAt: null,
          postId: null,
          url: null,
          extra: {},
        },
      },
    });

    user.usageCount += 1;
    await user.save();

    res.status(201).json(draft);
  } catch (err) {
    console.error("Error creating draft:", err);
    res.status(500).json({ error: "Failed to create draft" });
  }
};

// ------------------ Schedule a draft ------------------
export const scheduleDraft = async (req, res) => {
  try {
    const { scheduledTime } = req.body;

    const draft = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        "platforms.linkedin.scheduledTime": new Date(scheduledTime),
        "platforms.linkedin.status": "scheduled",
      },
      { new: true }
    );

    if (!draft) return res.status(404).json({ error: "Draft not found" });

    res.status(200).json(draft);
  } catch (err) {
    console.error("Failed to schedule draft:", err);
    res.status(500).json({ error: "Failed to schedule draft" });
  }
};

// ------------------ Move scheduled post back to draft ------------------
export const moveToDraft = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        "platforms.linkedin.status": "draft",
        "platforms.linkedin.scheduledTime": null,
      },
      { new: true }
    );

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.status(200).json({ message: "Post moved to draft", post });
  } catch (err) {
    console.error("Failed to move post to draft:", err);
    res.status(500).json({ error: "Failed to move post to draft" });
  }
};
