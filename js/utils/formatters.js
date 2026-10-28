/**
 * TradeNest Formatting Utilities
 * Standardized Indian currency (INR), percentage, and numeric formatters
 */

/**
 * Format a number as Indian Rupee (INR)
 * @param {number} value
 * @param {boolean} includeSymbol - prepend ₹
 * @returns {string}
 */
export function formatCurrency(value, includeSymbol = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return includeSymbol ? "₹0.00" : "0.00";
  }

  const absVal = Math.abs(value);
  const formatted = absVal.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const sign = value < 0 ? "-" : "";
  return includeSymbol ? `${sign}₹${formatted}` : `${sign}${formatted}`;
}

/**
 * Format a decimal or percentage value with +/- sign
 * @param {number} value
 * @param {boolean} includeSign
 * @returns {string}
 */
export function formatPercent(value, includeSign = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00%";
  }

  const formatted = Math.abs(value).toFixed(2);
  if (includeSign) {
    if (value > 0) return `+${formatted}%`;
    if (value < 0) return `-${formatted}%`;
  }
  return `${formatted}%`;
}

/**
 * Format numbers with thousands separators
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format a modern timestamp (HH:MM:SS)
 * @param {Date|string} date
 * @returns {string}
 */
export function formatTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toTimeString().split(" ")[0];
}
