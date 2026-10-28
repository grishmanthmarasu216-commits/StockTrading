/**
 * TradeNest Centralized Mock Data
 * Realistic simulated market data, instruments, portfolio, and user state
 */

export const MOCK_INDICES = [
  { symbol: "NIFTY 50", value: 24852.15, change: 124.30, changePercent: 0.50, isPositive: true },
  { symbol: "SENSEX", value: 81385.40, change: 390.20, changePercent: 0.48, isPositive: true },
  { symbol: "BANK NIFTY", value: 51210.80, change: -112.40, changePercent: -0.22, isPositive: false }
];

export const MOCK_STOCKS = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    exchange: "NSE",
    price: 2948.50,
    change: 32.15,
    changePercent: 1.10,
    isPositive: true,
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
    change: -18.75,
    changePercent: -0.45,
    isPositive: false,
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
    change: 24.80,
    changePercent: 1.34,
    isPositive: true,
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
        { orders: 25, qty: 3400, price: 1876.00 },
        { orders: 32, qty: 4500, price: 1875.50 },
        { orders: 40, qty: 6200, price: 1875.00 },
        { orders: 18, qty: 2900, price: 1874.00 },
        { orders: 45, qty: 7800, price: 1872.50 }
      ],
      offers: [
        { orders: 19, qty: 2800, price: 1876.40 },
        { orders: 29, qty: 4100, price: 1877.00 },
        { orders: 35, qty: 5400, price: 1878.00 },
        { orders: 42, qty: 6700, price: 1879.50 },
        { orders: 50, qty: 8900, price: 1880.00 }
      ]
    }
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    exchange: "NSE",
    price: 1684.20,
    change: 9.35,
    changePercent: 0.56,
    isPositive: true,
    open: 1675.00,
    high: 1692.00,
    low: 1671.00,
    close: 1674.85,
    volume: "9,120,400",
    w52High: 1794.00,
    w52Low: 1363.55,
    marketCap: "₹12.82 Lakh Cr",
    pe: 19.8,
    sector: "Banking",
    depth: {
      bids: [
        { orders: 35, qty: 5600, price: 1684.00 },
        { orders: 42, qty: 6900, price: 1683.50 },
        { orders: 50, qty: 8100, price: 1682.00 },
        { orders: 38, qty: 5400, price: 1681.00 },
        { orders: 60, qty: 11200, price: 1680.00 }
      ],
      offers: [
        { orders: 28, qty: 4500, price: 1684.50 },
        { orders: 36, qty: 5800, price: 1685.00 },
        { orders: 45, qty: 7200, price: 1686.00 },
        { orders: 52, qty: 8900, price: 1687.50 },
        { orders: 65, qty: 12400, price: 1689.00 }
      ]
    }
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Limited",
    exchange: "NSE",
    price: 928.60,
    change: -11.20,
    changePercent: -1.19,
    isPositive: false,
    open: 942.00,
    high: 946.50,
    low: 924.00,
    close: 939.80,
    volume: "8,450,110",
    w52High: 1179.05,
    w52Low: 618.35,
    marketCap: "₹3.41 Lakh Cr",
    pe: 10.2,
    sector: "Automobile",
    depth: {
      bids: [
        { orders: 18, qty: 2900, price: 928.20 },
        { orders: 25, qty: 3800, price: 927.50 },
        { orders: 30, qty: 4900, price: 926.00 },
        { orders: 40, qty: 6500, price: 925.00 },
        { orders: 48, qty: 8200, price: 924.00 }
      ],
      offers: [
        { orders: 20, qty: 3100, price: 928.60 },
        { orders: 28, qty: 4400, price: 929.00 },
        { orders: 34, qty: 5600, price: 930.00 },
        { orders: 44, qty: 7100, price: 931.50 },
        { orders: 55, qty: 9500, price: 932.00 }
      ]
    }
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Limited",
    exchange: "NSE",
    price: 1256.40,
    change: 14.10,
    changePercent: 1.14,
    isPositive: true,
    open: 1245.00,
    high: 1262.50,
    low: 1242.00,
    close: 1242.30,
    volume: "5,340,900",
    w52High: 1335.00,
    w52Low: 910.00,
    marketCap: "₹8.85 Lakh Cr",
    pe: 18.2,
    sector: "Banking",
    depth: {
      bids: [
        { orders: 19, qty: 2800, price: 1256.00 },
        { orders: 26, qty: 4100, price: 1255.50 },
        { orders: 33, qty: 5200, price: 1254.00 },
        { orders: 38, qty: 6100, price: 1253.00 },
        { orders: 49, qty: 8400, price: 1251.50 }
      ],
      offers: [
        { orders: 21, qty: 3200, price: 1256.40 },
        { orders: 30, qty: 4700, price: 1257.00 },
        { orders: 37, qty: 5900, price: 1258.50 },
        { orders: 45, qty: 7300, price: 1259.00 },
        { orders: 52, qty: 9100, price: 1260.00 }
      ]
    }
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    exchange: "NSE",
    price: 812.30,
    change: -4.50,
    changePercent: -0.55,
    isPositive: false,
    open: 818.00,
    high: 821.50,
    low: 809.00,
    close: 816.80,
    volume: "11,850,200",
    w52High: 912.10,
    w52Low: 555.25,
    marketCap: "₹7.25 Lakh Cr",
    pe: 11.5,
    sector: "Banking",
    depth: {
      bids: [
        { orders: 22, qty: 3900, price: 812.00 },
        { orders: 31, qty: 5400, price: 811.50 },
        { orders: 42, qty: 7200, price: 810.00 },
        { orders: 50, qty: 9100, price: 809.50 },
        { orders: 65, qty: 13500, price: 808.00 }
      ],
      offers: [
        { orders: 25, qty: 4200, price: 812.50 },
        { orders: 33, qty: 5800, price: 813.00 },
        { orders: 44, qty: 7600, price: 814.00 },
        { orders: 53, qty: 9800, price: 815.00 },
        { orders: 68, qty: 14200, price: 816.00 }
      ]
    }
  },
  {
    symbol: "ITC",
    name: "ITC Limited",
    exchange: "NSE",
    price: 492.75,
    change: 3.80,
    changePercent: 0.78,
    isPositive: true,
    open: 489.50,
    high: 495.00,
    low: 488.00,
    close: 488.95,
    volume: "7,320,000",
    w52High: 524.00,
    w52Low: 399.30,
    marketCap: "₹6.15 Lakh Cr",
    pe: 28.6,
    sector: "FMCG",
    depth: {
      bids: [
        { orders: 30, qty: 5200, price: 492.50 },
        { orders: 42, qty: 7400, price: 492.00 },
        { orders: 55, qty: 9800, price: 491.50 },
        { orders: 60, qty: 11200, price: 491.00 },
        { orders: 75, qty: 15400, price: 490.00 }
      ],
      offers: [
        { orders: 28, qty: 4800, price: 492.75 },
        { orders: 39, qty: 6900, price: 493.00 },
        { orders: 49, qty: 8700, price: 493.50 },
        { orders: 58, qty: 10500, price: 494.00 },
        { orders: 70, qty: 13900, price: 495.00 }
      ]
    }
  },
  {
    symbol: "WIPRO",
    name: "Wipro Limited",
    exchange: "NSE",
    price: 548.10,
    change: 5.25,
    changePercent: 0.97,
    isPositive: true,
    open: 543.00,
    high: 552.00,
    low: 541.20,
    close: 542.85,
    volume: "3,890,100",
    w52High: 580.00,
    w52Low: 375.00,
    marketCap: "₹2.86 Lakh Cr",
    pe: 23.4,
    sector: "Technology",
    depth: {
      bids: [
        { orders: 15, qty: 2400, price: 548.00 },
        { orders: 22, qty: 3500, price: 547.50 },
        { orders: 31, qty: 4800, price: 546.50 },
        { orders: 38, qty: 5900, price: 545.00 },
        { orders: 45, qty: 7200, price: 544.00 }
      ],
      offers: [
        { orders: 17, qty: 2700, price: 548.10 },
        { orders: 25, qty: 3900, price: 548.50 },
        { orders: 33, qty: 5100, price: 549.00 },
        { orders: 40, qty: 6400, price: 550.00 },
        { orders: 48, qty: 8100, price: 551.00 }
      ]
    }
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Limited",
    exchange: "NSE",
    price: 1695.50,
    change: 18.20,
    changePercent: 1.09,
    isPositive: true,
    open: 1680.00,
    high: 1708.00,
    low: 1675.00,
    close: 1677.30,
    volume: "4,120,700",
    w52High: 1780.00,
    w52Low: 902.50,
    marketCap: "₹10.15 Lakh Cr",
    pe: 45.2,
    sector: "Telecom",
    depth: {
      bids: [
        { orders: 16, qty: 2200, price: 1695.00 },
        { orders: 24, qty: 3400, price: 1694.50 },
        { orders: 32, qty: 4600, price: 1693.00 },
        { orders: 41, qty: 6100, price: 1691.50 },
        { orders: 50, qty: 7800, price: 1690.00 }
      ],
      offers: [
        { orders: 18, qty: 2500, price: 1695.50 },
        { orders: 27, qty: 3800, price: 1696.00 },
        { orders: 36, qty: 5200, price: 1697.50 },
        { orders: 44, qty: 6800, price: 1699.00 },
        { orders: 55, qty: 8900, price: 1700.00 }
      ]
    }
  }
];

export const MOCK_WATCHLIST_BASKETS = {
  1: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS", "ICICIBANK", "ITC"],
  2: ["INFY", "TCS", "WIPRO"],
  3: ["HDFCBANK", "ICICIBANK", "SBIN"],
  4: ["TATAMOTORS", "BHARTIARTL", "RELIANCE"],
  5: ["ITC", "SBIN", "WIPRO", "HDFCBANK"]
};

export const INITIAL_HOLDINGS = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    qty: 60,
    avgPrice: 2620.00,
    curPrice: 2948.50,
    sector: "Energy / Telecom"
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    qty: 40,
    avgPrice: 3890.00,
    curPrice: 4182.00,
    sector: "Technology"
  },
  {
    symbol: "INFY",
    name: "Infosys Limited",
    qty: 120,
    avgPrice: 1540.00,
    curPrice: 1876.40,
    sector: "Technology"
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    qty: 100,
    avgPrice: 1510.50,
    curPrice: 1684.20,
    sector: "Banking"
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Limited",
    qty: 85,
    avgPrice: 840.00,
    curPrice: 928.60,
    sector: "Automobile"
  },
  {
    symbol: "ITC",
    name: "ITC Limited",
    qty: 250,
    avgPrice: 435.00,
    curPrice: 492.75,
    sector: "FMCG"
  },
  {
    symbol: "SBIN",
    name: "State Bank of India",
    qty: 70,
    avgPrice: 720.00,
    curPrice: 812.30,
    sector: "Banking"
  }
];

export const INITIAL_POSITIONS = [
  {
    id: "POS-1001",
    product: "MIS",
    symbol: "INFY",
    name: "Infosys Ltd",
    qty: 50,
    avgPrice: 1864.00,
    curPrice: 1876.40,
    realizedPnL: 0,
    status: "OPEN"
  },
  {
    id: "POS-1002",
    product: "MIS",
    symbol: "TATAMOTORS",
    name: "Tata Motors Ltd",
    qty: -30,
    avgPrice: 935.00,
    curPrice: 928.60,
    realizedPnL: 192.00,
    status: "OPEN"
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ORD-98214",
    time: "09:24:15",
    type: "BUY",
    symbol: "INFY",
    product: "MIS",
    qty: 50,
    filledQty: 50,
    price: 1864.00,
    status: "COMPLETE"
  },
  {
    id: "ORD-98215",
    time: "09:41:02",
    type: "SELL",
    symbol: "TATAMOTORS",
    product: "MIS",
    qty: 30,
    filledQty: 30,
    price: 935.00,
    status: "COMPLETE"
  },
  {
    id: "ORD-98216",
    time: "10:15:30",
    type: "BUY",
    symbol: "RELIANCE",
    product: "CNC",
    qty: 15,
    filledQty: 0,
    price: 2925.00,
    status: "OPEN"
  }
];

export const INITIAL_FUNDS = {
  availableMargin: 142850.00,
  usedMargin: 32150.00,
  openingBalance: 175000.00,
  payin: 0.00,
  spanMargin: 21400.00,
  exposureMargin: 10750.00,
  collateralLiquid: 50000.00,
  transactions: [
    {
      id: "TXN-87421",
      date: "2026-10-16 11:30",
      type: "Deposit",
      amount: 50000.00,
      mode: "UPI (Simulated)",
      status: "SUCCESS"
    },
    {
      id: "TXN-86940",
      date: "2026-10-10 14:15",
      type: "Withdrawal",
      amount: 25000.00,
      mode: "NEFT to HDFC Bank (Simulated)",
      status: "SUCCESS"
    },
    {
      id: "TXN-85122",
      date: "2026-10-01 09:45",
      type: "Deposit",
      amount: 150000.00,
      mode: "Net Banking (Simulated)",
      status: "SUCCESS"
    }
  ]
};

export const USER_PROFILE = {
  name: "Alex Morgan",
  clientId: "TN1024",
  email: "alex.morgan@tradenest.demo",
  phone: "+91 98765 43210",
  pan: "ABCDE1234F",
  boId: "1208160001234567",
  dpId: "IN300124",
  bankName: "HDFC Bank Ltd",
  bankAccount: "•••• •••• 4920",
  ifsc: "HDFC0001234",
  status: "Active (Simulated Mode)",
  segments: ["NSE Equity", "BSE Equity", "NSE Futures & Options", "Currency Derivatives"]
};

export const SIMULATED_PORTFOLIO_HISTORY = {
  "1W": [
    { date: "Oct 12", factor: 0.982 },
    { date: "Oct 13", factor: 0.986 },
    { date: "Oct 14", factor: 0.979 },
    { date: "Oct 15", factor: 0.988 },
    { date: "Oct 16", factor: 0.993 },
    { date: "Oct 17", factor: 0.996 },
    { date: "Oct 18", factor: 1.000 }
  ],
  "1M": [
    { date: "Sep 18", factor: 0.924 },
    { date: "Sep 21", factor: 0.932 },
    { date: "Sep 25", factor: 0.928 },
    { date: "Sep 29", factor: 0.945 },
    { date: "Oct 02", factor: 0.952 },
    { date: "Oct 06", factor: 0.960 },
    { date: "Oct 09", factor: 0.968 },
    { date: "Oct 13", factor: 0.979 },
    { date: "Oct 16", factor: 0.993 },
    { date: "Oct 18", factor: 1.000 }
  ],
  "3M": [
    { date: "Jul 20", factor: 0.865 },
    { date: "Jul 27", factor: 0.872 },
    { date: "Aug 03", factor: 0.884 },
    { date: "Aug 10", factor: 0.878 },
    { date: "Aug 17", factor: 0.895 },
    { date: "Aug 24", factor: 0.908 },
    { date: "Aug 31", factor: 0.920 },
    { date: "Sep 07", factor: 0.915 },
    { date: "Sep 14", factor: 0.930 },
    { date: "Sep 21", factor: 0.942 },
    { date: "Sep 28", factor: 0.965 },
    { date: "Oct 05", factor: 0.974 },
    { date: "Oct 12", factor: 0.988 },
    { date: "Oct 18", factor: 1.000 }
  ],
  "1Y": [
    { date: "Oct 2025", factor: 0.742 },
    { date: "Nov 2025", factor: 0.760 },
    { date: "Dec 2025", factor: 0.785 },
    { date: "Jan 2026", factor: 0.812 },
    { date: "Feb 2026", factor: 0.805 },
    { date: "Mar 2026", factor: 0.830 },
    { date: "Apr 2026", factor: 0.852 },
    { date: "May 2026", factor: 0.870 },
    { date: "Jun 2026", factor: 0.895 },
    { date: "Jul 2026", factor: 0.915 },
    { date: "Aug 2026", factor: 0.940 },
    { date: "Sep 2026", factor: 0.970 },
    { date: "Oct 2026", factor: 1.000 }
  ]
};
