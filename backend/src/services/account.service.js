import { Account } from "../models/Account.js";
import { Transaction } from "../models/Transaction.js";
import { roundToTwo } from "../utils/formatters.js";

export async function getAccountFunds(userId) {
  let account = await Account.findOne({ user: userId });
  if (!account) {
    account = await Account.create({
      user: userId,
      openingBalance: 175000.00,
      availableCash: 175000.00,
      usedMargin: 0.00
    });
  }

  const recentTransactions = await Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    openingBalance: account.openingBalance,
    availableMargin: account.availableCash,
    availableCash: account.availableCash,
    usedMargin: account.usedMargin,
    payin: account.payin || 0,
    spanMargin: account.spanMargin || 0,
    exposureMargin: account.exposureMargin || 0,
    collateralLiquid: account.collateralLiquid || 0,
    totalBalance: roundToTwo(account.availableCash + account.usedMargin),
    currency: account.currency,
    recentTransactions
  };
}

export async function depositFunds(userId, { amount, mode = "UPI (Simulated)" }) {
  const depositAmount = roundToTwo(amount);
  if (depositAmount <= 0) {
    const error = new Error("Deposit amount must be greater than zero.");
    error.statusCode = 400;
    throw error;
  }

  let account = await Account.findOne({ user: userId });
  if (!account) {
    account = await Account.create({
      user: userId,
      openingBalance: 175000.00,
      availableCash: 175000.00,
      usedMargin: 0.00
    });
  }

  account.availableCash = roundToTwo(account.availableCash + depositAmount);
  account.payin = roundToTwo((account.payin || 0) + depositAmount);
  await account.save();

  const transaction = await Transaction.create({
    user: userId,
    type: "DEPOSIT",
    amount: depositAmount,
    status: "SUCCESS",
    description: `Simulated Funds Added via ${mode}`,
    mode
  });

  return {
    account: {
      availableCash: account.availableCash,
      availableMargin: account.availableCash,
      usedMargin: account.usedMargin,
      totalBalance: roundToTwo(account.availableCash + account.usedMargin)
    },
    transaction
  };
}

export async function withdrawFunds(userId, { amount, mode = "Bank Transfer (Simulated)" }) {
  const withdrawAmount = roundToTwo(amount);
  if (withdrawAmount <= 0) {
    const error = new Error("Withdrawal amount must be greater than zero.");
    error.statusCode = 400;
    throw error;
  }

  let account = await Account.findOne({ user: userId });
  if (!account || account.availableCash < withdrawAmount) {
    const error = new Error(
      `Insufficient available margin for withdrawal. Requested: ₹${withdrawAmount.toFixed(2)}, Available: ₹${account ? account.availableCash.toFixed(2) : "0.00"}`
    );
    error.statusCode = 400;
    throw error;
  }

  account.availableCash = roundToTwo(account.availableCash - withdrawAmount);
  await account.save();

  const transaction = await Transaction.create({
    user: userId,
    type: "WITHDRAWAL",
    amount: withdrawAmount,
    status: "SUCCESS",
    description: `Simulated Funds Withdrawn via ${mode}`,
    mode
  });

  return {
    account: {
      availableCash: account.availableCash,
      availableMargin: account.availableCash,
      usedMargin: account.usedMargin,
      totalBalance: roundToTwo(account.availableCash + account.usedMargin)
    },
    transaction
  };
}

export async function getTransactions(userId, { page = 1, limit = 20, type } = {}) {
  const filter = { user: userId };
  if (type) filter.type = type.toUpperCase();

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await Transaction.countDocuments(filter);
  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .populate("order", "symbol type product quantity executionPrice");

  return {
    transactions,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit)
    }
  };
}
