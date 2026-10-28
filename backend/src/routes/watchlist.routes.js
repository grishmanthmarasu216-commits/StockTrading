import { Router } from "express";
import * as watchlistController from "../controllers/watchlist.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", watchlistController.getWatchlist);
router.post("/", watchlistController.addToWatchlist);
router.delete("/:symbol", watchlistController.removeFromWatchlist);

export default router;
