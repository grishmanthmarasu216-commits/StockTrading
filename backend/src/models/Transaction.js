import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAWAL", "TRADE_BUY", "TRADE_SELL"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Transaction amount cannot be negative"]
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS"
    },
    description: {
      type: String,
      default: ""
    },
    mode: {
      type: String,
      default: "Simulation"
    }
  },
  {
    timestamps: true
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
