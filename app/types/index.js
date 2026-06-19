// Shared constants for the roommate expense tracker.
// (No TypeScript interfaces here — plain JS objects/arrays act as
// the "shape" reference; see comments for the expected fields.)

/**
 * Expense shape:
 * { id, amount, description, category, paidBy, date, createdAt }
 *
 * RoommateConfig shape:
 * { name1, name2, configured }
 *
 * Settlement shape:
 * { owes, owed, amount, settled }
 */

export const CATEGORIES = [
  "Groceries",
  "Rent",
  "Internet",
  "Utilities",
  "Food",
  "Transport",
  "Other",
];

export const CATEGORY_COLORS = {
  Groceries: "#6366f1",
  Rent: "#f59e0b",
  Internet: "#10b981",
  Utilities: "#3b82f6",
  Food: "#ef4444",
  Transport: "#8b5cf6",
  Other: "#6b7280",
};

export const CATEGORY_ICONS = {
  Groceries: "🛒",
  Rent: "🏠",
  Internet: "📡",
  Utilities: "💡",
  Food: "🍔",
  Transport: "🚗",
  Other: "📦",
};
