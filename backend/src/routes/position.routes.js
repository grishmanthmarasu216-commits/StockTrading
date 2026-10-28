import { Router } from "express";
import * as positionController from "../controllers/position.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", positionController.getPositions);

export default router;
