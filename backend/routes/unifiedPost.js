// backend/routes/unifiedPosts.js
import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import {
  createPost,
  manualPost,
  schedulePost,
  getScheduledPosts,
  cancelScheduledPost,
  reschedulePost
} from "../controllers/postController.js";
import { checkQuota } from "../middleware/quotaMiddleware.js";


const router = express.Router();

router.post("/create", authenticateUser, checkQuota, createPost);
router.post("/manualPost", authenticateUser, checkQuota, manualPost);
router.post("/schedule", authenticateUser, checkQuota, schedulePost);
router.get("/scheduled", authenticateUser, getScheduledPosts);
router.delete("/cancel/:postId/:platform", authenticateUser, cancelScheduledPost);
router.post("/reschedule", authenticateUser, reschedulePost);


export default router;
