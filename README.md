# TradeNest — Full-Stack Stock Trading & Portfolio Management Platform

**TradeNest** is a full-stack stock trading simulation and portfolio management web application inspired by fintech trading terminals (like Zerodha Kite) and public investment platforms. It is built strictly with vanilla web standards on the frontend (HTML5, CSS3, Vanilla JS ES6+) and a robust Node.js, Express, MongoDB, and Socket.IO backend.

---

## 🏗️ Architecture Overview

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES Modules), and Chart.js for responsive portfolio analytics. Zero React, Vue, Angular, Next.js, Vite, Tailwind, or Bootstrap.
- **Backend**: Node.js & Express.js REST API with versioned endpoints (`/api/v1`).
- **Database**: MongoDB with Mongoose ODM (data validation, timestamps, indexes, and unique constraints).
- **Real-Time Data**: Socket.IO singleton server-side simulation loop broadcasting tick data (`market:tick`) across all connected clients.
- **Authentication**: Secure HttpOnly cookies and JWT with bcryptjs password hashing and rate limiting.
- **Trading Engine**: Atomic cash deductions, weighted average purchase prices for delivery holdings (CNC), margin exposure for intraday (MIS), realized/unrealized P&L calculations, and duplicate submission protection via Idempotency Keys.

---

## 📁 Project Directory Structure

```
Tradenest/
├── index.html                  # 1. Public Home Page
├── about.html                  # 2. Public About Page
├── technology.html             # 3. Public Technology Page
├── pricing.html                # 4. Public Pricing & Brokerage Calculator
├── login.html                  # 5. Authentication: Login
├── signup.html                 # 6. Authentication: Sign Up
├── forgot-password.html        # 7. Authentication: Forgot Password
├── dashboard.html              # 8. Workspace: Interactive Dashboard (Chart.js charts & summary)
├── stock-details.html          # 9. Workspace: Stock Terminal (Candlestick chart, 5-level depth)
├── orders.html                 # 10. Workspace: Orders Book (All, Open, Executed, Cancelled)
├── holdings.html               # 11. Workspace: Holdings Portfolio (P&L, sector filter, CSV export)
├── positions.html              # 12. Workspace: Positions (Intraday MIS & square off)
├── funds.html                  # 13. Workspace: Funds & Margins (Ledger, deposits, withdrawals)
├── profile.html                # 14. Workspace: Profile & Settings
├── apps.html                   # 15. Workspace: Tools & NestAPI console
│
├── css/                        # Custom modular CSS design system
│   ├── variables.css           # Design tokens, color palette, typography
│   ├── base.css                # Base reset, button styles, badges, form controls
│   ├── components.css          # Modals, toasts, empty states, search boxes
│   ├── public.css              # Public marketing pages styling
│   ├── trading.css             # 2-column workspace layout, watchlist sidebar, cards
│   └── auth.css                # Authentication card styling
│
├── js/                         # Vanilla ES6 JavaScript modules
│   ├── components/             # Reusable UI components
│   │   ├── header.js           # Public navigation header
│   │   ├── tradingNav.js       # Topbar ticker, count badges, user avatar, logout
│   │   ├── watchlist.js        # Persistent 5-basket market watchlist & search
│   │   ├── orderModal.js       # Universal Buy/Sell modal with live margin check
│   │   └── toast.js            # Non-blocking feedback notifications
│   ├── pages/                  # Page-specific business logic
│   │   ├── auth.js             # Form validation, login, registration, password reset
│   │   ├── dashboard.js        # Portfolio metrics, Doughnut chart, Performance line
│   │   ├── orders.js           # Order book, cancellation, order detail modals
│   │   ├── holdings.js         # Holdings table, P&L calculations, CSV export
│   │   ├── positions.js        # Open positions, square off actions
│   │   ├── funds.js            # Balance cards, ledger, deposit/withdraw modals
│   │   ├── stockDetails.js     # Stock statistics, depth, SVG charts
│   │   ├── profile.js          # User profile info and settings
│   │   ├── apps.js             # API key generation console
│   │   └── public.js           # Brokerage calculator and mobile navigation
│   ├── utils/
│   │   ├── api.js              # Centralized fetch API client with Socket.IO integration
│   │   ├── formatters.js       # Currency (₹ Lakhs/Crores), percent, numbers
│   │   └── storage.js          # Local storage fallback utilities
│   └── lib/
│       └── chart.umd.min.js    # Chart.js v4.4.7 local bundle
│
└── backend/                    # Complete Node.js / Express backend
    ├── package.json            # Backend dependencies and scripts
    ├── .env                    # Environment variables (git-ignored)
    ├── .env.example            # Example configuration template
    ├── src/
    │   ├── server.js           # HTTP & Socket.IO server entry point
    │   ├── app.js              # Express app, middleware, routes, static hosting
    │   ├── config/
    │   │   ├── database.js     # Mongoose connection manager
    │   │   └── env.js          # Environment configuration loader
    │   ├── models/             # Mongoose Schemas & Models
    │   │   ├── User.js         # User model with bcrypt verification
    │   │   ├── Account.js      # Cash balance, used margin, opening balance
    │   │   ├── Stock.js        # Stocks catalogue, quotes, 5-level depth
    │   │   ├── Watchlist.js    # Per-user isolated multi-basket watchlists
    │   │   ├── Order.js        # Order execution history, status transitions
    │   │   ├── Holding.js      # Portfolio holdings with weighted average price
    │   │   ├── Position.js     # Intraday MIS exposure and realized P&L
    │   │   ├── Transaction.js  # Audit ledger for deposits, withdrawals, trades
    │   │   └── PasswordReset.js# Single-use reset tokens with TTL cleanup
    │   ├── services/           # Business Logic Layer
    │   │   ├── auth.service.js # Registration, login, JWT issuance, password reset
    │   │   ├── market.service.js# Stock quotes, depth, single-loop simulation ticks
    │   │   ├── trading.service.js# Buy/Sell execution, balance checks, holding updates
    │   │   ├── portfolio.service.js# Holdings metrics, dashboard summaries, charts
    │   │   └── account.service.js# Funds ledger, deposits, withdrawals
    │   ├── controllers/        # REST API Controllers
    │   ├── routes/             # Versioned Express routes (/api/v1/*)
    │   ├── middleware/         # Auth, validation, rate limiting, error handling
    │   ├── sockets/            # Socket.IO singleton simulation broadcaster
    │   ├── scripts/
    │   │   └── seedDemoData.js # Safe, idempotent reference data seeding
    │   └── utils/
    └── tests/
        └── api.test.js         # Automated backend test suite (23/23 passing)
```

---

## ⚡ Quick Start & Run Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0+ (Tested on Node v24.14.0)
- **MongoDB**: Local MongoDB community server (running on `mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI.

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Seed Reference Stocks and Demo Account
The database seed script is completely **idempotent** (running it multiple times will not duplicate stocks or reset user accounts):
```bash
npm run seed
```
*Seeded Demo Credentials:*
- **User ID / Client ID**: `TN1024` (or `alex@tradenest.io`)
- **Password**: `demo1234`
- **PIN**: `123456`

### 4. Run the Full Application (Single-Command)
Start the Express server on port 5000:
```bash
npm start
```
*The Express server automatically serves both the backend REST API on `/api/v1` and the complete TradeNest frontend from the root.*

Open your browser at:
👉 **[http://localhost:5000/](http://localhost:5000/)** (Home Page)
👉 **[http://localhost:5000/login.html](http://localhost:5000/login.html)** (Login Page)
👉 **[http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)** (Trading Terminal)

*(Optional Dual-Server Mode: If you prefer running the frontend separately via Python `python -m http.server 3000`, the frontend automatically communicates with the backend on port 5000 through CORS with credentials enabled).*

---

## 🧪 Automated Testing

The backend includes a comprehensive test suite covering registration, duplicate rejection, login, token authentication, user isolation, stock quotes, watchlists, market buy/sell execution, insufficient funds rejection, holding updates, idempotency protection, dashboard math, and deposits/withdrawals.

To execute tests against an isolated test database (`tradenest_test`):
```bash
cd backend
npm test
```
**Test Results:**
```
✔ GET /api/health returns service status
✔ POST /api/v1/auth/register registers a new user with demo account
✔ POST /api/v1/auth/register rejects duplicate email (409 Conflict)
✔ POST /api/v1/auth/login succeeds with valid credentials
✔ POST /api/v1/auth/login fails with incorrect password (401 Unauthorized)
✔ GET /api/v1/auth/me rejects unauthenticated request
✔ GET /api/v1/auth/me allows authenticated user
✔ Register second user for isolation tests
✔ GET /api/v1/market/stocks returns active stock catalogue
✔ GET /api/v1/market/stocks/:symbol returns specific stock with depth
✔ POST /api/v1/watchlist adds stock and isolates per user
✔ DELETE /api/v1/watchlist/:symbol removes stock
✔ POST /api/v1/orders executes market BUY atomically
✔ POST /api/v1/orders rejects BUY when quantity exceeds available cash
✔ GET /api/v1/holdings reflects updated stock holding and cash
✔ POST /api/v1/orders rejects SELL when user does not own enough shares
✔ POST /api/v1/orders executes SELL successfully for held shares
✔ Duplicate order with identical Idempotency-Key returns existing order
✔ GET /api/v1/dashboard/summary calculates accurate metrics
✔ GET /api/v1/dashboard/performance returns series data
✔ POST /api/v1/account/deposits increases available margin
✔ POST /api/v1/account/withdrawals rejects amount exceeding available cash
✔ User2 cannot access User1's orders or transactions

ℹ tests 23 | pass 23 | fail 0 (100% Passing)
```

---

## 📡 REST API Reference (`/api/v1`)

| Module | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service health status | No |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new user with demo capital | No |
| **Auth** | `POST` | `/api/v1/auth/login` | Login with Client ID/Email & Password | No |
| **Auth** | `POST` | `/api/v1/auth/logout` | Clears HttpOnly session cookie | No |
| **Auth** | `GET` | `/api/v1/auth/me` | Current authenticated user profile | Yes |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | Request password reset token | No |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | Reset password using valid token | No |
| **Market** | `GET` | `/api/v1/market/stocks` | List active stocks with simulated quotes | No |
| **Market** | `GET` | `/api/v1/market/stocks/:symbol` | Single stock with 5-level market depth | No |
| **Watchlist** | `GET` | `/api/v1/watchlist?basketId=1` | Get user's watchlist basket | Yes |
| **Watchlist** | `POST` | `/api/v1/watchlist` | Add stock symbol to watchlist basket | Yes |
| **Watchlist** | `DELETE`| `/api/v1/watchlist/:symbol` | Remove stock from watchlist basket | Yes |
| **Orders** | `POST` | `/api/v1/orders` | Place simulated Buy/Sell order | Yes |
| **Orders** | `GET` | `/api/v1/orders` | Get user order history (paginated) | Yes |
| **Orders** | `GET` | `/api/v1/orders/:id` | Get single order details | Yes |
| **Orders** | `POST` | `/api/v1/orders/:id/cancel` | Cancel eligible pending order | Yes |
| **Holdings** | `GET` | `/api/v1/holdings` | User portfolio holdings & unrealized P&L | Yes |
| **Positions** | `GET` | `/api/v1/positions` | Intraday MIS positions & realized P&L | Yes |
| **Account** | `GET` | `/api/v1/account/funds` | Available margin, cash, ledger summary | Yes |
| **Account** | `POST` | `/api/v1/account/deposits` | Add simulated demo funds | Yes |
| **Account** | `POST` | `/api/v1/account/withdrawals`| Withdraw simulated demo funds | Yes |
| **Ledger** | `GET` | `/api/v1/transactions` | Paginated transaction audit history | Yes |
| **Dashboard**| `GET` | `/api/v1/dashboard/summary` | Unified portfolio valuation & margins | Yes |
| **Dashboard**| `GET` | `/api/v1/dashboard/performance`| Historical performance time series | Yes |

---

## ⚡ WebSocket Events (Socket.IO)

- **`market:tick`** (Server $\to$ Client): Broadcasts array of updated simulated stock prices, daily change, and percentages on a managed 3-second interval.
- **`stock:update`** (Server $\to$ Client): Emitted to individual stock rooms (`stock:RELIANCE`) with detailed tick updates.
- **`subscribe:stock`** (Client $\to$ Server): Joins room for granular stock updates.

---

## ⚖️ Simulated Trading & Educational Disclaimer

TradeNest is strictly an **educational simulation platform** designed for learning and portfolio demonstration.
- No real orders are routed to any stock exchange (NSE/BSE).
- No real brokerage accounts, bank transfers, or payment gateways are used.
- All simulated prices, quotes, margins, holdings, and account balances are strictly virtual demo data.
