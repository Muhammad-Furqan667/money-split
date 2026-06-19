import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  );
}

// Single shared client instance — reused across the app so realtime
// subscriptions don't open duplicate sockets.
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Table names — centralized so renames only happen in one place.
export const TABLES = {
  EXPENSES: "expenses",
  ROOMMATES: "roommates",
};
