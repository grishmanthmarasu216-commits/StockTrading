import { Order } from "../models/Order.js";
import { Holding } from "../models/Holding.js";
import { Position } from "../models/Position.js";
import { Account } from "../models/Account.js";
import { Transaction } from "../models/Transaction.js";
import { Stock } from "../models/Stock.js";
import { roundToTwo } from "../utils/formatters.js";

export async function executeOrder({
  userId,
  symbol,
  type,
  product = "CNC",
  orderType = "MARKET",
  quantity,
  price = null,
  idempotencyKey = null
}) {
  const normSymbol = symbol.trim().toUpperCase();
  const normType = type.trim().toUpperCase();
  const normProduct = (product || "CNC").trim().toUpperCase();
  const normOrderType = (orderType || "MARKET").trim().toUpperCase();
  const qty = parseInt(quantity, 10);

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ user: userId, idempotencyKey });
    if (existingOrder) {
      console.log(`[TradingService] Returning idempotent order ${existingOrder._id}`);
      return existingOrder;
    }
  }

  // 2. Stock validation
  const stock = await Stock.findOne({ symbol: normSymbol, isActive: true });
  if (!stock) {
    const error = new Error(`Stock with symbol ${normSymbol} was not found or is inactive.`);
    error.statusCode = 404;
    throw error;
  }

  // 3. Price resolution
  const executionPrice = normOrderType === "LIMIT" && price ? Number(price) : stock.price;
  const totalValue = roundToTwo(executionPrice * qty);

  // 4. User Account validation
  let account = await Account.findOne({ user: userId });
  if (!account) {
    // Lazy initialize account with demo balance if missing
    account = await Account.create({
      user: userId,
      openingBalance: 175000.00,
      availableCash: 175000.00,
      usedMargin: 0.00
    });
  }

  // Handle LIMIT orders that cannot be immediately filled
  if (normOrderType === "LIMIT") {
    const isLimitFilled =
      (normType === "BUY" && stock.price <= executionPrice) ||
      (normType === "SELL" && stock.price >= executionPrice);

    if (!isLimitFilled) {
      // Pending order creation
      const pendingOrder = await Order.create({
        user: userId,
        stock: stock._id,
        symbol: normSymbol,
        type: normType,
        product: normProduct,
        orderType: normOrderType,
        quantity: qty,
        requestedPrice: executionPrice,
        executionPrice: null,
        status: "PENDING",
        filledQty: 0,
        idempotencyKey
      });

      return pendingOrder;
    }
  }

  // --- MARKET or MATCHED LIMIT ORDER EXECUTION ---
  if (normType === "BUY") {
    // CNC requires 100% cash; MIS requires 20% margin
    const requiredMargin = normProduct === "MIS" ? roundToTwo(totalValue * 0.20) : totalValue;

    if (account.availableCash < requiredMargin) {
      const error = new Error(
        `Insufficient available margin. Required: ₹${requiredMargin.toFixed(2)}, Available: ₹${account.availableCash.toFixed(2)}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Deduct cash from account
    account.availableCash = roundToTwo(account.availableCash - requiredMargin);
    account.usedMargin = roundToTwo(account.usedMargin + requiredMargin);
    await account.save();

    // Create completed order
    const order = await Order.create({
      user: userId,
      stock: stock._id,
      symbol: normSymbol,
      type: "BUY",
      product: normProduct,
      orderType: normOrderType,
      quantity: qty,
      requestedPrice: executionPrice,
      executionPrice,
      status: "COMPLETE",
      filledQty: qty,
      idempotencyKey
    });

    if (normProduct === "CNC") {
      // Delivery Holding update: weighted average calculation
      let holding = await Holding.findOne({ user: userId, stock: stock._id });
      if (holding) {
        const oldTotal = holding.quantity * holding.averagePrice;
        const newTotal = oldTotal + totalValue;
        const newQty = holding.quantity + qty;
        holding.averagePrice = roundToTwo(newTotal / newQty);
        holding.quantity = newQty;
        await holding.save();
      } else {
        await Holding.create({
          user: userId,
          stock: stock._id,
          symbol: normSymbol,
          quantity: qty,
          averagePrice: executionPrice
        });
      }
    } else {
      // Intraday MIS Position update
      let position = await Position.findOne({
        user: userId,
        stock: stock._id,
        product: "MIS",
        status: "OPEN"
      });

      if (position) {
        const newQty = position.quantity + qty;
        if (newQty === 0) {
          position.status = "CLOSED";
          position.quantity = 0;
        } else {
          const oldCost = position.quantity * position.averagePrice;
          position.averagePrice = roundToTwo((oldCost + totalValue) / newQty);
          position.quantity = newQty;
        }
        await position.save();
      } else {
        await Position.create({
          user: userId,
          stock: stock._id,
          symbol: normSymbol,
          product: "MIS",
          quantity: qty,
          averagePrice: executionPrice,
          status: "OPEN"
        });
      }
    }

    // Record audit transaction
    await Transaction.create({
      user: userId,
      type: "TRADE_BUY",
      amount: requiredMargin,
      order: order._id,
      description: `Bought ${qty} ${normSymbol} (${normProduct}) @ ₹${executionPrice.toFixed(2)}`,
      mode: "Simulated Market Execution",
      status: "SUCCESS"
    });

    return order;
  } else if (normType === "SELL") {
    // --- SELL ORDER ---
    if (normProduct === "CNC") {
      // Check holding availability
      const holding = await Holding.findOne({ user: userId, stock: stock._id });
      if (!holding || holding.quantity < qty) {
        const availableQty = holding ? holding.quantity : 0;
        const error = new Error(
          `Insufficient holdings to sell. Requested: ${qty}, Available: ${availableQty} shares of ${normSymbol}.`
        );
        error.statusCode = 400;
        throw error;
      }

      // Calculate realized P&L
      const costBasis = roundToTwo(holding.averagePrice * qty);
      const realizedPnL = roundToTwo(totalValue - costBasis);

      // Reduce holding
      if (holding.quantity === qty) {
        await Holding.findByIdAndDelete(holding._id);
      } else {
        holding.quantity -= qty;
        await holding.save();
      }

      // Credit proceeds back to available margin
      account.availableCash = roundToTwo(account.availableCash + totalValue);
      account.usedMargin = roundToTwo(Math.max(0, account.usedMargin - costBasis));
      await account.save();

      const order = await Order.create({
        user: userId,
        stock: stock._id,
        symbol: normSymbol,
        type: "SELL",
        product: normProduct,
        orderType: normOrderType,
        quantity: qty,
        requestedPrice: executionPrice,
        executionPrice,
        status: "COMPLETE",
        filledQty: qty,
        idempotencyKey
      });

      await Transaction.create({
        user: userId,
        type: "TRADE_SELL",
        amount: totalValue,
        order: order._id,
        description: `Sold ${qty} ${normSymbol} (${normProduct}) @ ₹${executionPrice.toFixed(2)} (P&L: ₹${realizedPnL.toFixed(2)})`,
        mode: "Simulated Market Execution",
        status: "SUCCESS"
      });

      return order;
    } else {
      // MIS Intraday Sell (square off or short)
      let position = await Position.findOne({
        user: userId,
        stock: stock._id,
        product: "MIS",
        status: "OPEN"
      });

      let realizedPnL = 0;
      if (position && position.quantity > 0) {
        const closedQty = Math.min(position.quantity, qty);
        realizedPnL = roundToTwo((executionPrice - position.averagePrice) * closedQty);
        position.realizedPnL = roundToTwo(position.realizedPnL + realizedPnL);
        position.quantity -= qty;

        if (position.quantity === 0) {
          position.status = "CLOSED";
        }
        await position.save();
      } else {
        // New short position
        position = await Position.create({
          user: userId,
          stock: stock._id,
          symbol: normSymbol,
          product: "MIS",
          quantity: -qty,
          averagePrice: executionPrice,
          status: "OPEN"
        });
      }

      // Credit proceeds
      account.availableCash = roundToTwo(account.availableCash + totalValue);
      await account.save();

      const order = await Order.create({
        user: userId,
        stock: stock._id,
        symbol: normSymbol,
        type: "SELL",
        product: normProduct,
        orderType: normOrderType,
        quantity: qty,
        requestedPrice: executionPrice,
        executionPrice,
        status: "COMPLETE",
        filledQty: qty,
        idempotencyKey
      });

      await Transaction.create({
        user: userId,
        type: "TRADE_SELL",
        amount: totalValue,
        order: order._id,
        description: `Executed MIS Sell ${qty} ${normSymbol} @ ₹${executionPrice.toFixed(2)}`,
        mode: "Simulated Intraday",
        status: "SUCCESS"
      });

      return order;
    }
  } else {
    const error = new Error(`Unsupported order action: ${normType}`);
    error.statusCode = 400;
    throw error;
  }
}

export async function cancelPendingOrder(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const error = new Error("Order not found or unauthorized.");
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== "PENDING") {
    const error = new Error(`Cannot cancel order in status '${order.status}'. Only PENDING orders may be cancelled.`);
    error.statusCode = 400;
    throw error;
  }

  order.status = "CANCELLED";
  order.rejectionReason = "Cancelled by user";
  await order.save();

  return order;
}

export async function getUserOrders(userId, { status, symbol, product, page = 1, limit = 50 } = {}) {
  const filter = { user: userId };
  if (status) filter.status = status.toUpperCase();
  if (symbol) filter.symbol = symbol.toUpperCase();
  if (product) filter.product = product.toUpperCase();

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate("stock", "name sector exchange");

  return {
    orders,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit)
    }
  };
}
