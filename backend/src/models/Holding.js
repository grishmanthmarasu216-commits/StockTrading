import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
      min: [0, "Holding quantity cannot be negative"]
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0, "Average price cannot be negative"]
    }
  },
  {
    timestamps: true
  }
);

holdingSchema.index({ user: 1, stock: 1 }, { unique: true });

export const Holding = mongoose.model("Holding", holdingSchema);
