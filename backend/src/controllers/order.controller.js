import * as tradingService from "../services/trading.service.js";
import { Order } from "../models/Order.js";
import { successResponse, errorResponse } from "../utils/formatters.js";

export async function createOrder(req, res, next) {
  try {
    const { symbol, type, product, orderType, quantity, price } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] || req.body.idempotencyKey;

    const order = await tradingService.executeOrder({
      userId: req.user._id,
      symbol,
      type,
      product,
      orderType,
      quantity,
      price,
      idempotencyKey
    });

    const isComplete = order.status === "COMPLETE";
    return successResponse(
      res,
      { order },
      isComplete
        ? `Order Executed: ${order.type} ${order.quantity} ${order.symbol} @ ₹${order.executionPrice.toFixed(2)}`
        : `Order Placed: ${order.type} ${order.quantity} ${order.symbol} (${order.status})`,
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function getOrders(req, res, next) {
  try {
    const { status, symbol, product, page, limit } = req.query;
    const result = await tradingService.getUserOrders(req.user._id, {
      status,
      symbol,
      product,
      page,
      limit
    });

    return successResponse(res, result, "Orders retrieved.");
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: req.user._id }).populate("stock");
    if (!order) {
      return errorResponse(res, "Order not found or unauthorized.", 404);
    }
    return successResponse(res, { order }, "Order details retrieved.");
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const cancelled = await tradingService.cancelPendingOrder(req.user._id, id);
    return successResponse(res, { order: cancelled }, "Order cancelled successfully.");
  } catch (err) {
    next(err);
  }
}
