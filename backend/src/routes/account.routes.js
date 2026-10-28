import { Router } from "express";
import * as accountController from "../controllers/account.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateFunds } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.get("/funds", accountController.getFunds);
router.post("/deposits", validateFunds, accountController.deposit);
router.post("/withdrawals", validateFunds, accountController.withdraw);

export default router;
