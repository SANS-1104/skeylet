import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controllers/adminStudioUserController.js";
import { getPlans, createPlan, updatePlan, deletePlan } from "../controllers/adminStudioPlanController.js";
import { isAdmin, isSuperAdmin } from "../middleware/adminMiddleware.js";
import { superAdminAuth } from "../middleware/superAdminAuth.js";


const router = express.Router();

// USER MANAGEMENT
router.get("/users", superAdminAuth,isSuperAdmin, getAllUsers);
router.put("/users/:id", superAdminAuth,isSuperAdmin, updateUser);
router.delete("/users/:id", superAdminAuth, isSuperAdmin,deleteUser);

// PLAN MANAGEMENT
router.get("/plans", superAdminAuth,isSuperAdmin, getPlans);
router.post("/plans", superAdminAuth, isSuperAdmin,createPlan);
router.put("/plans/:id", superAdminAuth, isSuperAdmin,updatePlan);
router.delete("/plans/:id", superAdminAuth,isSuperAdmin, deletePlan);


export default router;
