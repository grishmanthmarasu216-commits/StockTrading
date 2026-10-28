import { runMarketTick } from "../services/market.service.js";
import { ENV } from "../config/env.js";

let ioInstance = null;
let simulationInterval = null;

export function initSocketIO(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    // Optional user room subscription if client passes token or userId in auth/query
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("subscribe:stock", (symbol) => {
      if (symbol && typeof symbol === "string") {
        socket.join(`stock:${symbol.toUpperCase()}`);
      }
    });

    socket.on("unsubscribe:stock", (symbol) => {
      if (symbol && typeof symbol === "string") {
        socket.leave(`stock:${symbol.toUpperCase()}`);
      }
    });

    socket.on("disconnect", () => {
      // Socket.IO automatically cleans up rooms on disconnect
    });
  });

  // Start the SINGLETON managed server-side market simulation loop
  if (ENV.SIMULATE_MARKET && !simulationInterval) {
    console.log(`[MarketSocket] Starting server-side market simulation loop (Interval: ${ENV.SIMULATE_INTERVAL_MS}ms)`);
    simulationInterval = setInterval(async () => {
      try {
        const updatedStocks = await runMarketTick();
        if (updatedStocks.length > 0 && ioInstance) {
          // Broadcast full market tick to all connected clients
          ioInstance.emit("market:tick", {
            timestamp: new Date().toISOString(),
            stocks: updatedStocks
          });

          // Also emit to per-stock individual rooms for granular listeners
          for (const stock of updatedStocks) {
            ioInstance.to(`stock:${stock.symbol}`).emit("stock:update", stock);
          }
        }
      } catch (err) {
        console.error("[MarketSocket] Simulation loop tick failed:", err.message);
      }
    }, ENV.SIMULATE_INTERVAL_MS);
  }

  return io;
}

export function notifyUser(userId, eventName, payload) {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId}`).emit(eventName, payload);
  }
}

export function stopMarketSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log("[MarketSocket] Market simulation loop stopped.");
  }
}
