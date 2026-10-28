import { Holding } from "../models/Holding.js";
import { Position } from "../models/Position.js";
import { Account } from "../models/Account.js";
import { roundToTwo, calculatePercentage } from "../utils/formatters.js";

// Deterministic historical curve multipliers for performance chart
const HISTORY_SERIES_CONFIG = {
  "1W": [
    { offsetDays: 7, factor: 0.985 },
    { offsetDays: 6, factor: 0.988 },
    { offsetDays: 5, factor: 0.992 },
    { offsetDays: 4, factor: 0.990 },
    { offsetDays: 3, factor: 0.995 },
    { offsetDays: 2, factor: 0.997 },
    { offsetDays: 1, factor: 1.002 },
    { offsetDays: 0, factor: 1.000 }
  ],
  "1M": [
    { offsetDays: 30, factor: 0.950 },
    { offsetDays: 25, factor: 0.958 },
    { offsetDays: 20, factor: 0.965 },
    { offsetDays: 15, factor: 0.978 },
    { offsetDays: 10, factor: 0.985 },
    { offsetDays: 5, factor: 0.992 },
    { offsetDays: 2, factor: 0.998 },
    { offsetDays: 0, factor: 1.000 }
  ],
  "3M": [
    { offsetDays: 90, factor: 0.880 },
    { offsetDays: 75, factor: 0.895 },
    { offsetDays: 60, factor: 0.912 },
    { offsetDays: 45, factor: 0.940 },
    { offsetDays: 30, factor: 0.958 },
    { offsetDays: 15, factor: 0.982 },
    { offsetDays: 0, factor: 1.000 }
  ],
  "1Y": [
    { offsetDays: 365, factor: 0.810 },
    { offsetDays: 300, factor: 0.840 },
    { offsetDays: 240, factor: 0.875 },
    { offsetDays: 180, factor: 0.910 },
    { offsetDays: 120, factor: 0.935 },
    { offsetDays: 60, factor: 0.970 },
    { offsetDays: 0, factor: 1.000 }
  ]
};

export async function getUserHoldings(userId) {
  const rawHoldings = await Holding.find({ user: userId, quantity: { $gt: 0 } })
    .populate("stock")
    .sort({ quantity: -1 });

  let totalInvestment = 0;
  let currentPortfolioValue = 0;

  const holdings = rawHoldings.map(item => {
    const stock = item.stock || {};
    const curPrice = stock.price || item.averagePrice;
    const invValue = roundToTwo(item.quantity * item.averagePrice);
    const curValue = roundToTwo(item.quantity * curPrice);
    const pnl = roundToTwo(curValue - invValue);
    const returnPct = calculatePercentage(pnl, invValue);

    totalInvestment += invValue;
    currentPortfolioValue += curValue;

    return {
      id: item._id,
      symbol: item.symbol,
      name: stock.name || item.symbol,
      exchange: stock.exchange || "NSE",
      sector: stock.sector || "General",
      quantity: item.quantity,
      averagePrice: item.averagePrice,
      currentPrice: curPrice,
      investmentValue: invValue,
      currentValue: curValue,
      pnl,
      returnPercentage: returnPct,
      updatedAt: item.updatedAt
    };
  });

  totalInvestment = roundToTwo(totalInvestment);
  currentPortfolioValue = roundToTwo(currentPortfolioValue);
  const totalPnL = roundToTwo(currentPortfolioValue - totalInvestment);
  const totalReturnPct = calculatePercentage(totalPnL, totalInvestment);

  return {
    summary: {
      totalInvestment,
      currentPortfolioValue,
      totalPnL,
      totalReturnPercentage: totalReturnPct,
      holdingsCount: holdings.length
    },
    holdings
  };
}

export async function getUserPositions(userId) {
  const rawPositions = await Position.find({ user: userId })
    .populate("stock")
    .sort({ createdAt: -1 });

  let totalRealized = 0;
  let totalUnrealized = 0;

  const positions = rawPositions.map(pos => {
    const stock = pos.stock || {};
    const curPrice = stock.price || pos.averagePrice;
    const unrealizedPnL = pos.status === "OPEN" ? roundToTwo((curPrice - pos.averagePrice) * pos.quantity) : 0;
    const realizedPnL = pos.realizedPnL || 0;

    totalRealized += realizedPnL;
    totalUnrealized += unrealizedPnL;

    return {
      id: pos._id,
      symbol: pos.symbol,
      name: stock.name || pos.symbol,
      product: pos.product,
      quantity: pos.quantity,
      averagePrice: pos.averagePrice,
      currentPrice: curPrice,
      realizedPnL,
      unrealizedPnL,
      status: pos.status,
      updatedAt: pos.updatedAt
    };
  });

  totalRealized = roundToTwo(totalRealized);
  totalUnrealized = roundToTwo(totalUnrealized);
  const totalNet = roundToTwo(totalRealized + totalUnrealized);

  return {
    summary: {
      totalRealized,
      totalUnrealized,
      totalNet,
      openCount: positions.filter(p => p.status === "OPEN").length
    },
    positions
  };
}

export async function getDashboardSummary(userId) {
  let account = await Account.findOne({ user: userId });
  if (!account) {
    account = await Account.create({
      user: userId,
      openingBalance: 175000.00,
      availableCash: 175000.00,
      usedMargin: 0.00
    });
  }

  const { summary: holdingsSummary, holdings } = await getUserHoldings(userId);
  const { summary: positionsSummary } = await getUserPositions(userId);

  return {
    account: {
      openingBalance: account.openingBalance,
      availableCash: account.availableCash,
      availableMargin: account.availableCash,
      usedMargin: account.usedMargin,
      totalBalance: roundToTwo(account.availableCash + account.usedMargin),
      currency: account.currency
    },
    portfolio: {
      totalInvestment: holdingsSummary.totalInvestment,
      currentPortfolioValue: holdingsSummary.currentPortfolioValue,
      unrealizedPnL: holdingsSummary.totalPnL,
      realizedPnL: positionsSummary.totalRealized,
      totalPnL: holdingsSummary.totalPnL,
      overallReturnPercentage: holdingsSummary.totalReturnPercentage,
      holdingsCount: holdingsSummary.holdingsCount
    },
    topHoldings: holdings.slice(0, 6)
  };
}

export async function getPerformanceTimeSeries(userId, timeframe = "1M") {
  const { summary } = await getUserHoldings(userId);
  const baseValue = summary.currentPortfolioValue > 0 ? summary.currentPortfolioValue : 100000;

  const seriesConfig = HISTORY_SERIES_CONFIG[timeframe] || HISTORY_SERIES_CONFIG["1M"];
  const now = new Date();

  const points = seriesConfig.map(cfg => {
    const d = new Date(now.getTime() - cfg.offsetDays * 24 * 60 * 60 * 1000);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("default", { month: "short" });
    const label = `${day} ${month}`;
    const value = roundToTwo(baseValue * cfg.factor);

    return {
      date: label,
      timestamp: d.toISOString(),
      value
    };
  });

  return {
    timeframe,
    currentValue: baseValue,
    data: points
  };
}
