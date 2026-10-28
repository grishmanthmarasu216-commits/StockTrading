import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", transactionController.getTransactions);

export default router;
