import * as portfolioService from "../services/portfolio.service.js";
import { successResponse } from "../utils/formatters.js";

export async function getHoldings(req, res, next) {
  try {
    const data = await portfolioService.getUserHoldings(req.user._id);
    return successResponse(res, data, "Holdings retrieved successfully.");
  } catch (err) {
    next(err);
  }
}
