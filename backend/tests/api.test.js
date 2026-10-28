import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { seedStocksIfEmpty } from "../src/services/market.service.js";
import { User } from "../src/models/User.js";
import { Account } from "../src/models/Account.js";
import { Order } from "../src/models/Order.js";
import { Holding } from "../src/models/Holding.js";
import { Watchlist } from "../src/models/Watchlist.js";
import { Transaction } from "../src/models/Transaction.js";

const TEST_DB_URI = "mongodb://127.0.0.1:27017/tradenest_test";

describe("TradeNest Phase 3 Backend Test Suite", () => {
  let user1Token = "";
  let user1Id = "";
  let user1Email = `trader_${Date.now()}@example.com`;
  let user2Token = "";
  let user2Id = "";
  let user2Email = `trader2_${Date.now()}@example.com`;

  before(async () => {
    await connectDatabase(TEST_DB_URI);
    await seedStocksIfEmpty();
  });

  after(async () => {
    // Clean up test database collections
    await User.deleteMany({ email: { $in: [user1Email, user2Email] } });
    if (user1Id) {
      await Account.deleteMany({ user: { $in: [user1Id, user2Id] } });
      await Order.deleteMany({ user: { $in: [user1Id, user2Id] } });
      await Holding.deleteMany({ user: { $in: [user1Id, user2Id] } });
      await Watchlist.deleteMany({ user: { $in: [user1Id, user2Id] } });
      await Transaction.deleteMany({ user: { $in: [user1Id, user2Id] } });
    }
    await disconnectDatabase();
  });

  // 1. Health check
  test("GET /api/health returns service status", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
  });

  // 2. User registration
  test("POST /api/v1/auth/register registers a new user with demo account", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test Trader",
        email: user1Email,
        password: "securePassword123",
        phone: "9876543210"
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.user.clientId);
    assert.equal(res.body.data.user.email, user1Email);
    assert.equal(res.body.data.account.availableCash, 175000);

    user1Token = res.body.data.token;
    user1Id = res.body.data.user.id;
  });

  // 3. Duplicate registration rejection
  test("POST /api/v1/auth/register rejects duplicate email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Duplicate Trader",
        email: user1Email,
        password: "anotherPassword"
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  // 4. Login success & failure
  test("POST /api/v1/auth/login succeeds with valid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        identifier: user1Email,
        password: "securePassword123"
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
  });

  test("POST /api/v1/auth/login fails with incorrect password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        identifier: user1Email,
        password: "wrongPassword"
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 5. Protected route authentication
  test("GET /api/v1/auth/me rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    assert.equal(res.status, 401);
  });

  test("GET /api/v1/auth/me allows authenticated user", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.email, user1Email);
  });

  // Register second user for data isolation testing
  test("Register second user for isolation tests", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "User Two",
        email: user2Email,
        password: "userTwoPass123"
      });

    assert.equal(res.status, 201);
    user2Token = res.body.data.token;
    user2Id = res.body.data.user.id;
  });

  // 6. Market catalogue
  test("GET /api/v1/market/stocks returns active stock catalogue", async () => {
    const res = await request(app).get("/api/v1/market/stocks");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.stocks));
    assert.ok(res.body.data.stocks.length >= 10);
  });

  test("GET /api/v1/market/stocks/:symbol returns specific stock with depth", async () => {
    const res = await request(app).get("/api/v1/market/stocks/RELIANCE");
    assert.equal(res.status, 200);
    assert.equal(res.body.data.stock.symbol, "RELIANCE");
    assert.ok(res.body.data.stock.depth.bids.length > 0);
  });

  // 7. Watchlist operations & isolation
  test("POST /api/v1/watchlist adds stock and isolates per user", async () => {
    // Add WIPRO to user1's watchlist
    const addRes = await request(app)
      .post("/api/v1/watchlist")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ symbol: "WIPRO", basketId: 1 });

    assert.equal(addRes.status, 200);
    assert.ok(addRes.body.data.symbols.includes("WIPRO"));

    // User2's watchlist basket 1 should NOT be modified
    const u2Res = await request(app)
      .get("/api/v1/watchlist?basketId=1")
      .set("Authorization", `Bearer ${user2Token}`);

    assert.equal(u2Res.status, 200);
    assert.equal(u2Res.body.data.symbols.includes("WIPRO"), false);
  });

  test("DELETE /api/v1/watchlist/:symbol removes stock", async () => {
    const res = await request(app)
      .delete("/api/v1/watchlist/WIPRO?basketId=1")
      .set("Authorization", `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.symbols.includes("WIPRO"), false);
  });

  // 8. Simulated Trading: Buy execution & validation
  test("POST /api/v1/orders executes market BUY atomically", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        symbol: "INFY",
        type: "BUY",
        product: "CNC",
        orderType: "MARKET",
        quantity: 10
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.order.symbol, "INFY");
    assert.equal(res.body.data.order.status, "COMPLETE");
    assert.equal(res.body.data.order.filledQty, 10);
    assert.ok(res.body.data.order.executionPrice > 0);
  });

  test("POST /api/v1/orders rejects BUY when quantity exceeds available cash", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        symbol: "RELIANCE",
        type: "BUY",
        product: "CNC",
        orderType: "MARKET",
        quantity: 1000 // Requires ~₹29 Lakhs, account only has ₹1.75 Lakhs
      });

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes("Insufficient"));
  });

  // 9. Holdings & Cash deduction verification
  test("GET /api/v1/holdings reflects updated stock holding and cash", async () => {
    const res = await request(app)
      .get("/api/v1/holdings")
      .set("Authorization", `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.holdings.length, 1);
    assert.equal(res.body.data.holdings[0].symbol, "INFY");
    assert.equal(res.body.data.holdings[0].quantity, 10);
    assert.ok(res.body.data.summary.totalInvestment > 0);
  });

  // 10. Simulated Trading: Sell execution & validation
  test("POST /api/v1/orders rejects SELL when user does not own enough shares", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        symbol: "INFY",
        type: "SELL",
        product: "CNC",
        orderType: "MARKET",
        quantity: 50 // User only owns 10
      });

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes("Insufficient holdings"));
  });

  test("POST /api/v1/orders executes SELL successfully for held shares", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        symbol: "INFY",
        type: "SELL",
        product: "CNC",
        orderType: "MARKET",
        quantity: 5
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.order.status, "COMPLETE");
    assert.equal(res.body.data.order.filledQty, 5);

    // Verify holding was reduced from 10 to 5
    const holdingRes = await request(app)
      .get("/api/v1/holdings")
      .set("Authorization", `Bearer ${user1Token}`);

    assert.equal(holdingRes.body.data.holdings[0].quantity, 5);
  });

  // 11. Idempotency test
  test("Duplicate order with identical Idempotency-Key returns existing order without double-executing", async () => {
    const key = `idem_${Date.now()}`;
    const firstRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${user1Token}`)
      .set("Idempotency-Key", key)
      .send({
        symbol: "INFY",
        type: "BUY",
        product: "CNC",
        quantity: 1
      });

    assert.equal(firstRes.status, 201);
    const orderId = firstRes.body.data.order._id;

    // Send second request with same key
    const secondRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${user1Token}`)
      .set("Idempotency-Key", key)
      .send({
        symbol: "INFY",
        type: "BUY",
        product: "CNC",
        quantity: 1
      });

    assert.equal(secondRes.body.data.order._id, orderId);
  });

  // 12. Dashboard summary calculation
  test("GET /api/v1/dashboard/summary calculates accurate metrics", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/summary")
      .set("Authorization", `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.account);
    assert.ok(res.body.data.portfolio);
    assert.ok(res.body.data.portfolio.totalInvestment > 0);
    assert.ok(res.body.data.portfolio.currentPortfolioValue > 0);
  });

  // 13. Performance chart time series
  test("GET /api/v1/dashboard/performance returns series data", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/performance?timeframe=1M")
      .set("Authorization", `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.timeframe, "1M");
    assert.ok(Array.isArray(res.body.data.data));
    assert.ok(res.body.data.data.length > 0);
  });

  // 14. Funds deposit and withdrawal
  test("POST /api/v1/account/deposits increases available margin", async () => {
    const fundsBefore = await request(app)
      .get("/api/v1/account/funds")
      .set("Authorization", `Bearer ${user1Token}`);

    const initialCash = fundsBefore.body.data.funds.availableCash;

    const res = await request(app)
      .post("/api/v1/account/deposits")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ amount: 10000, mode: "UPI (Simulated)" });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.account.availableCash, initialCash + 10000);
  });

  test("POST /api/v1/account/withdrawals rejects amount exceeding available cash", async () => {
    const res = await request(app)
      .post("/api/v1/account/withdrawals")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ amount: 500000 }); // Exceeds balance of ~₹1.8L

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes("Insufficient"));
  });

  // 15. Cross-user data isolation
  test("User2 cannot access User1's orders or transactions", async () => {
    // User1 places an order
    const u1Orders = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${user1Token}`);

    const u1OrderId = u1Orders.body.data.orders[0]._id;

    // User2 tries to fetch User1's order by ID
    const crossAccessRes = await request(app)
      .get(`/api/v1/orders/${u1OrderId}`)
      .set("Authorization", `Bearer ${user2Token}`);

    assert.equal(crossAccessRes.status, 404);
  });
});
