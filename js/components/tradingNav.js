/**
 * TradeNest Trading Top Navigation Component
 * Top bar with live market ticker, section links with count badges, and user profile menu
 * Integrated with backend authentication, logout, and Socket.IO market tick
 */

import { MOCK_INDICES, USER_PROFILE } from "../data/mockData.js";
import { formatNumber, formatPercent } from "../utils/formatters.js";
import { authAPI, ordersAPI, holdingsAPI, positionsAPI, initRealtimeSocket, getStoredUser } from "../utils/api.js";
import { showToast } from "./toast.js";

let liveIndices = [...MOCK_INDICES];

export async function initTradingNav(activePage = "dashboard") {
  const topbar = document.getElementById("trading-topbar");
  if (!topbar) return;

  // Attempt to fetch current user profile from backend or local session
  let currentUser = getStoredUser() || USER_PROFILE;
  try {
    const me = await authAPI.getMe().catch(() => null);
    if (me) currentUser = me;
  } catch (e) {
    // Graceful fallback to stored user
  }

  const userInitials = (currentUser.name || "AM")
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  topbar.innerHTML = `
    <!-- Topbar Left: Brand & Market Ticker -->
    <div class="topbar-left">
      <button type="button" class="toggle-watchlist-mobile" id="mobile-watchlist-toggle" aria-label="Toggle Watchlist">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <span>Watchlist</span>
      </button>

      <a href="./dashboard.html" class="topbar-brand" title="TradeNest Dashboard">
        <div class="brand-icon-sm">TN</div>
        <span>Trade<span style="color:var(--color-accent);">Nest</span></span>
      </a>

      <div class="topbar-ticker" id="topbar-ticker-indices">
        ${renderTickerIndices()}
      </div>
    </div>

    <!-- Topbar Right: Navigation Links & User Menu -->
    <div class="topbar-right">
      <nav class="trading-nav-links" aria-label="Trading Navigation">
        <a href="./dashboard.html" class="trading-nav-link ${activePage === "dashboard" ? "active" : ""}">
          <span class="nav-text">Dashboard</span>
        </a>
        <a href="./orders.html" class="trading-nav-link ${activePage === "orders" ? "active" : ""}">
          <span class="nav-text">Orders</span>
          <span class="nav-count-badge" id="nav-badge-orders">0</span>
        </a>
        <a href="./holdings.html" class="trading-nav-link ${activePage === "holdings" ? "active" : ""}">
          <span class="nav-text">Holdings</span>
          <span class="nav-count-badge" id="nav-badge-holdings">0</span>
        </a>
        <a href="./positions.html" class="trading-nav-link ${activePage === "positions" ? "active" : ""}">
          <span class="nav-text">Positions</span>
          <span class="nav-count-badge" id="nav-badge-positions">0</span>
        </a>
        <a href="./funds.html" class="trading-nav-link ${activePage === "funds" ? "active" : ""}">
          <span class="nav-text">Funds</span>
        </a>
        <a href="./apps.html" class="trading-nav-link ${activePage === "apps" ? "active" : ""}">
          <span class="nav-text">Apps</span>
        </a>
      </nav>

      <!-- User Profile Menu -->
      <div class="user-menu-wrapper">
        <button type="button" class="user-profile-trigger" id="user-profile-trigger" aria-expanded="false" aria-haspopup="true">
          <div class="user-avatar-sm">${userInitials}</div>
          <span>${currentUser.clientId || "TN1024"}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div class="user-dropdown-panel" id="user-dropdown-panel">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${currentUser.name || "Alex Morgan"}</div>
            <div class="user-dropdown-id">${currentUser.clientId || "TN1024"} • ${currentUser.email || "alex@tradenest.io"}</div>
          </div>
          <div class="user-dropdown-items">
            <a href="./profile.html">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profile & Settings
            </a>
            <a href="./funds.html">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
              Funds & Margin
            </a>
            <a href="./apps.html">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Tools & API Console
            </a>
            <div class="user-dropdown-divider"></div>
            <a href="./index.html">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              TradeNest Home
            </a>
            <div class="user-dropdown-divider"></div>
            <a href="#" id="nav-logout-btn" style="color: var(--color-down);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  attachNavEvents();
  refreshBadges();

  // Connect WebSocket for real-time market updates
  initRealtimeSocket(handleRealtimeMarketTick);
}

function renderTickerIndices() {
  return liveIndices.map(idx => {
    const isPositive = idx.change >= 0;
    const colorClass = isPositive ? "text-up" : "text-down";
    const sign = isPositive ? "+" : "";
    return `
      <div class="ticker-item-compact">
        <span class="ticker-symbol">${idx.symbol}</span>
        <span class="ticker-price ${colorClass}">${formatNumber(idx.value, 2)}</span>
        <span class="ticker-diff ${colorClass}">${sign}${idx.change.toFixed(2)} (${formatPercent(idx.changePercent)})</span>
      </div>
    `;
  }).join("");
}

function handleRealtimeMarketTick(payload) {
  if (!payload || !payload.stocks) return;

  // Update simulated NIFTY index slightly based on weighted basket move
  const niftyIdx = liveIndices.find(i => i.symbol === "NIFTY 50");
  if (niftyIdx) {
    const avgChange = payload.stocks.reduce((acc, s) => acc + s.changePercent, 0) / payload.stocks.length;
    niftyIdx.changePercent = Math.round(avgChange * 100) / 100;
    niftyIdx.change = Math.round((niftyIdx.value * (avgChange / 100)) * 100) / 100;
    const tickerContainer = document.getElementById("topbar-ticker-indices");
    if (tickerContainer) {
      tickerContainer.innerHTML = renderTickerIndices();
    }
  }

  // Dispatch custom window event so pages (watchlist, stock-details, dashboard) can react
  window.dispatchEvent(new CustomEvent("tradenest:marketTick", { detail: payload }));
}

async function refreshBadges() {
  try {
    const [ordersRes, holdingsRes, positionsRes] = await Promise.allSettled([
      ordersAPI.getOrders({ limit: 1 }),
      holdingsAPI.getHoldings(),
      positionsAPI.getPositions()
    ]);

    const ordersBadge = document.getElementById("nav-badge-orders");
    const holdingsBadge = document.getElementById("nav-badge-holdings");
    const positionsBadge = document.getElementById("nav-badge-positions");

    if (ordersBadge && ordersRes.status === "fulfilled") {
      ordersBadge.textContent = ordersRes.value.pagination?.total || 0;
    }
    if (holdingsBadge && holdingsRes.status === "fulfilled") {
      holdingsBadge.textContent = holdingsRes.value.summary?.holdingsCount || 0;
    }
    if (positionsBadge && positionsRes.status === "fulfilled") {
      positionsBadge.textContent = positionsRes.value.summary?.openCount || 0;
    }
  } catch (err) {
    // Non-critical badge update failure
  }
}

function attachNavEvents() {
  const trigger = document.getElementById("user-profile-trigger");
  const panel = document.getElementById("user-dropdown-panel");
  const mobileToggle = document.getElementById("mobile-watchlist-toggle");
  const watchlistSidebar = document.getElementById("watchlist-sidebar");
  const logoutBtn = document.getElementById("nav-logout-btn");

  if (trigger && panel) {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", isOpen);
    });

    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && !trigger.contains(e.target)) {
        panel.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await authAPI.logout();
        showToast("Logged out successfully.", "info");
      } catch (err) {
        // proceed
      }
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 500);
    });
  }

  if (mobileToggle && watchlistSidebar) {
    mobileToggle.addEventListener("click", () => {
      watchlistSidebar.classList.toggle("is-open");
    });
  }

  // Reactive badge updates on order placement
  window.addEventListener("tradenest:orderPlaced", () => {
    refreshBadges();
  });
}
