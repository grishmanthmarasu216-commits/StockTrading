import * as marketService from "../services/market.service.js";
import { successResponse, errorResponse } from "../utils/formatters.js";

export async function getStocks(req, res, next) {
  try {
    const { search, sector } = req.query;
    let stocks;

    if (search) {
      stocks = await marketService.searchStocks(search);
    } else {
      const filter = {};
      if (sector && sector !== "ALL") filter.sector = sector;
      stocks = await marketService.getAllStocks(filter);
    }

    return successResponse(res, { count: stocks.length, stocks }, "Stocks retrieved successfully.");
  } catch (err) {
    next(err);
  }
}

export async function getStockBySymbol(req, res, next) {
  try {
    const { symbol } = req.params;
    const stock = await marketService.getStockBySymbol(symbol);
    if (!stock) {
      return errorResponse(res, `Stock symbol '${symbol.toUpperCase()}' not found.`, 404);
    }
    return successResponse(res, { stock }, "Stock details retrieved.");
  } catch (err) {
    next(err);
  }
}
