import { ENV } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication session expired. Please log in again.";
  }

  if (statusCode === 500) {
    console.error("[ServerError]", err);
  }

  const response = {
    success: false,
    message
  };

  if (ENV.NODE_ENV === "development" && statusCode === 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}
