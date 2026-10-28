/**
 * TradeNest Reusable Frontend API Client
 * Provides centralized fetch wrappers, JWT token fallback handling, error normalization, and Socket.IO connection
 */

// Dynamically determine API Base URL:
// If served from Express on port 5000, use origin; otherwise default to http://localhost:5000
const DEFAULT_API_BASE = window.location.port === "5000"
  ? window.location.origin
  : (localStorage.getItem("tradenest_api_base") || "http://localhost:5000");

export const API_BASE = DEFAULT_API_BASE;
export const API_V1 = `${API_BASE}/api/v1`;

const TOKEN_KEY = "tradenest_auth_token";
const USER_KEY = "tradenest_auth_user";

/**
 * Get stored session token (fallback for environments where third-party cookies are blocked)
 */
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Standard HTTP Request Wrapper
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_V1}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: "include" // Always send cookies (for HttpOnly JWT)
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If backend is unreachable, throw informative error
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      console.warn(`[TradeNest API] Backend server unreachable at ${API_BASE}. Ensure backend is running (npm start in backend/).`);
      const error = new Error("Backend server unreachable. Please ensure the TradeNest backend server is running.");
      error.isNetworkError = true;
      throw error;
    }
    throw err;
  }
}

// --- API Sub-modules ---

export const authAPI = {
  async register({ name, email, password, phone }) {
    const res = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone })
    });
    if (res.data?.token) setStoredAuth(res.data.token, res.data.user);
    return res.data;
  },

  async login({ identifier, password }) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password })
    });
    if (res.data?.token) setStoredAuth(res.data.token, res.data.user);
    return res.data;
  },

  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      clearStoredAuth();
    }
  },

  async getMe() {
    const res = await request("/auth/me");
    if (res.data?.user) setStoredAuth(null, res.data.user);
    return res.data.user;
  },

  async forgotPassword(identifier) {
    const res = await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identifier })
    });
    return res.data;
  },

  async resetPassword({ token, newPassword }) {
    const res = await request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword })
    });
    return res;
  }
};

export const marketAPI = {
  async getStocks({ search = "", sector = "" } = {}) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (sector && sector !== "ALL") params.append("sector", sector);
    const qs = params.toString() ? `?${params.toString()}` : "";
    const res = await request(`/market/stocks${qs}`);
    return res.data.stocks || [];
  },

  async getStock(symbol) {
    const res = await request(`/market/stocks/${encodeURIComponent(symbol.toUpperCase())}`);
    return res.data.stock;
  }
};

export const watchlistAPI = {
  async getWatchlist(basketId = 1) {
    const res = await request(`/watchlist?basketId=${basketId}`);
    return res.data;
  },

  async addStock(symbol, basketId = 1) {
    const res = await request("/watchlist", {
      method: "POST",
      body: JSON.stringify({ symbol, basketId })
    });
    return res.data;
  },

  async removeStock(symbol, basketId = 1) {
    const res = await request(`/watchlist/${encodeURIComponent(symbol)}?basketId=${basketId}`, {
      method: "DELETE"
    });
    return res.data;
  }
};

export const ordersAPI = {
  async createOrder({ symbol, type, product, orderType, quantity, price, idempotencyKey }) {
    const headers = {};
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

    const res = await request("/orders", {
      method: "POST",
      headers,
      body: JSON.stringify({ symbol, type, product, orderType, quantity, price })
    });
    return res.data.order;
  },

  async getOrders({ status = "", symbol = "", page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (status && status !== "ALL") params.append("status", status);
    if (symbol) params.append("symbol", symbol);
    params.append("page", page);
    params.append("limit", limit);

    const res = await request(`/orders?${params.toString()}`);
    return res.data;
  },

  async cancelOrder(orderId) {
    const res = await request(`/orders/${orderId}/cancel`, { method: "POST" });
    return res.data.order;
  }
};

export const holdingsAPI = {
  async getHoldings() {
    const res = await request("/holdings");
    return res.data;
  }
};

export const positionsAPI = {
  async getPositions() {
    const res = await request("/positions");
    return res.data;
  }
};

export const accountAPI = {
  async getFunds() {
    const res = await request("/account/funds");
    return res.data.funds;
  },

  async deposit({ amount, mode }) {
    const res = await request("/account/deposits", {
      method: "POST",
      body: JSON.stringify({ amount, mode })
    });
    return res.data;
  },

  async withdraw({ amount, mode }) {
    const res = await request("/account/withdrawals", {
      method: "POST",
      body: JSON.stringify({ amount, mode })
    });
    return res.data;
  },

  async getTransactions({ page = 1, limit = 20, type = "" } = {}) {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    params.append("page", page);
    params.append("limit", limit);

    const res = await request(`/transactions?${params.toString()}`);
    return res.data;
  }
};

export const dashboardAPI = {
  async getSummary() {
    const res = await request("/dashboard/summary");
    return res.data;
  },

  async getPerformance(timeframe = "1M") {
    const res = await request(`/dashboard/performance?timeframe=${timeframe}`);
    return res.data;
  }
};

// --- Real-time Socket.IO Connection ---
let socket = null;

export function getSocket() {
  if (socket) return socket;
  if (typeof window.io === "function") {
    const user = getStoredUser();
    socket = window.io(API_BASE, {
      auth: { userId: user ? user.id : null },
      withCredentials: true,
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("[TradeNest Socket] Connected to real-time market stream");
    });

    socket.on("disconnect", () => {
      console.log("[TradeNest Socket] Disconnected from market stream");
    });
  }
  return socket;
}

export function initRealtimeSocket(onTickCallback) {
  if (window.io) {
    const s = getSocket();
    if (s && onTickCallback) {
      s.off("market:tick"); // Prevent duplicate listeners
      s.on("market:tick", onTickCallback);
    }
    return;
  }

  const script = document.createElement("script");
  script.src = `${API_BASE}/socket.io/socket.io.js`;
  script.onload = () => {
    const s = getSocket();
    if (s && onTickCallback) {
      s.off("market:tick");
      s.on("market:tick", onTickCallback);
    }
  };
  script.onerror = () => {
    const cdn = document.createElement("script");
    cdn.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
    cdn.onload = () => {
      const s = getSocket();
      if (s && onTickCallback) {
        s.off("market:tick");
        s.on("market:tick", onTickCallback);
      }
    };
    document.head.appendChild(cdn);
  };
  document.head.appendChild(script);
}

