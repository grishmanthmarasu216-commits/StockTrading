/**
 * TradeNest Universal Buy / Sell Order Modal
 * Interactive Kite-style order panel accessible from Watchlist, Stock Details, Holdings & Positions
 * Connected to TradeNest Backend Order Execution API
 */

import { formatCurrency } from "../utils/formatters.js";
import { ordersAPI, accountAPI, marketAPI } from "../utils/api.js";
import { showToast } from "./toast.js";

let modalElement = null;
let currentSymbol = "INFY";
let currentMode = "BUY"; // 'BUY' | 'SELL'
let currentProduct = "CNC"; // 'CNC' | 'MIS'
let currentOrderType = "MARKET"; // 'MARKET' | 'LIMIT'
let currentPrice = 1876.40;
let cachedAvailableMargin = 175000;

function createModalDOM() {
  if (document.getElementById("tradenest-order-modal")) {
    return document.getElementById("tradenest-order-modal");
  }

  const modalHtml = `
    <div id="tradenest-order-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
      <div class="modal-dialog">
        <div class="order-modal-header" id="order-modal-header">
          <div class="order-header-left">
            <div class="order-header-title" id="order-modal-title">
              <span id="order-action-label">BUY</span>
              <span id="order-symbol-label">INFY</span>
              <span class="badge badge-neutral" id="order-exchange-label">NSE</span>
            </div>
            <div class="order-header-subtitle">
              <span>LTP: <strong id="order-ltp-label">₹0.00</strong></span>
              <span class="simulation-pill" style="margin-left: 8px; font-size: 10px;">Simulated</span>
            </div>
          </div>
          <button type="button" class="order-modal-close" id="order-modal-close-btn" aria-label="Close Order Modal">&times;</button>
        </div>

        <form id="order-modal-form" class="order-modal-body">
          <!-- Buy / Sell Action Switch -->
          <div class="order-switch-group">
            <label class="order-radio-label">
              <input type="radio" name="orderMode" value="BUY" checked id="order-mode-buy">
              <span>Buy</span>
            </label>
            <label class="order-radio-label">
              <input type="radio" name="orderMode" value="SELL" id="order-mode-sell">
              <span>Sell</span>
            </label>
          </div>

          <!-- Product Switch (Intraday MIS vs Longterm CNC) -->
          <div class="order-switch-group">
            <label class="order-radio-label" title="Cash & Carry for Delivery">
              <input type="radio" name="orderProduct" value="CNC" checked id="product-cnc">
              <span>Longterm CNC</span>
            </label>
            <label class="order-radio-label" title="Margin Intraday Square-off (5x leverage)">
              <input type="radio" name="orderProduct" value="MIS" id="product-mis">
              <span>Intraday MIS</span>
            </label>
          </div>

          <!-- Order Type (Market vs Limit) -->
          <div class="order-switch-group" style="margin-bottom: var(--spacing-3);">
            <label class="order-radio-label">
              <input type="radio" name="orderPriceType" value="MARKET" checked id="type-market">
              <span>Market</span>
            </label>
            <label class="order-radio-label">
              <input type="radio" name="orderPriceType" value="LIMIT" id="type-limit">
              <span>Limit</span>
            </label>
          </div>

          <!-- Quantity & Price Inputs -->
          <div class="order-inputs-grid">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="order-qty-input" class="form-label">Quantity</label>
              <input type="number" id="order-qty-input" class="form-control" value="1" min="1" max="10000" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label for="order-price-input" class="form-label">Price (₹)</label>
              <input type="number" id="order-price-input" class="form-control" value="0.00" step="0.05" min="0.05" disabled>
            </div>
          </div>
        </form>

        <div class="order-modal-footer">
          <div class="order-margin-info">
            <span class="order-margin-label">Margin Required: <strong id="order-margin-req" class="order-margin-value">₹0.00</strong></span>
            <span class="order-margin-label" style="font-size: 10px;">Available: <span id="order-margin-avail" class="mono">₹0.00</span></span>
          </div>
          <div class="order-footer-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="order-cancel-btn">Cancel</button>
            <button type="submit" form="order-modal-form" class="btn btn-buy btn-sm" id="order-submit-btn">Buy</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement("div");
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);

  modalElement = document.getElementById("tradenest-order-modal");
  attachModalListeners();
  return modalElement;
}

async function refreshAvailableMargin() {
  try {
    const funds = await accountAPI.getFunds();
    if (funds) {
      cachedAvailableMargin = funds.availableMargin ?? funds.availableCash;
      const marginAvailElem = document.getElementById("order-margin-avail");
      if (marginAvailElem) {
        marginAvailElem.textContent = formatCurrency(cachedAvailableMargin);
      }
    }
  } catch (err) {
    // Keep cached
  }
}

function updateCalculations() {
  const qtyInput = document.getElementById("order-qty-input");
  const priceInput = document.getElementById("order-price-input");
  const marginReqElem = document.getElementById("order-margin-req");
  const marginAvailElem = document.getElementById("order-margin-avail");

  const qty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;
  const price = currentOrderType === "MARKET" ? currentPrice : (parseFloat(priceInput ? priceInput.value : currentPrice) || currentPrice);

  const total = price * qty;
  const margin = currentProduct === "MIS" ? total * 0.2 : total;

  if (marginReqElem) marginReqElem.textContent = formatCurrency(margin);
  if (marginAvailElem) marginAvailElem.textContent = formatCurrency(cachedAvailableMargin);
}

function attachModalListeners() {
  const closeBtn = document.getElementById("order-modal-close-btn");
  const cancelBtn = document.getElementById("order-cancel-btn");
  const form = document.getElementById("order-modal-form");
  const qtyInput = document.getElementById("order-qty-input");
  const priceInput = document.getElementById("order-price-input");

  closeBtn.addEventListener("click", closeOrderModal);
  cancelBtn.addEventListener("click", closeOrderModal);

  modalElement.addEventListener("click", (e) => {
    if (e.target === modalElement) {
      closeOrderModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalElement && modalElement.classList.contains("is-active")) {
      closeOrderModal();
    }
  });

  // Radio mode switches
  document.querySelectorAll('input[name="orderMode"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      setMode(e.target.value);
    });
  });

  document.querySelectorAll('input[name="orderProduct"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentProduct = e.target.value;
      updateCalculations();
    });
  });

  document.querySelectorAll('input[name="orderPriceType"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentOrderType = e.target.value;
      priceInput.disabled = (currentOrderType === "MARKET");
      if (currentOrderType === "MARKET") {
        priceInput.value = currentPrice.toFixed(2);
      }
      updateCalculations();
    });
  });

  qtyInput.addEventListener("input", updateCalculations);
  priceInput.addEventListener("input", updateCalculations);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const qty = parseInt(qtyInput.value, 10);
    const limitPrice = currentOrderType === "MARKET" ? currentPrice : parseFloat(priceInput.value);

    if (!qty || qty < 1) {
      showToast("Please enter a valid quantity of at least 1", "danger");
      return;
    }

    const submitBtn = document.getElementById("order-submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    try {
      const order = await ordersAPI.createOrder({
        symbol: currentSymbol,
        type: currentMode,
        product: currentProduct,
        orderType: currentOrderType,
        quantity: qty,
        price: limitPrice
      });

      const execPrice = order.executionPrice || limitPrice;
      showToast(
        `Order Executed: ${order.type} ${order.quantity} ${order.symbol} @ ${formatCurrency(execPrice)}`,
        "success",
        3500
      );

      // Dispatch custom event for reactive dashboard, orders, and holdings update
      window.dispatchEvent(new CustomEvent("tradenest:orderPlaced", { detail: order }));

      closeOrderModal();
    } catch (err) {
      showToast(`Order failed: ${err.message}`, "danger", 4500);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = currentMode === "SELL" ? "Sell" : "Buy";
      }
    }
  });
}

function setMode(mode) {
  currentMode = mode;
  const header = document.getElementById("order-modal-header");
  const actionLabel = document.getElementById("order-action-label");
  const submitBtn = document.getElementById("order-submit-btn");

  if (mode === "SELL") {
    header.classList.add("mode-sell");
    actionLabel.textContent = "SELL";
    submitBtn.textContent = "Sell";
    submitBtn.className = "btn btn-sell btn-sm";
    document.getElementById("order-mode-sell").checked = true;
  } else {
    header.classList.remove("mode-sell");
    actionLabel.textContent = "BUY";
    submitBtn.textContent = "Buy";
    submitBtn.className = "btn btn-buy btn-sm";
    document.getElementById("order-mode-buy").checked = true;
  }
}

/**
 * Open the universal order modal
 * @param {Object} options
 * @param {string} options.symbol
 * @param {'BUY'|'SELL'} options.mode
 * @param {number} [options.price]
 */
export async function openOrderModal({ symbol = "INFY", mode = "BUY", price = null }) {
  ensureModal();

  currentSymbol = symbol.toUpperCase();
  currentPrice = price || 1000;

  document.getElementById("order-symbol-label").textContent = currentSymbol;
  document.getElementById("order-ltp-label").textContent = formatCurrency(currentPrice);

  const priceInput = document.getElementById("order-price-input");
  if (priceInput) priceInput.value = currentPrice.toFixed(2);

  // Fetch real latest quote and funds
  refreshAvailableMargin();
  marketAPI.getStock(currentSymbol).then(stock => {
    if (stock) {
      currentPrice = stock.price;
      document.getElementById("order-ltp-label").textContent = formatCurrency(stock.price);
      document.getElementById("order-exchange-label").textContent = stock.exchange || "NSE";
      if (currentOrderType === "MARKET" && priceInput) {
        priceInput.value = stock.price.toFixed(2);
      }
      updateCalculations();
    }
  }).catch(() => {});

  setMode(mode);
  updateCalculations();

  modalElement.classList.add("is-active");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    const qtyInput = document.getElementById("order-qty-input");
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  }, 50);
}

export function closeOrderModal() {
  if (modalElement) {
    modalElement.classList.remove("is-active");
    document.body.style.overflow = "";
  }
}

function ensureModal() {
  if (!modalElement || !document.getElementById("tradenest-order-modal")) {
    createModalDOM();
  }
}
