import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    basketId: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 5
    },
    symbols: [
      {
        type: String,
        uppercase: true,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Enforce unique watchlist basket per user
watchlistSchema.index({ user: 1, basketId: 1 }, { unique: true });

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);
