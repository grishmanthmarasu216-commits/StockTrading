import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/summary", dashboardController.getDashboardSummary);
router.get("/performance", dashboardController.getPerformance);

export default router;
