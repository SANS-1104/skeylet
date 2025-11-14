// backend/routes/redditRoutes.js
import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import {
  createRedditDraft,
  moveRedditToDraft,
  getUserSubreddits,
  searchSubreddits,
  fetchSubredditFlairs,
  manualRedditPost 
} from "../controllers/redditController.js";
import {
  redditAuth,
  redditCallback,
  disconnectReddit,
} from "../controllers/redditAuthController.js";
// import {scheduleRedditPostWithAgenda} from "../scheduler/redditAgenda.js"

const router = express.Router();

/* ------------------ 🔐 OAuth ------------------ */
router.get("/auth", redditAuth);
router.get("/callback", redditCallback);
router.post("/disconnect", authenticateUser, disconnectReddit);

/* ------------------ 📝 Drafts & Posting ------------------ */
// ➤ Create or save a Reddit draft
router.post("/create", authenticateUser, createRedditDraft);

// ➤ Post instantly to Reddit (non-scheduled)
router.post("/post", authenticateUser, manualRedditPost);

// ➤ Schedule Reddit post with Agenda
// router.post("/schedule", authenticateUser, scheduleRedditPostWithAgenda);

// ➤ Move a Reddit post back to draft
// router.put("/move-to-draft/:id", authenticateUser, moveRedditToDraft);

/* ------------------ 🎯 Subreddit Tools ------------------ */
// ➤ Fetch user-subscribed subreddits
router.get("/subreddits", authenticateUser, getUserSubreddits);

// ➤ Search any subreddit
router.get("/subreddits/search", authenticateUser, searchSubreddits);

// ➤ Fetch flairs for a specific subreddit
router.get("/flairs", authenticateUser, fetchSubredditFlairs);

export default router;
