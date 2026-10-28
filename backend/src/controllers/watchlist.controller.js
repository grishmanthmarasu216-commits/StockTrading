import { Watchlist } from "../models/Watchlist.js";
import { Stock } from "../models/Stock.js";
import { successResponse, errorResponse } from "../utils/formatters.js";

export async function getWatchlist(req, res, next) {
  try {
    const basketId = parseInt(req.query.basketId, 10) || 1;
    let watchlist = await Watchlist.findOne({ user: req.user._id, basketId });

    if (!watchlist) {
      watchlist = await Watchlist.create({
        user: req.user._id,
        basketId,
        symbols: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS"]
      });
    }

    // Retrieve full stock models for each symbol
    const stocks = await Stock.find({ symbol: { $in: watchlist.symbols }, isActive: true });

    // Preserve the user's custom ordering
    const orderedStocks = watchlist.symbols
      .map(sym => stocks.find(s => s.symbol === sym))
      .filter(Boolean);

    return successResponse(
      res,
      {
        basketId,
        count: orderedStocks.length,
        symbols: watchlist.symbols,
        stocks: orderedStocks
      },
      "Watchlist retrieved."
    );
  } catch (err) {
    next(err);
  }
}

export async function addToWatchlist(req, res, next) {
  try {
    const { symbol } = req.body;
    const basketId = parseInt(req.body.basketId, 10) || 1;

    if (!symbol) {
      return errorResponse(res, "Stock symbol is required.", 400);
    }

    const normSymbol = symbol.trim().toUpperCase();
    const stockExists = await Stock.findOne({ symbol: normSymbol, isActive: true });
    if (!stockExists) {
      return errorResponse(res, `Stock '${normSymbol}' does not exist.`, 404);
    }

    let watchlist = await Watchlist.findOne({ user: req.user._id, basketId });
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.user._id, basketId, symbols: [] });
    }

    if (watchlist.symbols.includes(normSymbol)) {
      return errorResponse(res, `${normSymbol} is already in Watchlist ${basketId}.`, 400);
    }

    if (watchlist.symbols.length >= 50) {
      return errorResponse(res, "Watchlist limit reached (maximum 50 stocks per basket).", 400);
    }

    watchlist.symbols.push(normSymbol);
    await watchlist.save();

    return successResponse(res, { basketId, symbols: watchlist.symbols }, `${normSymbol} added to Watchlist.`);
  } catch (err) {
    next(err);
  }
}

export async function removeFromWatchlist(req, res, next) {
  try {
    const { symbol } = req.params;
    const basketId = parseInt(req.query.basketId, 10) || 1;
    const normSymbol = symbol.trim().toUpperCase();

    const watchlist = await Watchlist.findOne({ user: req.user._id, basketId });
    if (!watchlist || !watchlist.symbols.includes(normSymbol)) {
      return errorResponse(res, `${normSymbol} not found in Watchlist ${basketId}.`, 404);
    }

    watchlist.symbols = watchlist.symbols.filter(s => s !== normSymbol);
    await watchlist.save();

    return successResponse(res, { basketId, symbols: watchlist.symbols }, `${normSymbol} removed from Watchlist.`);
  } catch (err) {
    next(err);
  }
}
