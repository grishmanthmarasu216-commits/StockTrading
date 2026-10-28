import { errorResponse } from "../utils/formatters.js";

/**
 * Validates user registration payload
 */
export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long.");
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("A valid email address is required.");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (errors.length > 0) {
    return errorResponse(res, errors[0], 400, errors);
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}

/**
 * Validates user login payload
 */
export function validateLogin(req, res, next) {
  const { identifier, password } = req.body;
  const errors = [];

  if (!identifier || typeof identifier !== "string" || identifier.trim().length === 0) {
    errors.push("Client ID or registered email is required.");
  }
  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return errorResponse(res, errors[0], 400, errors);
  }

  req.body.identifier = identifier.trim();
  next();
}

/**
 * Validates trade order payload
 */
export function validateOrder(req, res, next) {
  const { symbol, type, product, orderType, quantity, price } = req.body;
  const errors = [];

  if (!symbol || typeof symbol !== "string" || symbol.trim().length === 0) {
    errors.push("Valid stock symbol is required.");
  }

  if (!type || !["BUY", "SELL"].includes(type.toUpperCase())) {
    errors.push("Order action must be either BUY or SELL.");
  }

  if (product && !["CNC", "MIS"].includes(product.toUpperCase())) {
    errors.push("Product type must be either CNC (Delivery) or MIS (Intraday).");
  }

  if (orderType && !["MARKET", "LIMIT"].includes(orderType.toUpperCase())) {
    errors.push("Order type must be either MARKET or LIMIT.");
  }

  const parsedQty = Number(quantity);
  if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 50000) {
    errors.push("Quantity must be a positive integer between 1 and 50,000.");
  }

  if (orderType && orderType.toUpperCase() === "LIMIT") {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push("A valid positive limit price is required for LIMIT orders.");
    }
  }

  if (errors.length > 0) {
    return errorResponse(res, errors[0], 400, errors);
  }

  req.body.symbol = symbol.trim().toUpperCase();
  req.body.type = type.toUpperCase();
  req.body.product = (product || "CNC").toUpperCase();
  req.body.orderType = (orderType || "MARKET").toUpperCase();
  req.body.quantity = parsedQty;
  if (price) req.body.price = Number(price);

  next();
}

/**
 * Validates funds deposit/withdrawal request
 */
export function validateFunds(req, res, next) {
  const { amount } = req.body;
  const parsedAmount = Number(amount);

  if (isNaN(parsedAmount) || parsedAmount < 100 || parsedAmount > 10000000) {
    return errorResponse(res, "Amount must be between ₹100 and ₹1,00,00,000.", 400);
  }

  req.body.amount = parsedAmount;
  next();
}
