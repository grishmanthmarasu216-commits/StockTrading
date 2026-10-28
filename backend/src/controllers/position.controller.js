import * as portfolioService from "../services/portfolio.service.js";
import { successResponse } from "../utils/formatters.js";

export async function getPositions(req, res, next) {
  try {
    const data = await portfolioService.getUserPositions(req.user._id);
    return successResponse(res, data, "Positions retrieved successfully.");
  } catch (err) {
    next(err);
  }
}
