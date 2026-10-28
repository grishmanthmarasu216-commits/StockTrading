import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { Stock } from "../models/Stock.js";
import { User } from "../models/User.js";
import { Account } from "../models/Account.js";
import { Watchlist } from "../models/Watchlist.js";
import { Holding } from "../models/Holding.js";
import { SEED_STOCKS_DATA } from "../services/market.service.js";

async function seedData() {
  console.log("==========================================");
  console.log("🌱 TradeNest Idempotent Database Seed Script");
  console.log("==========================================");

  await connectDatabase();

  try {
    // 1. Seed or Upsert Stocks (no duplicates)
    console.log(`[Seed] Processing ${SEED_STOCKS_DATA.length} reference stocks...`);
    let stocksInserted = 0;
    let stocksUpdated = 0;

    for (const stockData of SEED_STOCKS_DATA) {
      const res = await Stock.updateOne(
        { symbol: stockData.symbol },
        {
          $setOnInsert: {
            symbol: stockData.symbol,
            name: stockData.name,
            exchange: stockData.exchange,
            price: stockData.price,
            previousClose: stockData.previousClose,
            change: stockData.change,
            changePercent: stockData.changePercent,
            open: stockData.open,
            high: stockData.high,
            low: stockData.low,
            close: stockData.close,
            volume: stockData.volume,
            w52High: stockData.w52High,
            w52Low: stockData.w52Low,
            marketCap: stockData.marketCap,
            pe: stockData.pe,
            sector: stockData.sector,
            depth: stockData.depth,
            isActive: true
          }
        },
        { upsert: true }
      );

      if (res.upsertedCount > 0) stocksInserted++;
      else stocksUpdated++;
    }

    console.log(`[Seed] Stocks: ${stocksInserted} created, ${stocksUpdated} already present.`);

    // 2. Ensure standard Demo User (TN1024 / alex@tradenest.io)
    const demoEmail = "alex@tradenest.io";
    const demoClientId = "TN1024";

    let demoUser = await User.findOne({
      $or: [{ email: demoEmail }, { clientId: demoClientId }]
    });

    if (!demoUser) {
      console.log("[Seed] Creating default demonstration user (TN1024)...");
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("demo1234", salt);

      demoUser = await User.create({
        name: "Alex Morgan",
        email: demoEmail,
        clientId: demoClientId,
        passwordHash,
        pin: "123456",
        phone: "9876543210",
        status: "ACTIVE"
      });

      // Demo cash account
      await Account.create({
        user: demoUser._id,
        currency: "INR",
        openingBalance: 175000.00,
        availableCash: 142850.00,
        usedMargin: 32150.00
      });

      // Default Watchlists (1..5)
      const baskets = {
        1: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS", "ICICIBANK", "ITC"],
        2: ["INFY", "TCS", "WIPRO"],
        3: ["HDFCBANK", "ICICIBANK", "SBIN"],
        4: ["TATAMOTORS", "BHARTIARTL", "RELIANCE"],
        5: ["ITC", "SBIN", "WIPRO", "HDFCBANK"]
      };

      for (let b = 1; b <= 5; b++) {
        await Watchlist.create({
          user: demoUser._id,
          basketId: b,
          symbols: baskets[b]
        });
      }

      // Initial demo holdings matching Phase 1/2 demo portfolio
      const relianceStock = await Stock.findOne({ symbol: "RELIANCE" });
      const infyStock = await Stock.findOne({ symbol: "INFY" });
      const tcsStock = await Stock.findOne({ symbol: "TCS" });

      if (relianceStock) {
        await Holding.create({
          user: demoUser._id,
          stock: relianceStock._id,
          symbol: "RELIANCE",
          quantity: 20,
          averagePrice: 2850.00
        });
      }

      if (infyStock) {
        await Holding.create({
          user: demoUser._id,
          stock: infyStock._id,
          symbol: "INFY",
          quantity: 30,
          averagePrice: 1780.00
        });
      }

      if (tcsStock) {
        await Holding.create({
          user: demoUser._id,
          stock: tcsStock._id,
          symbol: "TCS",
          quantity: 10,
          averagePrice: 4050.00
        });
      }

      console.log(`[Seed] Demo account created: User ID: ${demoClientId} • Password: demo1234 • PIN: 123456`);
    } else {
      console.log(`[Seed] Demo user ${demoClientId} already exists. Preserving user state without overwrite.`);
    }

    console.log("==========================================");
    console.log("✅ Database seeding completed successfully.");
    console.log("==========================================");
  } catch (error) {
    console.error("[Seed] Seeding failed with error:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

seedData();
