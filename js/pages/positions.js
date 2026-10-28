/**
 * TradeNest Positions Page Logic
 * Renders intraday & F&O positions, P&L calculations, square-off actions, and confirmation modals
 * Integrated with TradeNest Backend Positions REST API
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";
import { positionsAPI } from "../utils/api.js";
import { openOrderModal } from "../components/orderModal.js";
import { showToast } from "../components/toast.js";

let loadedPositions = [];
let loadedSummary = null;

export function initPositionsPage() {
  initTradingNav("positions");
  initWatchlist("#watchlist-sidebar");

  loadPositionsData();
  attachPositionsEvents();

  window.addEventListener("tradenest:orderPlaced", () => {
    loadPositionsData();
  });
}

async function loadPositionsData() {
  try {
    const data = await positionsAPI.getPositions();
    loadedPositions = data.positions || [];
    loadedSummary = data.summary;
    renderPositions();
  } catch (err) {
    const tbody = document.getElementById("positions-table-body");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:24px;color:var(--text-muted);">Failed to load positions from backend. Please log in.</td></tr>`;
    }
  }
}

function renderPositions() {
  const openPositions = loadedPositions.filter(p => p.status === "OPEN" && p.quantity !== 0);
  const tbody = document.getElementById("positions-table-body");
  const emptyState = document.getElementById("positions-empty-state");
  const tableContainer = document.getElementById("positions-table-container");

  const totalRealized = loadedSummary?.totalRealized || 0;
  const totalUnrealized = loadedSummary?.totalUnrealized || 0;
  const totalNet = loadedSummary?.totalNet || (totalRealized + totalUnrealized);

  const realElem = document.getElementById("positions-realized-pnl");
  const unrealElem = document.getElementById("positions-unrealized-pnl");
  const netElem = document.getElementById("positions-net-pnl");

  if (realElem) {
    realElem.textContent = `${totalRealized >= 0 ? "+" : ""}${formatCurrency(totalRealized)}`;
    realElem.className = `trading-stat-large ${totalRealized >= 0 ? "text-up" : "text-down"}`;
  }

  if (unrealElem) {
    unrealElem.textContent = `${totalUnrealized >= 0 ? "+" : ""}${formatCurrency(totalUnrealized)}`;
    unrealElem.className = `trading-stat-large ${totalUnrealized >= 0 ? "text-up" : "text-down"}`;
  }

  if (netElem) {
    netElem.textContent = `${totalNet >= 0 ? "+" : ""}${formatCurrency(totalNet)}`;
    netElem.className = `trading-stat-large ${totalNet >= 0 ? "text-up" : "text-down"}`;
  }

  if (!tbody) return;

  if (openPositions.length === 0) {
    if (tableContainer) tableContainer.style.display = "none";
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚡</div>
          <div class="empty-state-title">No open positions</div>
          <div class="empty-state-desc">You don't have any active intraday positions right now. Use the Watchlist on the left to place Intraday MIS trades.</div>
        </div>
      `;
    }
    return;
  }

  if (tableContainer) tableContainer.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = openPositions.map(pos => {
    const isPositive = pos.unrealizedPnL >= 0;
    const colorClass = isPositive ? "text-up" : "text-down";
    const sign = isPositive ? "+" : "";

    return `
      <tr>
        <td>
          <a href="./stock-details.html?symbol=${pos.symbol}" style="font-weight: 600; color: var(--text-main);">
            ${pos.symbol}
          </a>
          <span class="badge badge-outline" style="margin-left: 6px;">${pos.product || "MIS"}</span>
        </td>
        <td class="text-right mono ${pos.quantity > 0 ? "text-up" : "text-down"} text-bold">
          ${pos.quantity > 0 ? `+${pos.quantity}` : pos.quantity}
        </td>
        <td class="text-right mono">${formatCurrency(pos.averagePrice)}</td>
        <td class="text-right mono">${formatCurrency(pos.currentPrice)}</td>
        <td class="text-right mono ${colorClass} text-bold">
          ${sign}${formatCurrency(pos.unrealizedPnL)}
        </td>
        <td class="text-right mono">
          ${formatCurrency(pos.realizedPnL || 0)}
        </td>
        <td class="text-center">
          <span class="badge badge-success">${pos.status}</span>
        </td>
        <td class="text-right">
          <button type="button" class="btn btn-outline btn-xs btn-square-off" data-symbol="${pos.symbol}" data-qty="${Math.abs(pos.quantity)}" data-side="${pos.quantity > 0 ? "SELL" : "BUY"}" style="color:var(--color-down);">
            Square Off
          </button>
        </td>
      </tr>
    `;
  }).join("");

  // Attach Square Off buttons
  tbody.querySelectorAll(".btn-square-off").forEach(btn => {
    btn.addEventListener("click", () => {
      const sym = btn.dataset.symbol;
      const side = btn.dataset.side;
      openOrderModal({ symbol: sym, mode: side });
    });
  });
}

function attachPositionsEvents() {
  const squareAllBtn = document.getElementById("btn-square-all");
  if (squareAllBtn) {
    squareAllBtn.addEventListener("click", () => {
      const openPositions = loadedPositions.filter(p => p.status === "OPEN" && p.quantity !== 0);
      if (openPositions.length === 0) {
        showToast("No active positions to square off.", "info");
        return;
      }
      showToast("Use individual position square off to execute simulated orders.", "info");
    });
  }
}
