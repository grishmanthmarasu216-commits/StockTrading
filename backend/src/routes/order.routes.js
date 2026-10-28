import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateOrder } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.post("/", validateOrder, orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", orderController.getOrderById);
router.post("/:id/cancel", orderController.cancelOrder);

export default router;
