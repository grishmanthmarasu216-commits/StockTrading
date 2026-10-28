/**
 * TradeNest Stock Details Page Logic
 * Symbol stats, 5-level market depth, interactive SVG candlestick/line chart, and quick order triggers
 * Integrated with TradeNest Backend Market REST API and Socket.IO
 */

import { initTradingNav } from "../components/tradingNav.js";
import { initWatchlist } from "../components/watchlist.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";
import { marketAPI } from "../utils/api.js";
import { openOrderModal } from "../components/orderModal.js";

let currentStock = null;
let currentChartMode = "candle"; // 'candle' | 'line'
let allStocks = [];

export async function initStockDetailsPage() {
  initTradingNav("dashboard");
  initWatchlist("#watchlist-sidebar");

  const urlParams = new URLSearchParams(window.location.search);
  const requestedSymbol = urlParams.get("symbol") || "INFY";

  try {
    const [stock, stocksList] = await Promise.all([
      marketAPI.getStock(requestedSymbol).catch(() => null),
      marketAPI.getStocks().catch(() => [])
    ]);

    allStocks = stocksList;
    currentStock = stock || (stocksList.length > 0 ? stocksList[0] : null);

    renderStockDetails();
    attachStockDetailsEvents();
  } catch (err) {
    console.warn("[StockDetails] Could not load stock from API:", err.message);
  }

  // Socket.IO real-time tick listener
  window.addEventListener("tradenest:marketTick", (e) => {
    if (!currentStock || !e.detail?.stocks) return;
    const updated = e.detail.stocks.find(s => s.symbol === currentStock.symbol);
    if (updated) {
      currentStock.price = updated.price;
      currentStock.change = updated.change;
      currentStock.changePercent = updated.changePercent;
      currentStock.isPositive = updated.isPositive;
      updateHeaderPriceOnly();
    }
  });
}

function updateHeaderPriceOnly() {
  if (!currentStock) return;
  const colorClass = currentStock.change >= 0 ? "text-up" : "text-down";
  const sign = currentStock.change >= 0 ? "+" : "";

  const ltpElem = document.getElementById("stock-ltp");
  const changeElem = document.getElementById("stock-change");

  if (ltpElem) {
    ltpElem.textContent = formatCurrency(currentStock.price);
    ltpElem.className = `trading-stat-large ${colorClass}`;
  }

  if (changeElem) {
    changeElem.textContent = `${sign}${currentStock.change ? currentStock.change.toFixed(2) : "0.00"} (${formatPercent(currentStock.changePercent)})`;
    changeElem.className = `trading-stat-label ${colorClass}`;
  }
}

function renderStockDetails() {
  if (!currentStock) return;

  const isPositive = (currentStock.change || 0) >= 0;
  const colorClass = isPositive ? "text-up" : "text-down";
  const sign = isPositive ? "+" : "";

  // 1. Header info
  document.getElementById("stock-symbol-title").textContent = currentStock.symbol;
  document.getElementById("stock-company-name").textContent = currentStock.name;
  document.getElementById("stock-exchange-tag").textContent = currentStock.exchange || "NSE";
  document.getElementById("stock-sector-tag").textContent = currentStock.sector || "General";

  const ltpElem = document.getElementById("stock-ltp");
  const changeElem = document.getElementById("stock-change");

  if (ltpElem) {
    ltpElem.textContent = formatCurrency(currentStock.price);
    ltpElem.className = `trading-stat-large ${colorClass}`;
  }

  if (changeElem) {
    changeElem.textContent = `${sign}${(currentStock.change || 0).toFixed(2)} (${formatPercent(currentStock.changePercent || 0)})`;
    changeElem.className = `trading-stat-label ${colorClass}`;
  }

  // 2. Metrics Grid
  document.getElementById("stat-open").textContent = formatCurrency(currentStock.open || currentStock.price);
  document.getElementById("stat-high").textContent = formatCurrency(currentStock.high || currentStock.price);
  document.getElementById("stat-low").textContent = formatCurrency(currentStock.low || currentStock.price);
  document.getElementById("stat-close").textContent = formatCurrency(currentStock.close || currentStock.previousClose || currentStock.price);
  document.getElementById("stat-volume").textContent = currentStock.volume || "—";
  document.getElementById("stat-52high").textContent = formatCurrency(currentStock.w52High || currentStock.price * 1.15);
  document.getElementById("stat-52low").textContent = formatCurrency(currentStock.w52Low || currentStock.price * 0.85);
  document.getElementById("stat-marketcap").textContent = currentStock.marketCap || "—";
  document.getElementById("stat-pe").textContent = currentStock.pe ? currentStock.pe.toFixed(1) : "—";

  // 3. Stock Switcher dropdown options
  const switcher = document.getElementById("stock-select-dropdown");
  if (switcher && allStocks.length > 0) {
    switcher.innerHTML = allStocks.map(s => `
      <option value="${s.symbol}" ${s.symbol === currentStock.symbol ? "selected" : ""}>
        ${s.symbol} - ${s.name} (${formatCurrency(s.price)})
      </option>
    `).join("");
  }

  // 4. Render Market Depth
  renderMarketDepth(currentStock.depth);

  // 5. Render Chart
  renderStockChart();
}

function renderMarketDepth(depth) {
  const bidsTbody = document.getElementById("depth-bids-body");
  const offersTbody = document.getElementById("depth-offers-body");
  const bidsTotalElem = document.getElementById("depth-bids-total");
  const offersTotalElem = document.getElementById("depth-offers-total");

  if (!bidsTbody || !offersTbody) return;

  const bids = depth?.bids || [
    { orders: 12, qty: 1500, price: currentStock.price - 0.5 },
    { orders: 25, qty: 3200, price: currentStock.price - 1.0 },
    { orders: 18, qty: 2450, price: currentStock.price - 1.5 }
  ];

  const offers = depth?.offers || [
    { orders: 14, qty: 1800, price: currentStock.price + 0.5 },
    { orders: 22, qty: 2900, price: currentStock.price + 1.0 },
    { orders: 19, qty: 3150, price: currentStock.price + 1.5 }
  ];

  let totalBidQty = 0;
  bidsTbody.innerHTML = bids.map(b => {
    totalBidQty += b.qty;
    return `
      <div class="market-depth-row">
        <span style="color:var(--text-muted);">${b.orders}</span>
        <span class="mono">${b.qty.toLocaleString("en-IN")}</span>
        <span class="mono text-up text-bold">${b.price.toFixed(2)}</span>
      </div>
    `;
  }).join("");

  let totalOfferQty = 0;
  offersTbody.innerHTML = offers.map(o => {
    totalOfferQty += o.qty;
    return `
      <div class="market-depth-row">
        <span class="mono text-down text-bold">${o.price.toFixed(2)}</span>
        <span class="mono">${o.qty.toLocaleString("en-IN")}</span>
        <span style="color:var(--text-muted);text-align:right;">${o.orders}</span>
      </div>
    `;
  }).join("");

  if (bidsTotalElem) bidsTotalElem.textContent = totalBidQty.toLocaleString("en-IN");
  if (offersTotalElem) offersTotalElem.textContent = totalOfferQty.toLocaleString("en-IN");
}

function renderStockChart() {
  const container = document.getElementById("stock-chart-svg-container");
  if (!container) return;

  if (currentChartMode === "candle") {
    renderCandlestickSVG(container);
  } else {
    renderLineSVG(container);
  }
}

function renderCandlestickSVG(container) {
  const basePrice = currentStock.price;
  const numCandles = 24;
  const candles = [];
  let prevClose = basePrice * 0.97;

  for (let i = 0; i < numCandles; i++) {
    const change = (Math.random() - 0.48) * (basePrice * 0.015);
    const open = prevClose;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * (basePrice * 0.008);
    const low = Math.min(open, close) - Math.random() * (basePrice * 0.008);
    const isBull = close >= open;

    candles.push({ open, close, high, low, isBull });
    prevClose = close;
  }
  candles[candles.length - 1].close = basePrice;
  candles[candles.length - 1].isBull = basePrice >= candles[candles.length - 1].open;

  const allHighs = candles.map(c => c.high);
  const allLows = candles.map(c => c.low);
  const minPrice = Math.min(...allLows) * 0.998;
  const maxPrice = Math.max(...allHighs) * 1.002;
  const priceRange = maxPrice - minPrice;

  const svgWidth = 600;
  const svgHeight = 240;
  const candleSpacing = svgWidth / numCandles;
  const candleBodyWidth = candleSpacing * 0.65;

  const candleSVGItems = candles.map((c, i) => {
    const xCenter = i * candleSpacing + candleSpacing / 2;
    const yHigh = svgHeight - ((c.high - minPrice) / priceRange) * svgHeight;
    const yLow = svgHeight - ((c.low - minPrice) / priceRange) * svgHeight;
    const yOpen = svgHeight - ((c.open - minPrice) / priceRange) * svgHeight;
    const yClose = svgHeight - ((c.close - minPrice) / priceRange) * svgHeight;

    const yBodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
    const color = c.isBull ? "#16a34a" : "#dc2626";

    return `
      <!-- Wick -->
      <line x1="${xCenter}" y1="${yHigh}" x2="${xCenter}" y2="${yLow}" stroke="${color}" stroke-width="1.5"/>
      <!-- Body -->
      <rect x="${xCenter - candleBodyWidth / 2}" y="${yBodyTop}" width="${candleBodyWidth}" height="${bodyHeight}" fill="${color}" rx="1"/>
    `;
  }).join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" preserveAspectRatio="none">
      <line x1="0" y1="60" x2="${svgWidth}" y2="60" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="0" y1="120" x2="${svgWidth}" y2="120" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="0" y1="180" x2="${svgWidth}" y2="180" stroke="#f1f5f9" stroke-width="1"/>
      ${candleSVGItems}
    </svg>
  `;
}

function renderLineSVG(container) {
  const points = [];
  const svgWidth = 600;
  const svgHeight = 240;

  let y = 140;
  for (let x = 10; x <= svgWidth - 10; x += 25) {
    y += (Math.random() - 0.49) * 20;
    y = Math.max(20, Math.min(220, y));
    points.push({ x, y });
  }

  const dPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${dPath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  container.innerHTML = `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id="stockLineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#stockLineGrad)"/>
      <path d="${dPath}" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;
}

function attachStockDetailsEvents() {
  const buyBtn = document.getElementById("stock-btn-buy");
  const sellBtn = document.getElementById("stock-btn-sell");
  const switcher = document.getElementById("stock-select-dropdown");
  const candleToggle = document.getElementById("toggle-candle-chart");
  const lineToggle = document.getElementById("toggle-line-chart");

  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      openOrderModal({ symbol: currentStock.symbol, mode: "BUY", price: currentStock.price });
    });
  }

  if (sellBtn) {
    sellBtn.addEventListener("click", () => {
      openOrderModal({ symbol: currentStock.symbol, mode: "SELL", price: currentStock.price });
    });
  }

  if (switcher) {
    switcher.addEventListener("change", (e) => {
      const selected = e.target.value;
      window.location.search = `?symbol=${selected}`;
    });
  }

  if (candleToggle && lineToggle) {
    candleToggle.addEventListener("click", () => {
      currentChartMode = "candle";
      candleToggle.classList.add("active");
      lineToggle.classList.remove("active");
      renderStockChart();
    });

    lineToggle.addEventListener("click", () => {
      currentChartMode = "line";
      lineToggle.classList.add("active");
      candleToggle.classList.remove("active");
      renderStockChart();
    });
  }
}
