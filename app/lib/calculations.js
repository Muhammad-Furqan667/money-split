import { CATEGORY_COLORS } from "@/app/types";
import { format, parseISO } from "date-fns";

/**
 * Settlement calculation:
 * 1. Sum what each person paid
 * 2. Each person's fair share = total / 2
 * 3. Person who paid less owes the difference
 */
export function calculateSettlement(expenses, name1, name2) {
  const p1Total = expenses
    .filter((e) => e.paidBy === name1)
    .reduce((sum, e) => sum + e.amount, 0);

  const p2Total = expenses
    .filter((e) => e.paidBy === name2)
    .reduce((sum, e) => sum + e.amount, 0);

  const total = p1Total + p2Total;
  const fairShare = total / 2;

  // Difference: positive means p1 overpaid, negative means p2 overpaid
  const diff = p1Total - fairShare;

  if (Math.abs(diff) < 0.01) {
    return { owes: "", owed: "", amount: 0, settled: true };
  }

  if (diff < 0) {
    // p1 underpaid → p1 owes p2
    return { owes: name1, owed: name2, amount: Math.abs(diff), settled: false };
  } else {
    // p2 underpaid → p2 owes p1
    return { owes: name2, owed: name1, amount: diff, settled: false };
  }
}

export function getDashboardStats(expenses, name1, name2) {
  const p1Total = expenses
    .filter((e) => e.paidBy === name1)
    .reduce((sum, e) => sum + e.amount, 0);

  const p2Total = expenses
    .filter((e) => e.paidBy === name2)
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    totalExpenses: p1Total + p2Total,
    person1Total: p1Total,
    person2Total: p2Total,
    settlement: calculateSettlement(expenses, name1, name2),
  };
}

// Expenses grouped by category for pie chart
export function getExpensesByCategory(expenses) {
  const grouped = {};
  expenses.forEach((e) => {
    grouped[e.category] = (grouped[e.category] || 0) + e.amount;
  });

  return Object.entries(grouped).map(([category, amount]) => ({
    name: category,
    value: amount,
    color: CATEGORY_COLORS[category] || "#6b7280",
  }));
}

// Monthly spending totals for trend chart
export function getMonthlyTotals(expenses) {
  const monthly = {};

  expenses.forEach((e) => {
    const month = format(parseISO(e.date), "MMM yyyy");
    if (!monthly[month]) monthly[month] = { total: 0, count: 0 };
    monthly[month].total += e.amount;
    monthly[month].count += 1;
  });

  // Sort chronologically
  return Object.entries(monthly)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => new Date(a.month) - new Date(b.month));
}

// Per-person spending by category
export function getSpendingByPerson(expenses, name1, name2) {
  const p1 = expenses.filter((e) => e.paidBy === name1);
  const p2 = expenses.filter((e) => e.paidBy === name2);

  const sumByCategory = (exps) => {
    const grouped = {};
    exps.forEach((e) => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return grouped;
  };

  return { [name1]: sumByCategory(p1), [name2]: sumByCategory(p2) };
}

// CSV export
export function exportToCSV(expenses, name1, name2) {
  const headers = ["Date", "Description", "Category", "Amount (Rs.)", "Paid By"];
  const rows = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((e) => [
      format(parseISO(e.date), "dd/MM/yyyy"),
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      e.amount.toFixed(2),
      e.paidBy,
    ]);

  const stats = getDashboardStats(expenses, name1, name2);
  const summary = [
    [],
    ["--- Summary ---"],
    [`Total Expenses`, `Rs. ${stats.totalExpenses.toFixed(2)}`],
    [`${name1} paid`, `Rs. ${stats.person1Total.toFixed(2)}`],
    [`${name2} paid`, `Rs. ${stats.person2Total.toFixed(2)}`],
    [
      "Settlement",
      stats.settlement.settled
        ? "All settled up"
        : `${stats.settlement.owes} owes ${stats.settlement.owed} Rs. ${stats.settlement.amount.toFixed(2)}`,
    ],
  ];

  return [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
    ...summary.map((r) => r.join(",")),
  ].join("\n");
}

export function formatAmount(amount) {
  return `Rs. ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
