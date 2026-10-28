import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // Limit each IP to 40 authentication requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes."
  }
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // General API limiter
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "API rate limit exceeded. Please throttle your requests."
  }
});
