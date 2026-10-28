import mongoose from "mongoose";

const positionSchema = new mongoose.Schema(
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
    product: {
      type: String,
      enum: ["CNC", "MIS"],
      default: "MIS"
    },
    quantity: {
      type: Number,
      required: true
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0, "Average price cannot be negative"]
    },
    realizedPnL: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Position = mongoose.model("Position", positionSchema);
