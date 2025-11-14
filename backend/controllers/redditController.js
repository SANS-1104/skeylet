// backend/controllers/redditController.js
import axios from "axios";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { refreshRedditToken, postToSubreddit, getSubredditFlairs } from "../utils/postToReddit.js";


/* -------------------------------------------------------
   📝 Create Reddit draft (multi-platform version)
-------------------------------------------------------- */
export const createRedditDraft = async (req, res) => {
  try {
    const { title, content, subreddit, redditFlairId, url, viralityScore } = req.body;

    if (!title || !content || !subreddit) {
      return res.status(400).json({ error: "Title, content, and subreddit are required" });
    }

    const post = await Post.create({
      user: req.user._id,
      title,
      content,
      viralityScore: Number(viralityScore) || 0,
      image: req.body.image || null,
      platforms: {
        reddit: {
          status: "draft",
          extra: {
            subreddit,
            flairId: redditFlairId || null,
            url: url || null,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("❌ Error creating Reddit draft:", err.message);
    res.status(500).json({ error: "Failed to create Reddit draft" });
  }
};

/* -------------------------------------------------------
   ⏰ Schedule Reddit post
-------------------------------------------------------- */
export const scheduleRedditPost = async (req, res) => {
  try {
    const { scheduledTime } = req.body;

    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.platforms.reddit = {
      ...post.platforms.reddit,
      status: "scheduled",
      scheduledTime,
    };

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    console.error("❌ Failed to schedule Reddit draft:", err.message);
    res.status(500).json({ error: "Failed to schedule Reddit draft" });
  }
};

/* -------------------------------------------------------
   🚀 Manual (Immediate) Reddit Post
-------------------------------------------------------- */
export const manualRedditPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findOne({ _id: postId, user: req.user._id });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const redditData = post.platforms.reddit?.extra;
    if (!redditData?.subreddit) return res.status(400).json({ error: "Missing subreddit info" });

    const user = await User.findById(req.user._id);
    if (!user?.redditAccessToken) return res.status(400).json({ error: "User not connected to Reddit" });

    const accessToken = (await refreshRedditToken(user)) || user.redditAccessToken;
    const redditUsername = user.redditUsername || "UnknownUser";

    const result = await postToSubreddit(
      accessToken,
      redditUsername,
      redditData.subreddit,
      post.title,
      post.content,
      redditData.url,
      redditData.flairId
    );

    post.platforms.reddit.status = "posted";
    post.platforms.reddit.postedAt = new Date();
    post.platforms.reddit.postId = result?.id || result?.name || null;
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    console.error("❌ Reddit post failed:", err.message);
    const post = await Post.findById(req.body.postId);
    if (post) {
      post.platforms.reddit.status = "failed";
      await post.save();
    }
    res.status(500).json({ error: "Failed to post to Reddit" });
  }
};

/* -------------------------------------------------------
   🔁 Move Reddit post back to draft
-------------------------------------------------------- */
export const moveRedditToDraft = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.platforms.reddit = {
      ...post.platforms.reddit,
      status: "draft",
      scheduledTime: null,
    };
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    console.error("❌ Failed to move Reddit post to draft:", err.message);
    res.status(500).json({ error: "Failed to move Reddit post to draft" });
  }
};

/* -------------------------------------------------------
   📜 Get user's subscribed subreddits
-------------------------------------------------------- */
export const getUserSubreddits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.redditAccessToken)
      return res.status(400).json({ error: "User not connected to Reddit" });

    const res2 = await axios.get(
      "https://oauth.reddit.com/subreddits/mine/subscriber",
      {
        headers: {
          Authorization: `Bearer ${user.redditAccessToken}`,
          "User-Agent": `AutoPost/1.0.0 by u/${user.redditUsername}`,
        },
        params: { limit: 100 },
      }
    );

    const subs = res2.data.data.children.map((c) => c.data.display_name);
    res.json({ success: true, subreddits: subs });
  } catch (err) {
    console.error("❌ Error fetching subreddits:", err.message);
    res.status(500).json({ error: "Failed to fetch subreddits" });
  }
};

/* -------------------------------------------------------
   🔎 Search Subreddits
-------------------------------------------------------- */
export const searchSubreddits = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing search query" });

  try {
    const response = await axios.get("https://www.reddit.com/subreddits/search.json", {
      params: { q, limit: 50 },
      headers: { "User-Agent": "AutoPost/1.0.0" },
    });

    const subreddits = response.data.data.children.map((c) => ({
      name: c.data.display_name,
      title: c.data.title,
    }));

    res.json({ success: true, subreddits });
  } catch (err) {
    console.error("❌ Error searching subreddits:", err.message);
    res.status(500).json({ error: "Failed to search subreddits" });
  }
};

/* -------------------------------------------------------
   🏷️ Fetch flairs
-------------------------------------------------------- */
export const fetchSubredditFlairs = async (req, res) => {
  const { subreddit } = req.query;
  if (!subreddit) return res.status(400).json({ error: "Missing subreddit" });

  try {
    const user = await User.findById(req.user._id);
    if (!user?.redditAccessToken)
      return res.status(400).json({ error: "User not connected to Reddit" });

    const flairs = await getSubredditFlairs(subreddit, user.redditAccessToken, user.redditUsername);
    res.json({ success: true, flairs });
  } catch (err) {
    console.error("❌ Error fetching subreddit flairs:", err.message);
    res.status(500).json({ error: "Failed to fetch flairs" });
  }
};
 