import * as accountService from "../services/account.service.js";
import { successResponse } from "../utils/formatters.js";

export async function getTransactions(req, res, next) {
  try {
    const { page, limit, type } = req.query;
    const result = await accountService.getTransactions(req.user._id, { page, limit, type });
    return successResponse(res, result, "Transactions retrieved.");
  } catch (err) {
    next(err);
  }
}
