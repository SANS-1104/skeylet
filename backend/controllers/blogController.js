// file: controllers/blogController.js
import axios from "axios";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { postToLinkedIn } from "../utils/postToLinkedIn.js";

// ------------------ Topic Suggestion using Gemini ------------------
export async function getTopicSuggestions(req, res) {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(400).json({ suggestions: [] });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Suggest 5 short LinkedIn blog topics related to: "${q}". Respond with a plain comma-separated list only.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().trim();
    const suggestions = text.split(",").map((s) => s.trim()).filter(Boolean);

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Gemini topic suggestion error:", error.message);
    res.status(500).json({ message: "Gemini topic suggestion failed" });
  }
}

// // ------------------ Generate Blog ------------------
// export async function generateBlog(req, res) {
//   try {
//     const { topic, wordCount, language = "english", tone = "professional", viralityScore = 50, status: payloadStatus } = req.body;
//     const user = await User.findById(req.user.id);

//     // ---- SaaS subscription check ----
//     // if (user.subscriptionStatus !== "active") {
//     //   return res.status(403).json({ error: "Subscription inactive. Please renew your plan." });
//     // }
//     // if (user.usageCount >= user.monthlyQuota) {
//     //   return res.status(403).json({ error: "Monthly quota exceeded. Upgrade your plan to continue posting." });
//     // }

//     // ---- Generate content ----
//     const payload = topic ? { topic, wordCount, language, tone, viralityScore } : { language, tone, viralityScore };
//     const response = await axios.post("https://lavi0105.app.n8n.cloud/webhook/generatePost", payload);
//     const blogData = response.data;

//     const title = blogData.video_title || blogData.title || topic || "Generated Blog";
//     const content = blogData.script || blogData.generated_text || "";
//     let imageUrl = blogData.image || blogData.picture || req.body.image || null;

//     // ---- Auto-post if enabled ----
//     let linkedInPosted = false;
//     let linkedinPostId = null;
//     let linkedInUrl = null;

//     if (user.autoPostToLinkedIn && user.linkedinAccessToken && user.linkedinPersonURN && content.trim()) {
//       try {
//         const result = await postToLinkedIn(user, { title, content, image: imageUrl });
//         linkedinPostId = result.postId;
//         linkedInUrl = result.url || null;
//         linkedInPosted = true;
//       } catch (err) {
//         console.error("LinkedIn auto-post failed:", err.message);
//       }
//     }

//     // ---- Save post ----
//     const post = await Post.create({
//       user: user._id,
//       title,
//       content,
//       image: imageUrl,
//       viralityScore: Number(viralityScore),
//       platforms: {
//         linkedin: {
//           status: linkedInPosted ? "posted" : payloadStatus || "draft",
//           scheduledTime: null,
//           postedAt: linkedInPosted ? new Date() : null,
//           postId: linkedinPostId,
//           url: linkedInUrl,
//           extra: {},
//         }
//       }
//     });

//     // ---- Increment usage count ----
//     user.usageCount += 1;
//     await user.save();

//     res.json({ ...blogData, image: imageUrl, linkedInPosted });
//   } catch (err) {
//     console.error("Blog generation error:", err.response?.data || err.message);
//     res.status(500).json({ error: "Blog generation failed" });
//   }
// }

export async function generateBlog(req, res) {
  try {
    const {
      topic,
      wordCount,
      language = "english",
      tone = "professional",
      viralityScore = 50,
      linkedinAutoPost,
      redditAutoPost,
      facebookAutoPost,
      selectedSubreddit,
      selectedFlair,
      selectedFacebookPages,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ---------- Quota check ----------
    const now = new Date();
    const lastReset = user.lastQuotaReset || new Date();
    const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
    if (isNewMonth) {
      user.usageCount = 0;
      user.lastQuotaReset = now;
      await user.save();
    }
    if (user.usageCount >= user.monthlyQuota) {
      return res.status(403).json({ error: "You reached your monthly post limit." });
    }

    // ---------- Generate content ----------
    const payload = topic ? { topic, wordCount, language, tone, viralityScore } : { language, tone, viralityScore };
    const response = await axios.post("https://lavi0105.app.n8n.cloud/webhook/generatePost", payload);
    const blogData = response.data || {};

    const title = blogData.video_title || blogData.title || topic || "Generated Blog";
    const content = (blogData.script || blogData.generated_text || "").trim();
    const imageUrl = blogData.image || blogData.picture || req.body.image || null;

    // ---------- Prepare platforms object ----------
    const platforms = {
      linkedin: { status: "draft", postedAt: null, extra: {} },
      reddit: { status: "draft", postedAt: null, extra: { subreddit: selectedSubreddit, flairId: selectedFlair } },
      facebook: { status: "draft", postedAt: null, extra: { pages: selectedFacebookPages } },
    };

    // ---------- Auto-post logic ----------
    if (content) {
      // LinkedIn
      if (linkedinAutoPost) {
        if (user.linkedinAccessToken && user.linkedinPersonURN) {
          try {
            const result = await postToLinkedIn(user, { title, content, image: imageUrl });
            platforms.linkedin = {
              status: "posted",
              postedAt: new Date(),
              postId: result.postId,
              url: result.url,
              extra: {},
            };
          } catch (err) {
            console.error("LinkedIn auto-post failed:", err.message);
            platforms.linkedin.status = "failed";
          }
        } else {
          platforms.linkedin.status = "failed";
        }
      }

      // Reddit
      if (redditAutoPost) {
        if (user.redditAccessToken && selectedSubreddit) {
          try {
            const accessToken = (await refreshRedditToken(user)) || user.redditAccessToken;
            const result = await postToSubreddit(accessToken, user.redditUsername, selectedSubreddit, title, content, "", selectedFlair);
            platforms.reddit = {
              status: "posted",
              postedAt: new Date(),
              postId: result.id,
              url: result.url,
              extra: { subreddit: selectedSubreddit, flairId: selectedFlair },
            };
          } catch (err) {
            console.error("Reddit auto-post failed:", err.message);
            platforms.reddit.status = "failed";
          }
        } else {
          platforms.reddit.status = "failed"; // auto-post enabled but missing subreddit or token
        }
      }

      // Facebook
      if (facebookAutoPost) {
        if (user.facebookPages?.length && selectedFacebookPages?.length) {
          try {
            const pagesToPost = user.facebookPages.filter(p => selectedFacebookPages.includes(p.pageId));
            if (pagesToPost.length) {
              const result = await postToFacebook(pagesToPost, { title, content, image: imageUrl });
              platforms.facebook = {
                status: "posted",
                postedAt: new Date(),
                postId: result.id,
                url: result.url,
                extra: { pages: selectedFacebookPages },
              };
            } else {
              platforms.facebook.status = "failed"; // auto-post enabled but no valid pages
            }
          } catch (err) {
            console.error("Facebook auto-post failed:", err.message);
            platforms.facebook.status = "failed";
          }
        } else {
          platforms.facebook.status = "failed"; // auto-post enabled but no pages selected
        }
      }
    }

    // ---------- Save post ----------
    await Post.create({
      user: user._id,
      title,
      content,
      image: imageUrl,
      viralityScore: Number(viralityScore),
      platforms,
    });

    // ---------- Increment usage count ----------
    user.usageCount += 1;
    await user.save();

    res.json({ ...blogData, title, content, image: imageUrl, platforms });
  } catch (err) {
    console.error("Blog generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Blog generation failed" });
  }
}


// ------------------ Generate Blog (No Auto-Post) ------------------
export async function generateBlogOnly(req, res) {
  const { topic, wordCount, tone = "professional", language = "english", imageOption, viralityScore = 5 } = req.body;

  const payload = topic
    ? { topic, wordCount, language, tone, viralityScore }
    : { language, tone, wordCount, viralityScore };

  try {
    const response = await axios.post("https://lavi0105.app.n8n.cloud/webhook/generatePost", payload);
    const blogData = response.data;

    const title = blogData.video_title || blogData.title || topic || "Generated Blog";
    const content = blogData.script || blogData.generated_text || "";
    let imageUrl = blogData.image || blogData.picture || req.body.image || null;

    res.json({ title, content, image: imageUrl || "" });
  } catch (err) {
    console.error("Blog-only generation error:", err.response?.data || err.message);
    res.status(500).json({ error: "Blog-only generation failed" });
  }
}

// ------------------ Manual LinkedIn Post ------------------
export async function manualLinkedInPost(req, res) {
  try {
    const { title, content, image, blogId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.linkedinAccessToken || !user.linkedinPersonURN) {
      return res.status(400).json({ error: "LinkedIn not connected" });
    }

    // ---- SaaS subscription check ----
    // if (user.subscriptionStatus !== "active") {
    //   return res.status(403).json({ error: "Subscription inactive. Please renew your plan." });
    // }
    // if (user.usageCount >= user.monthlyQuota) {
    //   return res.status(403).json({ error: "Monthly quota exceeded. Upgrade your plan to continue posting." });
    // }

    const result = await postToLinkedIn(user, { title: title || "Generated Post", content, image });
    const linkedinPostId = result.postId;
    const linkedinUrl = result.url || null;

    if (blogId) {
      const post = await Post.findById(blogId);
      if (post) {
        post.platforms.linkedin = {
          status: "posted",
          scheduledTime: post.platforms.linkedin?.scheduledTime || null,
          postedAt: new Date(),
          postId: linkedinPostId,
          url: linkedinUrl,
          extra: {},
        };
        await post.save();
      }
    }

    // ---- Increment usage count ----
    user.usageCount += 1;
    await user.save();

    res.json({ success: true, linkedinPostId, url: linkedinUrl });
  } catch (err) {
    console.error("Manual LinkedIn post failed:", err.message);
    res.status(500).json({ error: "LinkedIn post failed" });
  }
}

// ------------------ Create Blog Post ------------------
export const createBlogPost = async (req, res) => {
  try {
    const { title, content, image, topic, viralityScore } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content required" });

    const user = await User.findById(req.user.id);

    // ---- SaaS subscription check ----
    // if (user.subscriptionStatus !== "active") {
    //   return res.status(403).json({ error: "Subscription inactive. Please renew your plan." });
    // }
    // if (user.usageCount >= user.monthlyQuota) {
    //   return res.status(403).json({ error: "Monthly quota exceeded. Upgrade your plan to continue posting." });
    // }

    const post = await Post.create({
      user: req.user.id,
      title,
      content,
      topic: topic || "General",
      image,
      viralityScore,
      platforms: {
        linkedin: {
          status: "draft",
          scheduledTime: null,
          postedAt: null,
          postId: null,
          url: null,
          extra: {},
        }
      }
    });

    user.usageCount += 1;
    await user.save();

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating Post:", err.message);
    res.status(500).json({ error: "Failed to create Post" });
  }
};

// ------------------ Get User Blogs ------------------
export const getUserBlogs = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).lean();
    const formatted = posts.map((post) => ({
      ...post,
      topic: post.topic || "General",
      viralityScore: post.viralityScore ?? 5,
      publishDate: post.platforms.linkedin?.scheduledTime || post.createdAt,
      analytics: post.analytics || { likes: 0, comments: 0, shares: 0, impressions: 0, engagementRate: 0 },
      linkedInStatus: post.platforms.linkedin?.status || "draft",
      linkedInPostId: post.platforms.linkedin?.postId || null,
      linkedInUrl: post.platforms.linkedin?.url || null,
    }));

    formatted.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching blogs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------ Get Single Blog ------------------
export async function getSingleBlog(req, res) {
  try {
    const blog = await Post.findOne({ _id: req.params.id, user: req.user.id });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    console.error("Error fetching single blog:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ------------------ Update Blog by ID ------------------
export const updateBlogById = async (req, res) => {
  const { id } = req.params;
  const { title, content, image, topic } = req.body;

  try {
    const blog = await Post.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (!blog.user.equals(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.image = image || blog.image;
    blog.topic = topic || blog.topic;

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (err) {
    console.error("Error updating blog:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------ Delete Blog by ID ------------------
export const deleteBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Post.findById(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (!blog.user.equals(req.user._id)) return res.status(403).json({ message: "Not authorized" });

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};