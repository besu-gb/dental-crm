import { Router, } from "express";
import { getDashboardStats } from "../controller/dashboard.controller";

const router = Router();

// ─── GET /api/dashboard/stats ──────────────────────────────────────────────
router.get("/stats", getDashboardStats);

export default router;
