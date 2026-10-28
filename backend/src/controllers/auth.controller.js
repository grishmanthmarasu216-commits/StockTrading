import * as authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/formatters.js";
import { ENV } from "../config/env.js";

// Cookie helper
function setAuthCookie(res, token) {
  res.cookie("tradenest_token", token, {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
}

function clearAuthCookie(res) {
  res.clearCookie("tradenest_token", {
    httpOnly: true,
    secure: ENV.COOKIE_SECURE,
    sameSite: ENV.COOKIE_SAME_SITE
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body;
    const result = await authService.registerUser({ name, email, password, phone });

    setAuthCookie(res, result.token);

    return successResponse(
      res,
      result,
      "Registration successful! Your demo trading workspace has been initialized.",
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const result = await authService.loginUser({ identifier, password });

    setAuthCookie(res, result.token);

    return successResponse(res, result, "Login successful. Welcome back to TradeNest!");
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    clearAuthCookie(res);
    return successResponse(res, null, "You have been logged out successfully.");
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    return successResponse(res, { user: req.user.toSafeObject() }, "Current user profile retrieved.");
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return errorResponse(res, "Please provide your Client ID or registered email.", 400);
    }
    const result = await authService.requestPasswordReset(identifier);
    return successResponse(res, result, result.message);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword({ token, newPassword });
    return successResponse(res, null, result.message);
  } catch (err) {
    next(err);
  }
}
