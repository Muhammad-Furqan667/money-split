"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getExpenses,
  getRoommates,
  getDarkMode,
  saveDarkMode,
  resetAllData as resetLocalExpenses,
  fetchExpensesRemote,
  addExpenseRemote,
  updateExpenseRemote,
  deleteExpenseRemote,
  deleteAllExpensesRemote,
  fetchRoommatesRemote,
  saveRoommatesRemote,
} from "@/app/lib/storage";
import { generateId } from "@/app/lib/calculations";
import { supabase, TABLES } from "@/app/lib/supabase";
import { parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export function useAppState() {
  const [roommates, setRoommates] = useState({ name1: "", name2: "", configured: false });
  const [expenses, setExpenses] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hydrated, setHydrated] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // "connecting" | "online" | "offline"

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    paidBy: "",
    category: "",
    dateFrom: "",
    dateTo: "",
  });

  // Track whether we've already loaded once, to avoid flicker on realtime refetches
  const initialLoadDone = useRef(false);

  // ----------------------------------------------------------
  // INITIAL LOAD: show cached local data instantly (no flash of
  // empty state), then fetch the real shared data from Supabase.
  // ----------------------------------------------------------
  useEffect(() => {
    // 1. Instant paint from local cache (same-device last-known state)
    setRoommates(getRoommates());
    setExpenses(getExpenses());
    setDarkMode(getDarkMode());
    setHydrated(true);

    // 2. Fetch authoritative shared data from Supabase
    (async () => {
      try {
        const [remoteRoommates, remoteExpenses] = await Promise.all([
          fetchRoommatesRemote(),
          fetchExpensesRemote(),
        ]);
        setRoommates(remoteRoommates);
        setExpenses(remoteExpenses);
        setConnectionStatus("online");
      } catch (err) {
        console.error("Initial Supabase load failed:", err);
        setConnectionStatus("offline");
      } finally {
        initialLoadDone.current = true;
      }
    })();
  }, []);

  // ----------------------------------------------------------
  // REALTIME SUBSCRIPTIONS
  // Whenever either roommate's browser writes to Supabase, every
  // other open browser (this one included) gets pushed the change
  // and refetches, so both screens stay in sync live.
  // ----------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;

    const expensesChannel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLES.EXPENSES },
        async () => {
          const fresh = await fetchExpensesRemote();
          setExpenses(fresh);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnectionStatus("online");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnectionStatus("offline");
      });

    const roommatesChannel = supabase
      .channel("roommates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLES.ROOMMATES },
        async () => {
          const fresh = await fetchRoommatesRemote();
          setRoommates(fresh);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(roommatesChannel);
    };
  }, [hydrated]);

  // Apply dark mode to document
  useEffect(() => {
    if (!hydrated) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, hydrated]);

  const updateRoommates = useCallback((config) => {
    setRoommates(config); // optimistic update
    saveRoommatesRemote(config);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      saveDarkMode(next); // dark mode is a local-device preference, not shared
      return next;
    });
  }, []);

  // CRUD for expenses — optimistic local update + fire-and-sync to Supabase.
  // Realtime subscription above will reconcile both screens once the
  // write round-trips, including the roommate's other browser tab.
  const addExpense = useCallback((data) => {
    const newExpense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addExpenseRemote(newExpense).then(({ error }) => {
      if (error) {
        // Roll back optimistic add on failure
        setExpenses((prev) => prev.filter((e) => e.id !== newExpense.id));
      }
    });
    return newExpense;
  }, []);

  const updateExpense = useCallback((id, data) => {
    let previous;
    setExpenses((prev) => {
      previous = prev.find((e) => e.id === id);
      return prev.map((e) => (e.id === id ? { ...e, ...data } : e));
    });
    updateExpenseRemote(id, data).then(({ error }) => {
      if (error && previous) {
        // Roll back on failure
        setExpenses((prev) => prev.map((e) => (e.id === id ? previous : e)));
      }
    });
  }, []);

  const deleteExpense = useCallback((id) => {
    let removed;
    let removedIndex = -1;
    setExpenses((prev) => {
      removedIndex = prev.findIndex((e) => e.id === id);
      removed = prev[removedIndex];
      return prev.filter((e) => e.id !== id);
    });
    deleteExpenseRemote(id).then(({ error }) => {
      if (error && removed) {
        // Roll back on failure — reinsert at original position
        setExpenses((prev) => {
          const next = [...prev];
          next.splice(removedIndex, 0, removed);
          return next;
        });
      }
    });
  }, []);

  const resetData = useCallback(() => {
    setExpenses([]);
    resetLocalExpenses();
    deleteAllExpensesRemote();
  }, []);

  // Filtered expenses for history view
  const filteredExpenses = expenses.filter((e) => {
    if (
      filters.search &&
      !e.description.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.paidBy && e.paidBy !== filters.paidBy) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (filters.dateFrom) {
      try {
        if (
          !isWithinInterval(parseISO(e.date), {
            start: startOfDay(parseISO(filters.dateFrom)),
            end: filters.dateTo ? endOfDay(parseISO(filters.dateTo)) : endOfDay(new Date()),
          })
        )
          return false;
      } catch {
        return true;
      }
    }
    return true;
  });

  // Sort newest first
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return {
    roommates,
    expenses,
    sortedExpenses,
    darkMode,
    activeTab,
    filters,
    hydrated,
    connectionStatus,
    setActiveTab,
    setFilters,
    updateRoommates,
    toggleDarkMode,
    addExpense,
    updateExpense,
    deleteExpense,
    resetData,
  };
}
