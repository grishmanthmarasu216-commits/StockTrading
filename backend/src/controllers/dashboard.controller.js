import * as portfolioService from "../services/portfolio.service.js";
import { successResponse } from "../utils/formatters.js";

export async function getDashboardSummary(req, res, next) {
  try {
    const data = await portfolioService.getDashboardSummary(req.user._id);
    return successResponse(res, data, "Dashboard summary calculated successfully.");
  } catch (err) {
    next(err);
  }
}

export async function getPerformance(req, res, next) {
  try {
    const timeframe = req.query.timeframe || "1M";
    const data = await portfolioService.getPerformanceTimeSeries(req.user._id, timeframe);
    return successResponse(res, data, "Performance time series retrieved.");
  } catch (err) {
    next(err);
  }
}
