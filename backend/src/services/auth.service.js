import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Account } from "../models/Account.js";
import { Watchlist } from "../models/Watchlist.js";
import { PasswordReset } from "../models/PasswordReset.js";
import { ENV } from "../config/env.js";

const DEFAULT_WATCHLISTS = {
  1: ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS", "ICICIBANK", "ITC"],
  2: ["INFY", "TCS", "WIPRO"],
  3: ["HDFCBANK", "ICICIBANK", "SBIN"],
  4: ["TATAMOTORS", "BHARTIARTL", "RELIANCE"],
  5: ["ITC", "SBIN", "WIPRO", "HDFCBANK"]
};

/**
 * Generate a unique Client ID like TN1024
 */
async function generateUniqueClientId() {
  let clientId = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    clientId = `TN${randomNum}`;
    const existing = await User.findOne({ clientId });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  return clientId;
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      clientId: user.clientId
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
}

export async function registerUser({ name, email, password, phone = "" }) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check for duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error("An account with this email address already exists.");
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Generate unique Client ID
  const clientId = await generateUniqueClientId();

  // 4. Create User
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    clientId,
    passwordHash,
    phone: phone.trim(),
    status: "ACTIVE"
  });

  // 5. Create default demo cash Account (₹1,75,000 demo capital)
  const account = await Account.create({
    user: user._id,
    currency: "INR",
    openingBalance: 175000.00,
    availableCash: 175000.00,
    usedMargin: 0.00
  });

  // 6. Create initial Watchlist baskets (1..5)
  for (let basketId = 1; basketId <= 5; basketId++) {
    await Watchlist.create({
      user: user._id,
      basketId,
      symbols: DEFAULT_WATCHLISTS[basketId] || []
    });
  }

  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    account: {
      availableCash: account.availableCash,
      openingBalance: account.openingBalance,
      usedMargin: account.usedMargin
    },
    token
  };
}

export async function loginUser({ identifier, password }) {
  const cleaned = identifier.trim();

  // Find user by either email or clientId
  const user = await User.findOne({
    $or: [
      { email: cleaned.toLowerCase() },
      { clientId: cleaned.toUpperCase() }
    ]
  });

  if (!user) {
    const error = new Error("Invalid credentials. Please verify your Client ID / Email and password.");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("Your account has been suspended. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid credentials. Please verify your Client ID / Email and password.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    user: user.toSafeObject(),
    token
  };
}

export async function requestPasswordReset(identifier) {
  const cleaned = identifier.trim();
  const user = await User.findOne({
    $or: [
      { email: cleaned.toLowerCase() },
      { clientId: cleaned.toUpperCase() }
    ]
  });

  if (!user) {
    // Return friendly generic success to prevent account enumeration
    return {
      message: "If an account matching the provided identifier exists, password reset instructions have been generated.",
      resetToken: null
    };
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Invalidate any existing reset tokens for this user
  await PasswordReset.deleteMany({ user: user._id });

  // Store token with 15-minute expiry
  await PasswordReset.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  });

  console.log(`[PasswordReset] Simulated reset token for ${user.email} (${user.clientId}): ${resetToken}`);

  return {
    message: "Password reset instructions have been generated.",
    resetToken // Exposed in development simulation for verification
  };
}

export async function resetPassword({ token, newPassword }) {
  if (!token || !newPassword || newPassword.length < 6) {
    const error = new Error("A valid reset token and a password of at least 6 characters are required.");
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetRecord = await PasswordReset.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  if (!resetRecord) {
    const error = new Error("Reset token is invalid or has expired. Please request a new reset link.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(resetRecord.user);
  if (!user) {
    const error = new Error("User no longer exists.");
    error.statusCode = 404;
    throw error;
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Mark token used
  resetRecord.used = true;
  await resetRecord.save();

  return {
    message: "Password has been successfully updated. You may now log in with your new password."
  };
}
