import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 175000.00,
      min: [0, "Opening balance cannot be negative"]
    },
    availableCash: {
      type: Number,
      required: true,
      default: 142850.00,
      min: [0, "Available cash cannot be negative"]
    },
    usedMargin: {
      type: Number,
      required: true,
      default: 32150.00,
      min: [0, "Used margin cannot be negative"]
    },
    payin: {
      type: Number,
      default: 0.00
    },
    spanMargin: {
      type: Number,
      default: 21400.00
    },
    exposureMargin: {
      type: Number,
      default: 10750.00
    },
    collateralLiquid: {
      type: Number,
      default: 50000.00
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

accountSchema.virtual("availableMargin").get(function () {
  return this.availableCash;
});

accountSchema.virtual("totalBalance").get(function () {
  return this.availableCash + this.usedMargin;
});

export const Account = mongoose.model("Account", accountSchema);
