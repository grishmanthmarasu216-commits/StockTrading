import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tradenest",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim())
    : [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000"
      ],
  JWT_SECRET: process.env.JWT_SECRET || "tradenest_super_secure_jwt_secret_dev_key_2026_random_string",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true",
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || "lax",
  SIMULATE_MARKET: process.env.SIMULATE_MARKET !== "false",
  SIMULATE_INTERVAL_MS: parseInt(process.env.SIMULATE_INTERVAL_MS, 10) || 3000
};
