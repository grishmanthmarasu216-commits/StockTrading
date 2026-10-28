/**
 * TradeNest Public Pages Logic
 * Interactive pricing calculator, live preview ticker, and market showcases
 */

import { initPublicHeader } from "../components/header.js";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters.js";
import { MOCK_INDICES, MOCK_STOCKS } from "../data/mockData.js";

export function initHomePage() {
  initPublicHeader("home");

  // Render market preview table on home page if element exists
  const tableBody = document.getElementById("home-market-table-body");
  if (tableBody) {
    const previewStocks = MOCK_STOCKS.slice(0, 6);
    tableBody.innerHTML = previewStocks.map(stock => {
      const colorClass = stock.isPositive ? "text-up" : "text-down";
      const sign = stock.isPositive ? "+" : "";
      return `
        <tr>
          <td>
            <strong>${stock.symbol}</strong>
            <div style="font-size:11px;color:var(--text-muted);">${stock.name}</div>
          </td>
          <td class="text-right mono">${stock.price.toFixed(2)}</td>
          <td class="text-right mono ${colorClass}">${sign}${stock.change.toFixed(2)}</td>
          <td class="text-right mono ${colorClass}">${formatPercent(stock.changePercent)}</td>
          <td class="text-right mono">${stock.volume}</td>
          <td class="text-right">
            <a href="./stock-details.html?symbol=${stock.symbol}" class="btn btn-outline btn-xs">Trade</a>
          </td>
        </tr>
      `;
    }).join("");
  }
}

export function initAboutPage() {
  initPublicHeader("about");
}

export function initTechnologyPage() {
  initPublicHeader("technology");
}

export function initPricingPage() {
  initPublicHeader("pricing");

  // Interactive Brokerage Calculator
  const buyInput = document.getElementById("calc-buy-price");
  const sellInput = document.getElementById("calc-sell-price");
  const qtyInput = document.getElementById("calc-qty");
  const segmentSelect = document.getElementById("calc-segment");

  if (buyInput && sellInput && qtyInput && segmentSelect) {
    function calculateCharges() {
      const buyPrice = parseFloat(buyInput.value) || 0;
      const sellPrice = parseFloat(sellInput.value) || 0;
      const qty = parseInt(qtyInput.value, 10) || 0;
      const segment = segmentSelect.value;

      const buyTurnover = buyPrice * qty;
      const sellTurnover = sellPrice * qty;
      const turnover = buyTurnover + sellTurnover;
      const grossPnL = (sellPrice - buyPrice) * qty;

      let brokerage = 0;
      let stt = 0;
      let excCharges = 0;
      let stampDuty = 0;

      if (segment === "delivery") {
        brokerage = 0; // ₹0 brokerage
        stt = turnover * 0.001; // 0.1% on buy & sell
        excCharges = turnover * 0.0000345;
        stampDuty = buyTurnover * 0.00015;
      } else if (segment === "intraday") {
        const buyBrok = Math.min(20, buyTurnover * 0.0003);
        const sellBrok = Math.min(20, sellTurnover * 0.0003);
        brokerage = buyBrok + sellBrok;
        stt = sellTurnover * 0.00025; // 0.025% on sell
        excCharges = turnover * 0.0000345;
        stampDuty = buyTurnover * 0.00003;
      } else if (segment === "futures") {
        const buyBrok = Math.min(20, buyTurnover * 0.0003);
        const sellBrok = Math.min(20, sellTurnover * 0.0003);
        brokerage = buyBrok + sellBrok;
        stt = sellTurnover * 0.000125;
        excCharges = turnover * 0.00002;
        stampDuty = buyTurnover * 0.00002;
      } else {
        // Options
        brokerage = 40; // ₹20 per leg
        stt = sellTurnover * 0.000625;
        excCharges = turnover * 0.00053;
        stampDuty = buyTurnover * 0.00003;
      }

      const sebiCharges = turnover * 0.000001; // ₹10 per crore
      const gst = (brokerage + excCharges + sebiCharges) * 0.18; // 18% GST
      const totalTaxCharges = brokerage + stt + excCharges + gst + sebiCharges + stampDuty;
      const netPnL = grossPnL - totalTaxCharges;

      // Update UI elements
      document.getElementById("res-turnover").textContent = formatCurrency(turnover);
      document.getElementById("res-brokerage").textContent = formatCurrency(brokerage);
      document.getElementById("res-stt").textContent = formatCurrency(stt);
      document.getElementById("res-exchange").textContent = formatCurrency(excCharges);
      document.getElementById("res-gst").textContent = formatCurrency(gst);
      document.getElementById("res-sebi").textContent = formatCurrency(sebiCharges + stampDuty);
      document.getElementById("res-total-charges").textContent = formatCurrency(totalTaxCharges);

      const netPnLElem = document.getElementById("res-net-pnl");
      netPnLElem.textContent = formatCurrency(netPnL);
      if (netPnL >= 0) {
        netPnLElem.className = "mono text-up";
      } else {
        netPnLElem.className = "mono text-down";
      }
    }

    buyInput.addEventListener("input", calculateCharges);
    sellInput.addEventListener("input", calculateCharges);
    qtyInput.addEventListener("input", calculateCharges);
    segmentSelect.addEventListener("change", calculateCharges);

    calculateCharges();
  }
}
