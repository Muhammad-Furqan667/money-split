import { supabase, TABLES } from "@/app/lib/supabase";

const KEYS = {
  ROOMMATES: "rt_roommates",
  EXPENSES: "rt_expenses",
  DARK_MODE: "rt_dark_mode",
};

// Safe localStorage wrapper — SSR guard
function safeGet(key) {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    console.warn("localStorage write failed:", key);
  }
}

function safeRemove(key) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

// Roommate config
export function getRoommates() {
  const raw = safeGet(KEYS.ROOMMATES);
  if (!raw) return { name1: "", name2: "", configured: false };
  try {
    return JSON.parse(raw);
  } catch {
    return { name1: "", name2: "", configured: false };
  }
}

export function saveRoommates(config) {
  safeSet(KEYS.ROOMMATES, JSON.stringify(config));
}

// Expenses
export function getExpenses() {
  const raw = safeGet(KEYS.EXPENSES);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveExpenses(expenses) {
  safeSet(KEYS.EXPENSES, JSON.stringify(expenses));
}

// Dark mode
export function getDarkMode() {
  const raw = safeGet(KEYS.DARK_MODE);
  return raw === "true";
}

export function saveDarkMode(dark) {
  safeSet(KEYS.DARK_MODE, String(dark));
}

// Full backup/restore
export function exportBackup() {
  return {
    roommates: getRoommates(),
    expenses: getExpenses(),
    darkMode: getDarkMode(),
  };
}

export function importBackup(state) {
  saveRoommates(state.roommates);
  saveExpenses(state.expenses);
  saveDarkMode(state.darkMode);
}

// Reset expenses only (keeps names + dark mode preference)
export function resetAllData() {
  safeRemove(KEYS.EXPENSES);
}

export function resetEverything() {
  safeRemove(KEYS.ROOMMATES);
  safeRemove(KEYS.EXPENSES);
  safeRemove(KEYS.DARK_MODE);
}

// ============================================================
// SUPABASE REMOTE LAYER
// This is the shared, real-time source of truth between the two
// roommates. localStorage above is kept only as a same-device
// cache so the dashboard isn't blank for a split second on load,
// and as a fallback if Supabase is briefly unreachable.
// ============================================================

// Convert DB row (snake_case) → app Expense (camelCase)
function rowToExpense(row) {
  return {
    id: row.id,
    amount: Number(row.amount),
    description: row.description,
    category: row.category,
    paidBy: row.paid_by,
    date: row.date,
    createdAt: row.created_at,
  };
}

// Convert app Expense → DB row shape for insert/update
function expenseToRow(expense) {
  return {
    id: expense.id,
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
    paid_by: expense.paidBy,
    date: expense.date,
    ...(expense.createdAt ? { created_at: expense.createdAt } : {}),
  };
}

export async function fetchExpensesRemote() {
  const { data, error } = await supabase
    .from(TABLES.EXPENSES)
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("fetchExpensesRemote error:", error.message);
    return getExpenses(); // fall back to local cache
  }
  const expenses = (data || []).map(rowToExpense);
  saveExpenses(expenses); // keep local cache warm
  return expenses;
}

export async function addExpenseRemote(expense) {
  const { error } = await supabase.from(TABLES.EXPENSES).insert(expenseToRow(expense));
  if (error) console.error("addExpenseRemote error:", error.message);
  return { error: error?.message || null };
}

export async function updateExpenseRemote(id, data) {
  const patch = {};
  if (data.amount !== undefined) patch.amount = data.amount;
  if (data.description !== undefined) patch.description = data.description;
  if (data.category !== undefined) patch.category = data.category;
  if (data.paidBy !== undefined) patch.paid_by = data.paidBy;
  if (data.date !== undefined) patch.date = data.date;

  const { error } = await supabase.from(TABLES.EXPENSES).update(patch).eq("id", id);
  if (error) console.error("updateExpenseRemote error:", error.message);
  return { error: error?.message || null };
}

export async function deleteExpenseRemote(id) {
  const { error } = await supabase.from(TABLES.EXPENSES).delete().eq("id", id);
  if (error) console.error("deleteExpenseRemote error:", error.message);
  return { error: error?.message || null };
}

export async function deleteAllExpensesRemote() {
  // delete() requires a filter — this matches every row since id is never null
  const { error } = await supabase.from(TABLES.EXPENSES).delete().not("id", "is", null);
  if (error) console.error("deleteAllExpensesRemote error:", error.message);
  return { error: error?.message || null };
}

export async function fetchRoommatesRemote() {
  const { data, error } = await supabase
    .from(TABLES.ROOMMATES)
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("fetchRoommatesRemote error:", error?.message);
    return getRoommates(); // fall back to local cache
  }

  const config = {
    name1: data.name1 || "",
    name2: data.name2 || "",
    configured: !!data.configured,
  };
  saveRoommates(config);
  return config;
}

export async function saveRoommatesRemote(config) {
  const { error } = await supabase
    .from(TABLES.ROOMMATES)
    .update({
      name1: config.name1,
      name2: config.name2,
      configured: config.configured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) console.error("saveRoommatesRemote error:", error.message);
  saveRoommates(config); // keep local cache in sync regardless
  return { error: error?.message || null };
}
