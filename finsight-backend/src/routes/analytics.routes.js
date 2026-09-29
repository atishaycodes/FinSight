import { Router } from "express";
import * as ctrl from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/dashboard", ctrl.dashboardSummary);
router.get("/trend",     ctrl.monthlyTrend);
router.get("/insights",  ctrl.insights);
router.get("/yearly",    ctrl.yearlySummary);

export default router;
