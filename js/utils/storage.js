/**
 * TradeNest Storage Utility
 * Manages simulated persistence using browser localStorage with fallback to mock data
 */

import {
  MOCK_WATCHLIST_BASKETS,
  INITIAL_HOLDINGS,
  INITIAL_POSITIONS,
  INITIAL_ORDERS,
  INITIAL_FUNDS,
  MOCK_STOCKS
} from "../data/mockData.js";

const KEYS = {
  WATCHLIST: "tradenest_watchlist_baskets",
  HOLDINGS: "tradenest_holdings",
  POSITIONS: "tradenest_positions",
  ORDERS: "tradenest_orders",
  FUNDS: "tradenest_funds",
  THEME: "tradenest_theme",
  USER_LOGGED_IN: "tradenest_auth"
};

/**
 * Safely parse JSON from localStorage
 */
function safeGet(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultVal;
  }
}

/**
 * Safely write JSON to localStorage
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

// Watchlist API
export function getWatchlistBasket(basketId = 1) {
  const allBaskets = safeGet(KEYS.WATCHLIST, MOCK_WATCHLIST_BASKETS);
  return allBaskets[basketId] || [];
}

export function addToWatchlist(symbol, basketId = 1) {
  const allBaskets = safeGet(KEYS.WATCHLIST, MOCK_WATCHLIST_BASKETS);
  const current = allBaskets[basketId] || [];
  if (!current.includes(symbol)) {
    allBaskets[basketId] = [...current, symbol];
    safeSet(KEYS.WATCHLIST, allBaskets);
  }
  return allBaskets[basketId];
}

export function removeFromWatchlist(symbol, basketId = 1) {
  const allBaskets = safeGet(KEYS.WATCHLIST, MOCK_WATCHLIST_BASKETS);
  const current = allBaskets[basketId] || [];
  allBaskets[basketId] = current.filter(s => s !== symbol);
  safeSet(KEYS.WATCHLIST, allBaskets);
  return allBaskets[basketId];
}

// Holdings API
export function getHoldings() {
  return safeGet(KEYS.HOLDINGS, INITIAL_HOLDINGS);
}

export function saveHoldings(holdings) {
  safeSet(KEYS.HOLDINGS, holdings);
}

// Positions API
export function getPositions() {
  return safeGet(KEYS.POSITIONS, INITIAL_POSITIONS);
}

export function savePositions(positions) {
  safeSet(KEYS.POSITIONS, positions);
}

// Orders API
export function getOrders() {
  return safeGet(KEYS.ORDERS, INITIAL_ORDERS);
}

export function saveOrders(orders) {
  safeSet(KEYS.ORDERS, orders);
}

// Funds API
export function getFunds() {
  return safeGet(KEYS.FUNDS, INITIAL_FUNDS);
}

export function saveFunds(funds) {
  safeSet(KEYS.FUNDS, funds);
}

/**
 * Process a new simulated order:
 * 1. Appends order to Orders list
 * 2. Updates Holdings (if CNC) or Positions (if MIS)
 * 3. Updates available funds / used margin
 */
export function placeOrder({ symbol, type, product, qty, price, orderType = "MARKET" }) {
  const orders = getOrders();
  const funds = getFunds();
  const holdings = getHoldings();
  const positions = getPositions();

  const stockInfo = MOCK_STOCKS.find(s => s.symbol === symbol) || {
    symbol,
    name: symbol,
    price: price,
    sector: "General"
  };

  const executedPrice = Number(price);
  const quantity = Number(qty);
  const totalValue = executedPrice * quantity;

  // New simulated Order Record
  const newOrder = {
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    time: new Date().toTimeString().split(" ")[0],
    type,
    symbol,
    product,
    qty: quantity,
    filledQty: quantity,
    price: executedPrice,
    status: "COMPLETE"
  };

  orders.unshift(newOrder);
  saveOrders(orders);

  // Update Portfolio based on Product
  if (product === "CNC") {
    // Delivery / Longterm
    const existingIndex = holdings.findIndex(h => h.symbol === symbol);
    if (type === "BUY") {
      if (existingIndex >= 0) {
        const item = holdings[existingIndex];
        const newQty = item.qty + quantity;
        const newAvg = ((item.qty * item.avgPrice) + totalValue) / newQty;
        holdings[existingIndex] = {
          ...item,
          qty: newQty,
          avgPrice: Math.round(newAvg * 100) / 100,
          curPrice: executedPrice
        };
      } else {
        holdings.push({
          symbol,
          name: stockInfo.name,
          qty: quantity,
          avgPrice: executedPrice,
          curPrice: executedPrice,
          sector: stockInfo.sector || "General"
        });
      }
      funds.availableMargin = Math.max(0, funds.availableMargin - totalValue);
      funds.usedMargin += totalValue;
    } else {
      // SELL CNC
      if (existingIndex >= 0) {
        const item = holdings[existingIndex];
        if (item.qty <= quantity) {
          holdings.splice(existingIndex, 1);
        } else {
          item.qty -= quantity;
        }
        funds.availableMargin += totalValue;
        funds.usedMargin = Math.max(0, funds.usedMargin - totalValue);
      }
    }
    saveHoldings(holdings);
  } else {
    // MIS / Intraday (leverage 5x margin)
    const requiredMargin = totalValue * 0.2;
    const existingPos = positions.findIndex(p => p.symbol === symbol && p.product === product);
    const signedQty = type === "BUY" ? quantity : -quantity;

    if (existingPos >= 0) {
      const pos = positions[existingPos];
      pos.qty += signedQty;
      if (pos.qty === 0) {
        pos.status = "CLOSED";
      }
    } else {
      positions.unshift({
        id: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
        product,
        symbol,
        name: stockInfo.name,
        qty: signedQty,
        avgPrice: executedPrice,
        curPrice: executedPrice,
        realizedPnL: 0,
        status: "OPEN"
      });
    }

    funds.availableMargin = Math.max(0, funds.availableMargin - requiredMargin);
    funds.usedMargin += requiredMargin;
    savePositions(positions);
  }

  saveFunds(funds);

  return newOrder;
}

/**
 * Cancel an OPEN order
 */
export function cancelOrder(orderId) {
  const orders = getOrders();
  const target = orders.find(o => o.id === orderId);
  if (target && target.status === "OPEN") {
    target.status = "CANCELLED";
    saveOrders(orders);
    return true;
  }
  return false;
}

/**
 * Add simulated deposit or withdrawal
 */
export function processFundTransaction({ type, amount, mode }) {
  const funds = getFunds();
  const amt = Number(amount);

  if (type === "Deposit") {
    funds.availableMargin += amt;
    funds.payin += amt;
  } else {
    if (funds.availableMargin < amt) {
      throw new Error("Insufficient available margin for withdrawal");
    }
    funds.availableMargin -= amt;
  }

  const txn = {
    id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString().replace("T", " ").substring(0, 16),
    type,
    amount: amt,
    mode: `${mode} (Simulated)`,
    status: "SUCCESS"
  };

  funds.transactions.unshift(txn);
  saveFunds(funds);
  return txn;
}

/**
 * Reset all simulated data to defaults
 */
export function resetDemoData() {
  localStorage.removeItem(KEYS.WATCHLIST);
  localStorage.removeItem(KEYS.HOLDINGS);
  localStorage.removeItem(KEYS.POSITIONS);
  localStorage.removeItem(KEYS.ORDERS);
  localStorage.removeItem(KEYS.FUNDS);
}
