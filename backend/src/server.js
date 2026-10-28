import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { ENV } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { seedStocksIfEmpty } from "./services/market.service.js";
import { initSocketIO, stopMarketSimulation } from "./sockets/market.socket.js";

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || ENV.CLIENT_ORIGIN.includes(origin) || ENV.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true
  }
});

initSocketIO(io);

async function startServer() {
  try {
    // 1. Connect MongoDB
    await connectDatabase();

    // 2. Ensure initial reference stocks exist (idempotent)
    await seedStocksIfEmpty();

    // 3. Listen on configured port
    server.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 TradeNest Backend running on http://localhost:${ENV.PORT}`);
      console.log(`📡 WebSocket server active with Socket.IO`);
      console.log(`🌐 Frontend accessible directly at http://localhost:${ENV.PORT}/`);
      console.log(`⚙️  Environment: ${ENV.NODE_ENV}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error("[Server] Fatal startup error:", error);
    process.exit(1);
  }
}

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  stopMarketSimulation();
  server.close(async () => {
    console.log("[Server] HTTP and Socket server closed.");
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

startServer();
