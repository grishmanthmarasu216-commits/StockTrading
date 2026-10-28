import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { User } from "../models/User.js";
import { errorResponse } from "../utils/formatters.js";

export async function authenticate(req, res, next) {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.tradenest_token) {
      token = req.cookies.tradenest_token;
    }
    // 2. Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return errorResponse(res, "Authentication required. Please log in to access this resource.", 401);
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return errorResponse(res, "Invalid authentication credentials.", 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorResponse(res, "User associated with this session no longer exists.", 401);
    }

    if (user.status !== "ACTIVE") {
      return errorResponse(res, "Your account has been suspended. Please contact support.", 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Authentication session expired. Please log in again.", 401);
    }
    return errorResponse(res, "Invalid or corrupt authentication token.", 401);
  }
}
