/**
 * TradeNest Dashboard Page Logic (Phase 3: Backend REST API & Chart.js Integration)
 * Manages portfolio metrics, holdings summary table, doughnut allocation chart, and performance trend
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";
import { dashboardAPI } from "../utils/api.js";
import { openOrderModal } from "../components/orderModal.js";

// Chart.js instance references for proper lifecycle management
let allocationChartInstance = null;
let performanceChartInstance = null;
let currentTimeframe = "1M";
let currentHoldings = [];
let currentPortfolioVal = 0;

export function initDashboardPage() {
  initTradingNav("dashboard");
  initWatchlist("#watchlist-sidebar");

  loadDashboardData();

  // Listen for simulated orders from order modal or other actions to update reactively
  window.addEventListener("tradenest:orderPlaced", () => {
    loadDashboardData();
  });

  // Listen for real-time market ticks to re-evaluate portfolio
  window.addEventListener("tradenest:marketTick", () => {
    // Refresh periodically on ticks without full layout redraw
    loadDashboardData(true);
  });

  // Timeframe selector buttons on portfolio performance chart
  document.querySelectorAll(".timeframe-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".timeframe-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTimeframe = btn.dataset.timeframe || "1M";
      loadPerformanceData(currentTimeframe);
    });
  });

  // Window resize observer to ensure Chart.js canvas fits container cleanly
  window.addEventListener("resize", () => {
    if (allocationChartInstance) allocationChartInstance.resize();
    if (performanceChartInstance) performanceChartInstance.resize();
  });
}

/**
 * Main dashboard data loader from backend API
 */
async function loadDashboardData(isTickUpdate = false) {
  try {
    const data = await dashboardAPI.getSummary();
    const { account, portfolio, topHoldings } = data;

    currentHoldings = topHoldings || [];
    currentPortfolioVal = portfolio.currentPortfolioValue || 0;

    // 1. Account & Margin Summary
    const availMarginElem = document.getElementById("dash-available-margin");
    const usedMarginElem = document.getElementById("dash-used-margin");
    const openingBalElem = document.getElementById("dash-opening-balance");

    if (availMarginElem) availMarginElem.textContent = formatCurrency(account.availableMargin || account.availableCash || 0);
    if (usedMarginElem) usedMarginElem.textContent = formatCurrency(account.usedMargin || 0);
    if (openingBalElem) openingBalElem.textContent = formatCurrency(account.openingBalance || 0);

    // 2. Portfolio Valuation & P&L Summary
    const totalInvestElem = document.getElementById("dash-total-investment");
    const curValueElem = document.getElementById("dash-current-value");
    const pnlElem = document.getElementById("dash-total-pnl");
    const pnlPercentElem = document.getElementById("dash-pnl-percent");

    if (totalInvestElem) totalInvestElem.textContent = formatCurrency(portfolio.totalInvestment || 0);
    if (curValueElem) curValueElem.textContent = formatCurrency(portfolio.currentPortfolioValue || 0);

    const totalPnL = portfolio.totalPnL || 0;
    const totalReturnPct = portfolio.overallReturnPercentage || 0;
    const isPositive = totalPnL >= 0;

    if (pnlElem) {
      pnlElem.textContent = `${isPositive ? "+" : ""}${formatCurrency(totalPnL)}`;
      pnlElem.className = `trading-stat-large ${isPositive ? "text-up" : "text-down"}`;
    }

    if (pnlPercentElem) {
      pnlPercentElem.textContent = `(${formatPercent(totalReturnPct)})`;
      pnlPercentElem.className = `trading-stat-label ${isPositive ? "text-up" : "text-down"}`;
    }

    // 3. Render Holdings Quick Summary Table
    renderHoldingsTable(currentHoldings);

    // 4. Render Chart.js Chart A: Portfolio Allocation Doughnut
    renderAllocationDoughnutChart(currentHoldings);

    // 5. Render Chart.js Chart B: Simulated Performance Line
    if (!isTickUpdate) {
      loadPerformanceData(currentTimeframe);
    }
  } catch (err) {
    console.warn("[Dashboard] Could not load dashboard summary from backend:", err.message);
  }
}

async function loadPerformanceData(timeframe = "1M") {
  try {
    const data = await dashboardAPI.getPerformance(timeframe);
    renderPerformanceChart(data.data || []);
  } catch (err) {
    console.warn("[Dashboard] Could not load performance curve:", err.message);
  }
}

/**
 * Render functional holdings summary table with all required columns
 * @param {Array} holdings
 */
function renderHoldingsTable(holdings) {
  const tbody = document.getElementById("dash-holdings-summary-body");
  if (!tbody) return;

  if (!holdings || holdings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center" style="padding: 32px 16px; color: var(--text-muted);">
          <div style="font-size: 13px; font-weight: 500;">No holdings in demo portfolio</div>
          <div style="font-size: 11px; margin-top: 4px;">Use the Watchlist on the left to buy delivery shares.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = holdings.map(item => {
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
          <button type="button" class="btn btn-outline btn-xs" data-trade-symbol="${item.symbol}" title="Trade ${item.symbol}">
            Trade
          </button>
        </td>
      </tr>
    `;
  }).join("");

  // Attach quick trade button handlers
  tbody.querySelectorAll("[data-trade-symbol]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sym = btn.dataset.tradeSymbol;
      openOrderModal({ symbol: sym, mode: "BUY" });
    });
  });
}

/**
 * Chart A: Chart.js Doughnut Chart for Portfolio Allocation
 * Displays distribution across holdings with custom tooltips (symbol, value, %)
 * @param {Array} holdings
 */
function renderAllocationDoughnutChart(holdings) {
  const container = document.getElementById("dash-allocation-chart");
  if (!container) return;

  if (allocationChartInstance) {
    allocationChartInstance.destroy();
    allocationChartInstance = null;
  }

  if (!holdings || holdings.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px; text-align: center;">
        <div style="font-size: 26px; margin-bottom: 6px;">📊</div>
        <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">Portfolio Empty</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          Execute a simulated buy order to view distribution.
        </div>
      </div>
    `;
    return;
  }

  let canvas = document.getElementById("allocationChartCanvas");
  if (!canvas) {
    container.innerHTML = '<canvas id="allocationChartCanvas"></canvas>';
    canvas = document.getElementById("allocationChartCanvas");
  }

  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not loaded yet.");
    return;
  }

  const labels = holdings.map(h => h.symbol);
  const dataValues = holdings.map(h => h.currentValue || (h.quantity * h.currentPrice));
  const totalVal = dataValues.reduce((a, b) => a + b, 0);

  const palette = [
    "#1e56a0", "#00a896", "#0284c7", "#f59e0b",
    "#8b5cf6", "#ec4899", "#10b981", "#6366f1",
    "#14b8a6", "#f97316"
  ];

  const backgroundColors = labels.map((_, i) => palette[i % palette.length]);

  allocationChartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      layout: { padding: 4 },
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            padding: 8,
            font: { size: 11, family: "'Inter', sans-serif" },
            color: "#1e293b"
          }
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleFont: { size: 12, family: "'Inter', sans-serif", weight: "600" },
          bodyFont: { size: 11, family: "'Inter', sans-serif" },
          padding: 10,
          cornerRadius: 4,
          callbacks: {
            label: function(context) {
              const val = Number(context.raw) || 0;
              const pct = totalVal > 0 ? ((val / totalVal) * 100).toFixed(1) : "0.0";
              return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Chart B: Chart.js Line Chart for Portfolio Performance
 * Deterministic historical data points ending at currentPortfolioValue
 * @param {Array} points
 */
function renderPerformanceChart(points = []) {
  const container = document.getElementById("dash-performance-chart");
  if (!container) return;

  if (performanceChartInstance) {
    performanceChartInstance.destroy();
    performanceChartInstance = null;
  }

  let canvas = document.getElementById("performanceChartCanvas");
  if (!canvas) {
    container.innerHTML = '<canvas id="performanceChartCanvas"></canvas>';
    canvas = document.getElementById("performanceChartCanvas");
  }

  if (typeof Chart === "undefined") {
    console.warn("Chart.js is not loaded yet.");
    return;
  }

  const labels = points.map(p => p.date);
  const dataValues = points.map(p => p.value);

  const ctx = canvas.getContext("2d");
  let gradient = null;
  try {
    gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(2, 132, 199, 0.22)");
    gradient.addColorStop(1, "rgba(2, 132, 199, 0.0)");
  } catch (e) {
    gradient = "rgba(2, 132, 199, 0.1)";
  }

  performanceChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Portfolio Value (Simulated)",
        data: dataValues,
        borderColor: "#0284c7",
        backgroundColor: gradient,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        pointBackgroundColor: "#0284c7",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 6, bottom: 4, left: 4, right: 8 } },
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10, family: "'Inter', sans-serif" },
            color: "#64748b",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7
          }
        },
        y: {
          position: "right",
          grid: { color: "#f1f5f9" },
          ticks: {
            font: { size: 10, family: "'Inter', sans-serif" },
            color: "#64748b",
            callback: function(value) {
              if (value >= 100000) return "₹" + (value / 100000).toFixed(2) + "L";
              if (value >= 1000) return "₹" + (value / 1000).toFixed(0) + "k";
              return "₹" + value;
            }
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          titleFont: { size: 11, family: "'Inter', sans-serif", weight: "600" },
          bodyFont: { size: 11, family: "'Inter', sans-serif" },
          padding: 8,
          cornerRadius: 4,
          callbacks: {
            title: function(items) {
              return items[0].label + " (Simulated)";
            },
            label: function(context) {
              return " Portfolio Value: " + formatCurrency(context.raw);
            }
          }
        }
      }
    }
  });
}
