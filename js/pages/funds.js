/**
 * TradeNest Funds Page Logic
 * Renders margin balances, simulated deposit & withdrawal modal workflows, and transaction ledger
 * Integrated with TradeNest Backend Account & Transaction REST APIs
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { formatCurrency } from "../utils/formatters.js";
import { accountAPI } from "../utils/api.js";
import { showToast } from "../components/toast.js";

let loadedFunds = null;

export function initFundsPage() {
  initTradingNav("funds");
  initWatchlist("#watchlist-sidebar");

  loadFundsData();
  attachFundsEvents();

  window.addEventListener("tradenest:orderPlaced", () => {
    loadFundsData();
  });
}

async function loadFundsData() {
  try {
    const funds = await accountAPI.getFunds();
    loadedFunds = funds;
    renderFundsData(funds);
  } catch (err) {
    console.warn("[Funds] Could not load funds from backend:", err.message);
  }
}

function renderFundsData(funds) {
  if (!funds) return;

  const availMarginElem = document.getElementById("funds-available-margin");
  const usedMarginElem = document.getElementById("funds-used-margin");
  const openBalElem = document.getElementById("funds-opening-balance");
  const payinElem = document.getElementById("funds-payin");
  const spanElem = document.getElementById("funds-span-margin");
  const expoElem = document.getElementById("funds-exposure-margin");
  const collatElem = document.getElementById("funds-collateral");

  if (availMarginElem) availMarginElem.textContent = formatCurrency(funds.availableMargin || funds.availableCash || 0);
  if (usedMarginElem) usedMarginElem.textContent = formatCurrency(funds.usedMargin || 0);
  if (openBalElem) openBalElem.textContent = formatCurrency(funds.openingBalance || 0);
  if (payinElem) payinElem.textContent = formatCurrency(funds.payin || 0);
  if (spanElem) spanElem.textContent = formatCurrency(funds.spanMargin || 0);
  if (expoElem) expoElem.textContent = formatCurrency(funds.exposureMargin || 0);
  if (collatElem) collatElem.textContent = formatCurrency(funds.collateralLiquid || 0);

  // Render Transactions Ledger
  const tbody = document.getElementById("funds-transactions-body");
  if (tbody) {
    const txns = funds.recentTransactions || [];
    if (txns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:24px;color:var(--text-muted);">No transactions recorded yet. Use the Deposit/Withdraw buttons above.</td></tr>`;
    } else {
      tbody.innerHTML = txns.map(txn => {
        const isDep = txn.type === "DEPOSIT" || txn.type === "Deposit" || txn.type === "TRADE_SELL";
        const shortId = txn._id ? `TXN-${txn._id.substring(txn._id.length - 5).toUpperCase()}` : (txn.id || "TXN-0000");
        const dateStr = txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : (txn.date || "—");

        return `
          <tr>
            <td class="mono" style="font-size:12px;color:var(--text-muted);">${shortId}</td>
            <td class="mono" style="font-size:12px;">${dateStr}</td>
            <td>
              <span class="badge ${isDep ? "badge-success" : "badge-neutral"}">${txn.type}</span>
            </td>
            <td class="text-right mono ${isDep ? "text-up" : "text-down"} text-bold">
              ${isDep ? "+" : "-"}${formatCurrency(txn.amount)}
            </td>
            <td><span style="font-size:12px;color:var(--text-muted);">${txn.mode || txn.description || "Simulation"}</span></td>
            <td class="text-center"><span class="badge badge-success">${txn.status}</span></td>
          </tr>
        `;
      }).join("");
    }
  }
}

function attachFundsEvents() {
  const depositBtn = document.getElementById("btn-open-deposit-modal");
  const withdrawBtn = document.getElementById("btn-open-withdraw-modal");

  if (depositBtn) {
    depositBtn.addEventListener("click", () => openTransactionModal("Deposit"));
  }

  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => openTransactionModal("Withdrawal"));
  }
}

function openTransactionModal(type = "Deposit") {
  const existing = document.getElementById("funds-modal");
  if (existing) existing.remove();

  const isDeposit = type === "Deposit";
  const availCash = loadedFunds ? (loadedFunds.availableMargin || loadedFunds.availableCash || 0) : 0;

  const modalHtml = `
    <div id="funds-modal" class="modal-backdrop is-active" role="dialog" aria-modal="true">
      <div class="modal-dialog">
        <div class="order-modal-header" style="background-color: ${isDeposit ? "var(--color-teal)" : "var(--color-primary)"};">
          <div class="order-header-title">
            <span>Simulated ${type} Funds</span>
          </div>
          <button type="button" class="order-modal-close" id="close-funds-modal">&times;</button>
        </div>

        <form id="funds-form" class="order-modal-body">
          <div class="auth-demo-notice" style="background:#f0fdf4;border-color:#bbf7d0;color:#166534;margin-bottom:16px;">
            <strong>Simulation Note:</strong> No actual money is moved. This updates your demo trading margin immediately.
          </div>

          <div class="form-group">
            <label for="fund-amount-input" class="form-label">Amount (₹)</label>
            <input type="number" id="fund-amount-input" class="form-control" value="25000" min="100" max="1000000" step="500" required>
            ${!isDeposit ? `<div class="form-hint" style="margin-top:4px;font-size:11px;">Available for withdrawal: <strong>${formatCurrency(availCash)}</strong></div>` : ""}
          </div>

          <div style="display:flex;gap:6px;margin-bottom:16px;">
            <button type="button" class="btn btn-outline btn-xs preset-amt" data-amt="10000">+₹10,000</button>
            <button type="button" class="btn btn-outline btn-xs preset-amt" data-amt="25000">+₹25,000</button>
            <button type="button" class="btn btn-outline btn-xs preset-amt" data-amt="50000">+₹50,000</button>
            <button type="button" class="btn btn-outline btn-xs preset-amt" data-amt="100000">+₹1,00,000</button>
          </div>

          <div class="form-group">
            <label for="fund-mode-select" class="form-label">Payment Instrument</label>
            <select id="fund-mode-select" class="form-control">
              ${isDeposit ? `
                <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe / Instant)</option>
                <option value="Net Banking (HDFC Bank)">Net Banking (HDFC Bank)</option>
                <option value="NEFT / RTGS Transfer">NEFT / RTGS Transfer</option>
              ` : `
                <option value="NEFT to HDFC Bank (••4892)">Transfer to Linked HDFC Bank (•••• 4892)</option>
                <option value="Instant IMPS Payout">Instant IMPS Payout</option>
              `}
            </select>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px;">
            <button type="button" class="btn btn-secondary btn-sm" id="cancel-funds-btn">Cancel</button>
            <button type="submit" class="btn ${isDeposit ? "btn-primary" : "btn-navy"} btn-sm" id="confirm-funds-btn">Confirm ${type}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const div = document.createElement("div");
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);

  const modal = document.getElementById("funds-modal");
  const closeBtn = document.getElementById("close-funds-modal");
  const cancelBtn = document.getElementById("cancel-funds-btn");
  const amtInput = document.getElementById("fund-amount-input");
  const form = document.getElementById("funds-form");
  const submitBtn = document.getElementById("confirm-funds-btn");

  const close = () => modal.remove();
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);

  modal.querySelectorAll(".preset-amt").forEach(b => {
    b.addEventListener("click", () => {
      amtInput.value = b.dataset.amt;
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amount = parseFloat(amtInput.value);
    const mode = document.getElementById("fund-mode-select").value;

    if (!amount || amount < 100) {
      showToast("Please enter an amount of at least ₹100", "danger");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing...";
    }

    try {
      if (isDeposit) {
        await accountAPI.deposit({ amount, mode });
        showToast(`Simulated deposit of ${formatCurrency(amount)} successful!`, "success");
      } else {
        await accountAPI.withdraw({ amount, mode });
        showToast(`Simulated withdrawal of ${formatCurrency(amount)} processed!`, "success");
      }
      await loadFundsData();
      close();
    } catch (err) {
      showToast(err.message || "Fund operation failed.", "danger");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = `Confirm ${type}`;
      }
    }
  });
}
