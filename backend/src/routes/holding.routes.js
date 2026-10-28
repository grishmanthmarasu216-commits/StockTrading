import { Router } from "express";
import * as holdingController from "../controllers/holding.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", holdingController.getHoldings);

export default router;
