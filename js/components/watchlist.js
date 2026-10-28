/**
 * TradeNest Persistent Market Watchlist Component
 * Renders the left-side watchlist sidebar, basket switching, instant search & hover actions
 * Connected to MongoDB Watchlist API and real-time Socket.IO price updates
 */

import { formatCurrency, formatPercent } from "../utils/formatters.js";
import { watchlistAPI, marketAPI } from "../utils/api.js";
import { openOrderModal } from "./orderModal.js";
import { showToast } from "./toast.js";

let activeBasket = 1;
let currentSearchQuery = "";
let currentStocks = [];
let currentSymbols = [];

export function initWatchlist(containerSelector = "#watchlist-sidebar") {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  renderWatchlistStructure(container);
  loadWatchlistData();
  attachWatchlistEvents(container);

  // Listen for real-time market ticks broadcast by Socket.IO
  window.addEventListener("tradenest:marketTick", (e) => {
    handleLiveMarketTick(e.detail?.stocks);
  });
}

function renderWatchlistStructure(container) {
  container.innerHTML = `
    <!-- Watchlist Search -->
    <div class="watchlist-search-box">
      <svg class="watchlist-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input type="text" id="watchlist-search-input" class="watchlist-search-input" placeholder="Search eg: infy, tcs, reliance, sbin..." autocomplete="off">
    </div>

    <!-- Watchlist Count & Indicator -->
    <div class="watchlist-count-bar">
      <span id="watchlist-count-label">Loading items...</span>
      <span class="simulation-pill" style="font-size: 10px;">Simulated NSE</span>
    </div>

    <!-- Stocks List -->
    <ul class="watchlist-items-list" id="watchlist-items-list" role="list">
      <li style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 12px;">Loading watchlist...</li>
    </ul>

    <!-- Bottom Basket Tabs (1, 2, 3, 4, 5) -->
    <div class="watchlist-tabs" id="watchlist-tabs" role="tablist">
      <button class="watchlist-tab-btn active" data-basket="1" role="tab" aria-selected="true">1</button>
      <button class="watchlist-tab-btn" data-basket="2" role="tab" aria-selected="false">2</button>
      <button class="watchlist-tab-btn" data-basket="3" role="tab" aria-selected="false">3</button>
      <button class="watchlist-tab-btn" data-basket="4" role="tab" aria-selected="false">4</button>
      <button class="watchlist-tab-btn" data-basket="5" role="tab" aria-selected="false">5</button>
    </div>
  `;
}

async function loadWatchlistData() {
  try {
    const data = await watchlistAPI.getWatchlist(activeBasket);
    currentStocks = data.stocks || [];
    currentSymbols = data.symbols || [];
    renderWatchlistItems();
  } catch (err) {
    const list = document.getElementById("watchlist-items-list");
    if (list) {
      list.innerHTML = `<li style="padding:24px;text-align:center;color:var(--text-muted);font-size:12px;">Could not load watchlist. Please log in.</li>`;
    }
  }
}

function renderWatchlistItems() {
  const list = document.getElementById("watchlist-items-list");
  const countLabel = document.getElementById("watchlist-count-label");
  if (!list) return;

  list.innerHTML = "";

  if (currentSearchQuery.trim()) {
    // Search mode
    searchAndRender(currentSearchQuery.trim());
    return;
  }

  // Regular Basket mode
  if (countLabel) {
    countLabel.textContent = `${currentStocks.length} / 50 items`;
  }

  if (currentStocks.length === 0) {
    list.innerHTML = `
      <li style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
        <p>This watchlist is empty.</p>
        <p style="font-size: 11px; margin-top: 4px;">Use the search bar above to add stocks to Watchlist ${activeBasket}.</p>
      </li>
    `;
    return;
  }

  currentStocks.forEach(stock => {
    const li = createStockItemDOM(stock, { isSearchMode: false });
    list.appendChild(li);
  });
}

async function searchAndRender(query) {
  const list = document.getElementById("watchlist-items-list");
  const countLabel = document.getElementById("watchlist-count-label");
  if (!list) return;

  list.innerHTML = `<li style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">Searching stocks...</li>`;

  try {
    const matches = await marketAPI.getStocks({ search: query });
    if (countLabel) countLabel.textContent = `${matches.length} search results`;

    if (matches.length === 0) {
      list.innerHTML = `
        <li style="padding: 24px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No stocks found matching "${query}"
        </li>
      `;
      return;
    }

    list.innerHTML = "";
    matches.forEach(stock => {
      const isAlreadyIn = currentSymbols.includes(stock.symbol);
      const li = createStockItemDOM(stock, {
        isSearchMode: true,
        isAlreadyIn
      });
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = `<li style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;">Search error.</li>`;
  }
}

function createStockItemDOM(stock, { isSearchMode = false, isAlreadyIn = false }) {
  const li = document.createElement("li");
  li.className = "watchlist-item";
  li.dataset.symbol = stock.symbol;

  const isPositive = stock.change >= 0;
  const colorClass = isPositive ? "text-up" : "text-down";
  const sign = isPositive ? "+" : "";

  li.innerHTML = `
    <div class="watchlist-item-left">
      <span class="watchlist-symbol">${stock.symbol}</span>
      <span class="watchlist-exchange">${stock.exchange || "NSE"}</span>
    </div>

    <!-- Quick Action Buttons -->
    <div class="watchlist-actions" role="group" aria-label="Quick Actions for ${stock.symbol}">
      <button type="button" class="btn btn-buy btn-xs btn-quick-buy" title="Buy ${stock.symbol}">B</button>
      <button type="button" class="btn btn-sell btn-xs btn-quick-sell" title="Sell ${stock.symbol}">S</button>
      <a href="./stock-details.html?symbol=${stock.symbol}" class="btn btn-outline btn-xs btn-quick-chart" title="View Terminal" style="padding: 0 4px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </a>
      ${isSearchMode
        ? `<button type="button" class="btn btn-outline btn-xs btn-toggle-watch" title="${isAlreadyIn ? "In Watchlist" : "Add to Watchlist"}">${isAlreadyIn ? "✓" : "+"}</button>`
        : `<button type="button" class="btn btn-outline btn-xs btn-remove-watch" title="Remove from Watchlist">&times;</button>`
      }
    </div>

    <div class="watchlist-item-right">
      <span class="watchlist-price ${colorClass}">${formatCurrency(stock.price)}</span>
      <span class="watchlist-change ${colorClass}">${sign}${stock.change ? stock.change.toFixed(2) : "0.00"} (${formatPercent(stock.changePercent)})</span>
    </div>
  `;

  // Attach button event listeners
  const buyBtn = li.querySelector(".btn-quick-buy");
  const sellBtn = li.querySelector(".btn-quick-sell");
  const toggleBtn = li.querySelector(".btn-toggle-watch");
  const removeBtn = li.querySelector(".btn-remove-watch");

  if (buyBtn) {
    buyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openOrderModal({ symbol: stock.symbol, mode: "BUY", price: stock.price });
    });
  }

  if (sellBtn) {
    sellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openOrderModal({ symbol: stock.symbol, mode: "SELL", price: stock.price });
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        await watchlistAPI.addStock(stock.symbol, activeBasket);
        showToast(`Added ${stock.symbol} to Watchlist ${activeBasket}`, "success");
        toggleBtn.textContent = "✓";
        currentSymbols.push(stock.symbol);
      } catch (err) {
        showToast(err.message || "Failed to add to watchlist", "danger");
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      try {
        await watchlistAPI.removeStock(stock.symbol, activeBasket);
        showToast(`Removed ${stock.symbol} from Watchlist ${activeBasket}`, "info");
        currentStocks = currentStocks.filter(s => s.symbol !== stock.symbol);
        currentSymbols = currentSymbols.filter(s => s !== stock.symbol);
        renderWatchlistItems();
      } catch (err) {
        showToast(err.message || "Failed to remove", "danger");
      }
    });
  }

  // Row click navigates to stock details
  li.addEventListener("click", () => {
    window.location.href = `./stock-details.html?symbol=${stock.symbol}`;
  });

  return li;
}

function handleLiveMarketTick(updatedStocks) {
  if (!updatedStocks || !Array.isArray(updatedStocks)) return;

  const stockMap = new Map(updatedStocks.map(s => [s.symbol, s]));

  // Update in-memory current stocks
  currentStocks = currentStocks.map(s => {
    if (stockMap.has(s.symbol)) {
      const updated = stockMap.get(s.symbol);
      return { ...s, price: updated.price, change: updated.change, changePercent: updated.changePercent };
    }
    return s;
  });

  // Dynamically update DOM elements without full re-render
  document.querySelectorAll(".watchlist-item").forEach(li => {
    const sym = li.dataset.symbol;
    if (stockMap.has(sym)) {
      const u = stockMap.get(sym);
      const isPositive = u.change >= 0;
      const colorClass = isPositive ? "text-up" : "text-down";
      const sign = isPositive ? "+" : "";

      const priceElem = li.querySelector(".watchlist-price");
      const changeElem = li.querySelector(".watchlist-change");

      if (priceElem) {
        priceElem.textContent = formatCurrency(u.price);
        priceElem.className = `watchlist-price ${colorClass}`;
      }
      if (changeElem) {
        changeElem.textContent = `${sign}${u.change.toFixed(2)} (${formatPercent(u.changePercent)})`;
        changeElem.className = `watchlist-change ${colorClass}`;
      }
    }
  });
}

function attachWatchlistEvents(container) {
  const searchInput = container.querySelector("#watchlist-search-input");
  const tabBtns = container.querySelectorAll(".watchlist-tab-btn");

  let debounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearchQuery = e.target.value.trim();
        renderWatchlistItems();
      }, 250);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      activeBasket = parseInt(btn.dataset.basket, 10) || 1;
      currentSearchQuery = "";
      if (searchInput) searchInput.value = "";
      loadWatchlistData();
    });
  });
}
