import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import marketRoutes from "./routes/market.routes.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
import orderRoutes from "./routes/order.routes.js";
import holdingRoutes from "./routes/holding.routes.js";
import positionRoutes from "./routes/position.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../../");

export const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Chart.js and CDNs without header restrictions
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration with credentials support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, or same-origin)
      if (!origin || ENV.CLIENT_ORIGIN.includes(origin) || ENV.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not permitted by CORS policy.`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-Requested-With"]
  })
);

// Parsers
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TradeNest API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// REST API v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/market", marketRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/holdings", holdingRoutes);
app.use("/api/v1/positions", positionRoutes);
app.use("/api/v1/account", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Serve static frontend files for unified single-server deployment
app.use(express.static(frontendDir));

// Fallback 404 for unmatched API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);
