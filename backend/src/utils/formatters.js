/**
 * Standard server-side financial formatting and calculation utilities
 */

export function roundToTwo(num) {
  return Math.round((Number(num) || 0) * 100) / 100;
}

export function calculatePercentage(part, whole) {
  if (!whole || whole <= 0) return 0;
  return roundToTwo(((part) / whole) * 100);
}

export function successResponse(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function errorResponse(res, message = "Error occurred", statusCode = 400, errors = null) {
  const payload = {
    success: false,
    message
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}
