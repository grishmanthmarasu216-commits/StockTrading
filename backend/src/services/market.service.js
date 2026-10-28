import { Stock } from "../models/Stock.js";
import { roundToTwo } from "../utils/formatters.js";

// Initial reference stock data matching frontend mockData
export const SEED_STOCKS_DATA = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    exchange: "NSE",
    price: 2948.50,
    previousClose: 2916.35,
    change: 32.15,
    changePercent: 1.10,
    open: 2920.00,
    high: 2962.00,
    low: 2915.20,
    close: 2916.35,
    volume: "4,821,950",
    w52High: 3024.90,
    w52Low: 2220.30,
    marketCap: "₹19.94 Lakh Cr",
    pe: 28.4,
    sector: "Energy / Telecom",
    depth: {
      bids: [
        { orders: 12, qty: 1500, price: 2948.20 },
        { orders: 25, qty: 3200, price: 2947.80 },
        { orders: 18, qty: 2450, price: 2947.00 },
        { orders: 31, qty: 4800, price: 2946.50 },
        { orders: 40, qty: 6100, price: 2945.00 }
      ],
      offers: [
        { orders: 14, qty: 1800, price: 2948.50 },
        { orders: 22, qty: 2900, price: 2949.00 },
        { orders: 19, qty: 3150, price: 2949.50 },
        { orders: 28, qty: 4200, price: 2950.00 },
        { orders: 35, qty: 5900, price: 2951.20 }
      ]
    }
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd",
    exchange: "NSE",
    price: 4182.00,
    previousClose: 4200.75,
    change: -18.75,
    changePercent: -0.45,
    open: 4210.00,
    high: 4225.50,
    low: 4165.00,
    close: 4200.75,
    volume: "1,940,320",
    w52High: 4592.25,
    w52Low: 3313.00,
    marketCap: "₹15.12 Lakh Cr",
    pe: 31.8,
    sector: "Technology",
    depth: {
      bids: [
        { orders: 8, qty: 850, price: 4181.50 },
        { orders: 15, qty: 1400, price: 4180.00 },
        { orders: 22, qty: 2100, price: 4178.50 },
        { orders: 19, qty: 1850, price: 4176.00 },
        { orders: 30, qty: 3200, price: 4175.00 }
      ],
      offers: [
        { orders: 11, qty: 920, price: 4182.00 },
        { orders: 16, qty: 1650, price: 4183.00 },
        { orders: 24, qty: 2400, price: 4184.50 },
        { orders: 27, qty: 2800, price: 4185.00 },
        { orders: 33, qty: 3900, price: 4187.00 }
      ]
    }
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    exchange: "NSE",
    price: 1876.40,
    previousClose: 1851.60,
    change: 24.80,
    changePercent: 1.34,
    open: 1855.00,
    high: 1888.00,
    low: 1852.10,
    close: 1851.60,
    volume: "6,215,800",
    w52High: 1991.45,
    w52Low: 1358.35,
    marketCap: "₹7.79 Lakh Cr",
    pe: 29.1,
    sector: "Technology",
    depth: {
      bids: [
        { orders: 16, qty: 2400, price: 1876.00 },
        { orders: 28, qty: 4100, price: 1875.50 },
        { orders: 34, qty: 5800, price: 1874.80 },
        { orders: 42, qty: 7900, price: 1873.50 },
        { orders: 55, qty: 9200, price: 1872.00 }
      ],
      offers: [
        { orders: 18, qty: 3100, price: 1876.40 },
        { orders: 25, qty: 4500, price: 1877.00 },
        { orders: 30, qty: 5200, price: 1878.00 },
        { orders: 38, qty: 6800, price: 1879.50 },
        { orders: 46, qty: 8100, price: 1881.00 }
      ]
    }
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    exchange: "NSE",
    price: 1684.20,
    previousClose: 1675.80,
    change: 8.40,
    changePercent: 0.50,
    open: 1678.00,
    high: 1692.00,
    low: 1672.40,
    close: 1675.80,
    volume: "8,940,110",
    w52High: 1794.00,
    w52Low: 1363.55,
    marketCap: "₹12.82 Lakh Cr",
    pe: 19.6,
    sector: "Banking",
    depth: {
      bids: [
        { orders: 20, qty: 3500, price: 1684.00 },
        { orders: 32, qty: 5100, price: 1683.20 },
        { orders: 45, qty: 7800, price: 1682.50 },
        { orders: 50, qty: 9200, price: 1681.00 },
        { orders: 62, qty: 11500, price: 1680.00 }
      ],
      offers: [
        { orders: 22, qty: 4200, price: 1684.50 },
        { orders: 29, qty: 5600, price: 1685.00 },
        { orders: 38, qty: 7100, price: 1686.00 },
        { orders: 44, qty: 8900, price: 1687.50 },
        { orders: 58, qty: 12400, price: 1689.00 }
      ]
    }
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Limited",
    exchange: "NSE",
    price: 928.60,
    previousClose: 938.40,
    change: -9.80,
    changePercent: -1.04,
    open: 935.00,
    high: 941.50,
    low: 924.00,
    close: 938.40,
    volume: "7,315,400",
    w52High: 1179.05,
    w52Low: 630.00,
    marketCap: "₹3.42 Lakh Cr",
    pe: 10.2,
    sector: "Automobile",
    depth: {
      bids: [
        { orders: 15, qty: 2800, price: 928.00 },
        { orders: 24, qty: 4200, price: 927.50 },
        { orders: 31, qty: 5900, price: 926.80 },
        { orders: 39, qty: 7100, price: 925.50 },
        { orders: 48, qty: 8900, price: 924.00 }
      ],
      offers: [
        { orders: 18, qty: 3100, price: 928.60 },
        { orders: 22, qty: 4500, price: 929.00 },
        { orders: 29, qty: 6200, price: 930.00 },
        { orders: 36, qty: 7800, price: 931.50 },
        { orders: 44, qty: 9500, price: 933.00 }
      ]
    }
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Limited",
    exchange: "NSE",
    price: 1248.50,
    previousClose: 1232.00,
    change: 16.50,
    changePercent: 1.34,
    open: 1238.00,
    high: 1254.00,
    low: 1235.20,
    close: 1232.00,
    volume: "5,412,000",
    w52High: 1335.00,
    w52Low: 898.00,
    marketCap: "₹8.79 Lakh Cr",
    pe: 18.2,
    sector: "Banking",
    depth: {
      bids: [
        { orders: 14, qty: 2100, price: 1248.00 },
        { orders: 22, qty: 3800, price: 1247.50 },
        { orders: 35, qty: 6200, price: 1246.00 },
        { orders: 40, qty: 8100, price: 1245.00 },
        { orders: 52, qty: 10400, price: 1243.50 }
      ],
      offers: [
        { orders: 16, qty: 2600, price: 1248.50 },
        { orders: 25, qty: 4400, price: 1249.00 },
        { orders: 33, qty: 5900, price: 1250.00 },
        { orders: 42, qty: 7800, price: 1251.50 },
        { orders: 50, qty: 9600, price: 1253.00 }
      ]
    }
  },
  {
    symbol: "ITC",
    name: "ITC Limited",
    exchange: "NSE",
    price: 492.75,
    previousClose: 490.10,
    change: 2.65,
    changePercent: 0.54,
    open: 491.00,
    high: 495.50,
    low: 489.20,
    close: 490.10,
    volume: "9,850,000",
    w52High: 528.55,
    w52Low: 399.30,
    marketCap: "₹6.15 Lakh Cr",
    pe: 27.5,
    sector: "FMCG",
    depth: {
      bids: [
        { orders: 25, qty: 5400, price: 492.50 },
        { orders: 38, qty: 8200, price: 492.00 },
        { orders: 46, qty: 11200, price: 491.50 },
        { orders: 54, qty: 14500, price: 490.80 },
        { orders: 65, qty: 18900, price: 490.00 }
      ],
      offers: [
        { orders: 28, qty: 6100, price: 492.75 },
        { orders: 35, qty: 9400, price: 493.00 },
        { orders: 42, qty: 12800, price: 494.00 },
        { orders: 51, qty: 16200, price: 494.50 },
        { orders: 60, qty: 20100, price: 495.00 }
      ]
    }
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    exchange: "NSE",
    price: 812.30,
    previousClose: 818.00,
    change: -5.70,
    changePercent: -0.70,
    open: 816.00,
    high: 821.40,
    low: 809.00,
    close: 818.00,
    volume: "6,920,000",
    w52High: 912.00,
    w52Low: 555.25,
    marketCap: "₹7.25 Lakh Cr",
    pe: 11.4,
    sector: "Banking",
    depth: {
      bids: [
        { orders: 18, qty: 3200, price: 812.00 },
        { orders: 27, qty: 5400, price: 811.50 },
        { orders: 39, qty: 7900, price: 810.80 },
        { orders: 48, qty: 9800, price: 810.00 },
        { orders: 56, qty: 12500, price: 809.00 }
      ],
      offers: [
        { orders: 20, qty: 3800, price: 812.30 },
        { orders: 29, qty: 6100, price: 813.00 },
        { orders: 36, qty: 8400, price: 814.00 },
        { orders: 45, qty: 10900, price: 815.50 },
        { orders: 54, qty: 13800, price: 817.00 }
      ]
    }
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Limited",
    exchange: "NSE",
    price: 1672.00,
    previousClose: 1655.00,
    change: 17.00,
    changePercent: 1.03,
    open: 1660.00,
    high: 1680.00,
    low: 1658.00,
    close: 1655.00,
    volume: "4,150,000",
    w52High: 1780.00,
    w52Low: 890.00,
    marketCap: "₹9.45 Lakh Cr",
    pe: 45.1,
    sector: "Telecom",
    depth: {
      bids: [
        { orders: 12, qty: 1800, price: 1671.50 },
        { orders: 20, qty: 3100, price: 1670.00 },
        { orders: 28, qty: 4900, price: 1669.00 },
        { orders: 35, qty: 6200, price: 1667.50 },
        { orders: 42, qty: 8100, price: 1665.00 }
      ],
      offers: [
        { orders: 15, qty: 2200, price: 1672.00 },
        { orders: 22, qty: 3800, price: 1673.00 },
        { orders: 29, qty: 5400, price: 1674.50 },
        { orders: 37, qty: 7100, price: 1676.00 },
        { orders: 46, qty: 9300, price: 1678.00 }
      ]
    }
  },
  {
    symbol: "WIPRO",
    name: "Wipro Limited",
    exchange: "NSE",
    price: 542.10,
    previousClose: 546.50,
    change: -4.40,
    changePercent: -0.81,
    open: 548.00,
    high: 550.00,
    low: 540.20,
    close: 546.50,
    volume: "3,890,000",
    w52High: 580.00,
    w52Low: 375.00,
    marketCap: "₹2.83 Lakh Cr",
    pe: 22.8,
    sector: "Technology",
    depth: {
      bids: [
        { orders: 15, qty: 2900, price: 542.00 },
        { orders: 24, qty: 4800, price: 541.50 },
        { orders: 32, qty: 6800, price: 540.80 },
        { orders: 41, qty: 8900, price: 540.00 },
        { orders: 50, qty: 11200, price: 539.00 }
      ],
      offers: [
        { orders: 18, qty: 3400, price: 542.10 },
        { orders: 25, qty: 5200, price: 543.00 },
        { orders: 33, qty: 7400, price: 544.00 },
        { orders: 42, qty: 9800, price: 545.50 },
        { orders: 52, qty: 12600, price: 547.00 }
      ]
    }
  }
];

export async function seedStocksIfEmpty() {
  const count = await Stock.countDocuments();
  if (count === 0) {
    console.log("[MarketService] Seeding initial 10 reference stocks into MongoDB...");
    for (const item of SEED_STOCKS_DATA) {
      await Stock.updateOne(
        { symbol: item.symbol },
        { $set: item },
        { upsert: true }
      );
    }
    console.log("[MarketService] Initial stocks seeded successfully.");
  }
}

export async function getAllStocks(filter = {}) {
  const query = { isActive: true, ...filter };
  return Stock.find(query).sort({ symbol: 1 });
}

export async function getStockBySymbol(symbol) {
  if (!symbol) return null;
  return Stock.findOne({ symbol: symbol.toUpperCase(), isActive: true });
}

export async function searchStocks(query) {
  if (!query || typeof query !== "string") return [];
  const clean = query.trim();
  return Stock.find({
    isActive: true,
    $or: [
      { symbol: { $regex: clean, $options: "i" } },
      { name: { $regex: clean, $options: "i" } }
    ]
  }).limit(20);
}

/**
 * Single managed simulation step on the server
 * Makes gentle micro-fluctuations (±0.1% to 0.3%)
 */
export async function runMarketTick() {
  try {
    const stocks = await Stock.find({ isActive: true });
    const updatedStocks = [];

    for (const stock of stocks) {
      // Pick random change factor between -0.3% and +0.3%
      const deltaPercent = (Math.random() * 0.6 - 0.28) / 100;
      let newPrice = roundToTwo(stock.price * (1 + deltaPercent));
      if (newPrice < 1) newPrice = 1.00;

      const change = roundToTwo(newPrice - stock.previousClose);
      const changePercent = stock.previousClose > 0 ? roundToTwo((change / stock.previousClose) * 100) : 0;

      stock.price = newPrice;
      stock.change = change;
      stock.changePercent = changePercent;
      if (stock.high && newPrice > stock.high) stock.high = newPrice;
      if (stock.low && newPrice < stock.low) stock.low = newPrice;
      stock.lastUpdated = new Date();

      await stock.save();

      updatedStocks.push({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        isPositive: stock.change >= 0,
        lastUpdated: stock.lastUpdated
      });
    }

    return updatedStocks;
  } catch (err) {
    console.error("[MarketService] Market tick simulation error:", err.message);
    return [];
  }
}
