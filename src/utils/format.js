// ============================================================
// LEARN: Shared utility module — one place to define formatting
// helpers so every component uses the same logic.
// If you ever need to change currency, you change it HERE only.
//
// Intl.NumberFormat is the browser-native way to format numbers.
// It handles locale-specific rules (e.g. ₹1,00,000 uses Indian
// grouping: lakh system) automatically when locale = "en-IN".
// ============================================================

/**
 * Format a number as Indian Rupees.
 * e.g. 125000 → ₹1,25,000
 */
export const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Compact format for chart axes — keeps labels short.
 * e.g. 125000 → ₹1.25L   (lakh)
 *      1500000 → ₹15L
 *      500 → ₹500
 */
export const fmtINRCompact = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n}`;
};
