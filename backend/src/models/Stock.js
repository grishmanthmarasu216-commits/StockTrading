import mongoose from "mongoose";

const depthLevelSchema = new mongoose.Schema(
  {
    orders: { type: Number, default: 0 },
    qty: { type: Number, default: 0 },
    price: { type: Number, required: true }
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, "Symbol is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true
    },
    exchange: {
      type: String,
      default: "NSE",
      uppercase: true
    },
    price: {
      type: Number,
      required: [true, "Current price is required"],
      min: [0.01, "Price must be positive"]
    },
    previousClose: {
      type: Number,
      required: [true, "Previous close price is required"]
    },
    change: {
      type: Number,
      default: 0
    },
    changePercent: {
      type: Number,
      default: 0
    },
    open: { type: Number },
    high: { type: Number },
    low: { type: Number },
    close: { type: Number },
    volume: { type: String, default: "0" },
    w52High: { type: Number },
    w52Low: { type: Number },
    sector: { type: String, default: "General" },
    pe: { type: Number, default: 0 },
    marketCap: { type: String, default: "" },
    depth: {
      bids: [depthLevelSchema],
      offers: [depthLevelSchema]
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const Stock = mongoose.model("Stock", stockSchema);
