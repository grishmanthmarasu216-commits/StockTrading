/**
 * TradeNest Orders Page Logic
 * Renders orders table, filtering tabs (All, Open, Executed, Cancelled), cancel action, and order details modal
 * Integrated with TradeNest Backend Orders REST API
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { formatCurrency } from "../utils/formatters.js";
import { ordersAPI } from "../utils/api.js";
import { showToast } from "../components/toast.js";

let activeTab = "ALL";
let searchQuery = "";
let loadedOrders = [];

export function initOrdersPage() {
  initTradingNav("orders");
  initWatchlist("#watchlist-sidebar");

  loadOrdersData();
  attachOrdersEvents();

  window.addEventListener("tradenest:orderPlaced", () => {
    loadOrdersData();
  });
}

async function loadOrdersData() {
  const tbody = document.getElementById("orders-table-body");
  if (!tbody) return;

  try {
    const data = await ordersAPI.getOrders({ limit: 100 });
    loadedOrders = data.orders || [];
    renderOrdersTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding:24px;color:var(--text-muted);">Failed to load orders from backend. Please log in.</td></tr>`;
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById("orders-table-body");
  const emptyState = document.getElementById("orders-empty-state");
  const tableContainer = document.getElementById("orders-table-container");

  if (!tbody) return;

  let filtered = loadedOrders.filter(order => {
    if (activeTab === "OPEN") return order.status === "PENDING" || order.status === "OPEN";
    if (activeTab === "EXECUTED") return order.status === "COMPLETE";
    if (activeTab === "CANCELLED") return order.status === "CANCELLED" || order.status === "REJECTED";
    return true;
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toUpperCase();
    filtered = filtered.filter(o => o.symbol.includes(q) || (o._id && o._id.includes(q)));
  }

  if (filtered.length === 0) {
    if (tableContainer) tableContainer.style.display = "none";
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">No orders found</div>
          <div class="empty-state-desc">You don't have any ${activeTab.toLowerCase()} orders right now. Use the Watchlist to place simulated trades.</div>
        </div>
      `;
    }
    return;
  }

  if (tableContainer) tableContainer.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  tbody.innerHTML = filtered.map(order => {
    const isBuy = order.type === "BUY";
    const typeBadge = `<span class="badge ${isBuy ? "badge-info" : "badge-danger"}" style="font-weight:bold;">${order.type}</span>`;
    
    let statusBadge = "";
    if (order.status === "COMPLETE") {
      statusBadge = `<span class="badge badge-success">COMPLETE</span>`;
    } else if (order.status === "PENDING" || order.status === "OPEN") {
      statusBadge = `<span class="badge badge-neutral" style="background:#fef3c7;color:#92400e;">PENDING</span>`;
    } else {
      statusBadge = `<span class="badge badge-danger">${order.status}</span>`;
    }

    const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : (order.time || "—");
    const shortId = order._id ? `ORD-${order._id.substring(order._id.length - 6).toUpperCase()}` : (order.id || "ORD-0000");
    const displayPrice = order.executionPrice || order.requestedPrice || order.price || 0;

    return `
      <tr>
        <td class="mono" style="font-size:12px;color:var(--text-muted);" title="${order._id || ""}">${shortId}</td>
        <td class="mono" style="font-size:12px;">${orderTime}</td>
        <td>${typeBadge}</td>
        <td>
          <strong>${order.symbol}</strong>
          <span style="font-size:11px;color:var(--text-light);margin-left:4px;">NSE</span>
        </td>
        <td><span class="badge badge-outline">${order.product || "CNC"}</span></td>
        <td class="text-right mono">${order.filledQty || 0} / ${order.quantity || order.qty}</td>
        <td class="text-right mono">${formatCurrency(displayPrice)}</td>
        <td class="text-center">${statusBadge}</td>
        <td class="text-right">
          ${(order.status === "PENDING" || order.status === "OPEN") ? `
            <button class="btn btn-outline btn-xs" data-cancel-order="${order._id || order.id}" style="color:var(--color-down);">Cancel</button>
          ` : `
            <button class="btn btn-outline btn-xs" data-view-order="${order._id || order.id}">Details</button>
          `}
        </td>
      </tr>
    `;
  }).join("");

  // Cancel order handler
  tbody.querySelectorAll("[data-cancel-order]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.cancelOrder;
      btn.disabled = true;
      try {
        await ordersAPI.cancelOrder(orderId);
        showToast("Order cancelled successfully", "info");
        loadOrdersData();
      } catch (err) {
        showToast(err.message || "Could not cancel order", "danger");
        btn.disabled = false;
      }
    });
  });

  // View order details handler
  tbody.querySelectorAll("[data-view-order]").forEach(btn => {
    btn.addEventListener("click", () => {
      const orderId = btn.dataset.viewOrder;
      const order = loadedOrders.find(o => (o._id === orderId || o.id === orderId));
      if (order) showOrderDetailsModal(order);
    });
  });
}

function showOrderDetailsModal(order) {
  const existing = document.getElementById("order-details-modal");
  if (existing) existing.remove();

  const shortId = order._id ? `ORD-${order._id.substring(order._id.length - 6).toUpperCase()}` : (order.id || "ORD-0000");
  const displayPrice = order.executionPrice || order.requestedPrice || order.price || 0;
  const orderTime = order.createdAt ? new Date(order.createdAt).toLocaleString() : (order.time || "—");

  const modalHtml = `
    <div id="order-details-modal" class="modal-backdrop is-active" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="order-modal-header" style="background-color: var(--color-primary);">
          <div class="order-header-title">
            <span>Order Information: ${shortId}</span>
          </div>
          <button type="button" class="order-modal-close" id="close-order-details">&times;</button>
        </div>
        <div class="order-modal-body" style="font-size: 13px;">
          <div class="trading-card-row">
            <span class="text-muted">Instrument:</span>
            <strong>${order.symbol} (NSE)</strong>
          </div>
          <div class="trading-card-row">
            <span class="text-muted">Action:</span>
            <span class="badge ${order.type === "BUY" ? "badge-info" : "badge-danger"}">${order.type}</span>
          </div>
          <div class="trading-card-row">
            <span class="text-muted">Product / Type:</span>
            <span>${order.product || "CNC"} • ${order.orderType || "MARKET"}</span>
          </div>
          <div class="trading-card-row">
            <span class="text-muted">Status:</span>
            <strong>${order.status}</strong>
          </div>
          <div class="trading-card-row">
            <span class="text-muted">Quantity:</span>
            <span class="mono">${order.filledQty || order.quantity || order.qty} / ${order.quantity || order.qty}</span>
          </div>
          <div class="trading-card-row">
            <span class="text-muted">Execution Price:</span>
            <span class="mono text-bold">${formatCurrency(displayPrice)}</span>
          </div>
          <div class="trading-card-row">
            <span class="text-muted">Total Turnover:</span>
            <span class="mono">${formatCurrency(displayPrice * (order.quantity || order.qty))}</span>
          </div>
          <div class="trading-card-row">
            <span class="text-muted">Placed At:</span>
            <span class="mono">${orderTime}</span>
          </div>
        </div>
        <div class="order-modal-footer" style="justify-content: flex-end;">
          <button type="button" class="btn btn-primary btn-sm" id="btn-close-details">Close</button>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement("div");
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);

  const modal = document.getElementById("order-details-modal");
  const closeBtn = document.getElementById("close-order-details");
  const bottomClose = document.getElementById("btn-close-details");

  const close = () => modal.remove();
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (bottomClose) bottomClose.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
}

function attachOrdersEvents() {
  const searchInput = document.getElementById("orders-search");
  const tabBtns = document.querySelectorAll(".orders-tab-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderOrdersTable();
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeTab = btn.dataset.tab || "ALL";
      renderOrdersTable();
    });
  });
}
