import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true
    },
    product: {
      type: String,
      enum: ["CNC", "MIS"],
      default: "CNC"
    },
    orderType: {
      type: String,
      enum: ["MARKET", "LIMIT"],
      default: "MARKET"
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    },
    requestedPrice: {
      type: Number,
      default: null
    },
    executionPrice: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETE", "CANCELLED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    filledQty: {
      type: Number,
      default: 0
    },
    rejectionReason: {
      type: String,
      default: null
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model("Order", orderSchema);
