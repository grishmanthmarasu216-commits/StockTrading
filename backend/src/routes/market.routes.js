import { Router } from "express";
import * as marketController from "../controllers/market.controller.js";

const router = Router();

router.get("/stocks", marketController.getStocks);
router.get("/stocks/:symbol", marketController.getStockBySymbol);

export default router;
