// backend/routes/plan.js
import { Router } from "express";
import { getPlans, subscribePlan } from "../controllers/planController.js";

const router = Router();

// GET /api/plans
router.get("/", getPlans);
router.post("/subscribe", subscribePlan);

export default router;
