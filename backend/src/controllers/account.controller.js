import * as accountService from "../services/account.service.js";
import { successResponse } from "../utils/formatters.js";

export async function getFunds(req, res, next) {
  try {
    const funds = await accountService.getAccountFunds(req.user._id);
    return successResponse(res, { funds }, "Account funds retrieved.");
  } catch (err) {
    next(err);
  }
}

export async function deposit(req, res, next) {
  try {
    const { amount, mode } = req.body;
    const result = await accountService.depositFunds(req.user._id, { amount, mode });
    return successResponse(res, result, `Successfully added ₹${amount} demo funds.`, 201);
  } catch (err) {
    next(err);
  }
}

export async function withdraw(req, res, next) {
  try {
    const { amount, mode } = req.body;
    const result = await accountService.withdrawFunds(req.user._id, { amount, mode });
    return successResponse(res, result, `Successfully processed withdrawal of ₹${amount}.`, 201);
  } catch (err) {
    next(err);
  }
}
