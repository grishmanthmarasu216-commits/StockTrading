import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ]
    },
    clientId: {
      type: String,
      required: [true, "Client ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"]
    },
    pin: {
      type: String,
      default: "123456",
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    }
  },
  {
    timestamps: true
  }
);

// Method to verify password securely
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Safe JSON serialization omitting passwordHash and internal fields
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    clientId: this.clientId,
    phone: this.phone,
    status: this.status,
    createdAt: this.createdAt
  };
};

export const User = mongoose.model("User", userSchema);
