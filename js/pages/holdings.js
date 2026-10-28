/**
 * TradeNest Holdings Page Logic
 * Renders portfolio holdings table, summary metrics, search & sector filters, Add/Exit actions, and CSV download
 * Integrated with TradeNest Backend Holdings REST API
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";
import { holdingsAPI } from "../utils/api.js";
import { openOrderModal } from "../components/orderModal.js";
import { showToast } from "../components/toast.js";

let searchQuery = "";
let selectedSector = "ALL";
let loadedHoldings = [];
let loadedSummary = null;

export function initHoldingsPage() {
  initTradingNav("holdings");
  initWatchlist("#watchlist-sidebar");

  loadHoldingsData();
  attachHoldingsEvents();

  window.addEventListener("tradenest:orderPlaced", () => {
    loadHoldingsData();
  });
}

async function loadHoldingsData() {
  try {
    const data = await holdingsAPI.getHoldings();
    loadedHoldings = data.holdings || [];
    loadedSummary = data.summary;
    renderHoldings();
  } catch (err) {
    const tbody = document.getElementById("holdings-table-body");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding:24px;color:var(--text-muted);">Failed to load holdings from backend. Please log in.</td></tr>`;
    }
  }
}

function renderHoldings() {
  const tbody = document.getElementById("holdings-table-body");
  const emptyState = document.getElementById("holdings-empty-state");
  const tableContainer = document.getElementById("holdings-table-container");

  if (!tbody) return;

  const totalInvestment = loadedSummary?.totalInvestment || 0;
  const currentValue = loadedSummary?.currentPortfolioValue || 0;
  const totalPnL = loadedSummary?.totalPnL || 0;
  const pnlPercent = loadedSummary?.totalReturnPercentage || 0;
  const dayPnL = currentValue * 0.008; // Simulated day move (~0.8%)

  const totalInvElem = document.getElementById("holdings-total-investment");
  const curValElem = document.getElementById("holdings-current-value");
  const pnlElem = document.getElementById("holdings-total-pnl");
  const dayPnLElem = document.getElementById("holdings-day-pnl");

  if (totalInvElem) totalInvElem.textContent = formatCurrency(totalInvestment);
  if (curValElem) curValElem.textContent = formatCurrency(currentValue);

  if (pnlElem) {
    pnlElem.textContent = `${totalPnL >= 0 ? "+" : ""}${formatCurrency(totalPnL)} (${formatPercent(pnlPercent)})`;
    pnlElem.className = `trading-stat-large ${totalPnL >= 0 ? "text-up" : "text-down"}`;
  }

  if (dayPnLElem) {
    dayPnLElem.textContent = `+${formatCurrency(dayPnL)}`;
    dayPnLElem.className = "trading-stat-large text-up";
  }

  // Filter items
  let filtered = loadedHoldings;
  if (selectedSector !== "ALL") {
    filtered = filtered.filter(h => h.sector === selectedSector);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toUpperCase();
    filtered = filtered.filter(h => h.symbol.includes(q) || (h.name && h.name.toUpperCase().includes(q)));
  }

  if (filtered.length === 0) {
    if (tableContainer) tableContainer.style.display = "none";
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💼</div>
          <div class="empty-state-title">No holdings found</div>
          <div class="empty-state-desc">You don't have any matching shares in your demo portfolio. Use the Watchlist on the left to buy delivery stocks.</div>
        </div>
      `;
    }
    return;
  }

  if (tableContainer) tableContainer.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = filtered.map(item => {
    const pnl = item.pnl || 0;
    const isProfit = pnl >= 0;
    const colorClass = isProfit ? "text-up" : "text-down";
    const sign = isProfit ? "+" : "";

    return `
      <tr>
        <td>
          <a href="./stock-details.html?symbol=${item.symbol}" style="font-weight: 600; color: var(--text-main);">
            ${item.symbol}
          </a>
          <div style="font-size: 11px; color: var(--text-muted);">${item.name || item.symbol}</div>
        </td>
        <td class="text-right mono">${item.quantity}</td>
        <td class="text-right mono">${formatCurrency(item.averagePrice)}</td>
        <td class="text-right mono">${formatCurrency(item.currentPrice)}</td>
        <td class="text-right mono">${formatCurrency(item.investmentValue)}</td>
        <td class="text-right mono text-bold">${formatCurrency(item.currentValue)}</td>
        <td class="text-right mono ${colorClass} text-bold">
          ${sign}${formatCurrency(pnl)}
        </td>
        <td class="text-right mono ${colorClass}">
          ${formatPercent(item.returnPercentage)}
        </td>
        <td class="text-right">
          <button type="button" class="btn btn-outline btn-xs btn-add-more" data-symbol="${item.symbol}" title="Buy more ${item.symbol}">Add</button>
          <button type="button" class="btn btn-outline btn-xs btn-exit-holding" data-symbol="${item.symbol}" title="Sell ${item.symbol}" style="color:var(--color-down);margin-left:4px;">Exit</button>
        </td>
      </tr>
    `;
  }).join("");

  // Attach Add / Exit handlers
  tbody.querySelectorAll(".btn-add-more").forEach(btn => {
    btn.addEventListener("click", () => {
      openOrderModal({ symbol: btn.dataset.symbol, mode: "BUY" });
    });
  });

  tbody.querySelectorAll(".btn-exit-holding").forEach(btn => {
    btn.addEventListener("click", () => {
      openOrderModal({ symbol: btn.dataset.symbol, mode: "SELL" });
    });
  });
}

function attachHoldingsEvents() {
  const searchInput = document.getElementById("holdings-search");
  const sectorFilter = document.getElementById("holdings-sector-filter");
  const downloadBtn = document.getElementById("btn-download-holdings-csv");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderHoldings();
    });
  }

  if (sectorFilter) {
    sectorFilter.addEventListener("change", (e) => {
      selectedSector = e.target.value;
      renderHoldings();
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (loadedHoldings.length === 0) {
        showToast("No holdings to export", "info");
        return;
      }
      exportHoldingsCSV(loadedHoldings);
    });
  }
}

function exportHoldingsCSV(holdings) {
  const headers = ["Symbol", "Company", "Quantity", "Average Price", "LTP", "Investment Value", "Current Value", "P&L", "Return %"];
  const rows = holdings.map(h => [
    h.symbol,
    `"${h.name || h.symbol}"`,
    h.quantity,
    h.averagePrice,
    h.currentPrice,
    h.investmentValue,
    h.currentValue,
    h.pnl,
    `${h.returnPercentage}%`
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `TradeNest_Holdings_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Holdings CSV downloaded successfully", "success");
}
