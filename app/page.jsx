"use client";

import { useState } from "react";
import { useAppState } from "@/app/hooks/useAppState";
import SetupScreen from "@/app/components/ui/SetupScreen";
import Navbar from "@/app/components/ui/Navbar";
import Dashboard from "@/app/components/dashboard/Dashboard";
import AddExpenseForm from "@/app/components/expenses/AddExpenseForm";
import ExpenseHistory from "@/app/components/expenses/ExpenseHistory";
import Analytics from "@/app/components/analytics/Analytics";
import Settings from "@/app/components/settings/Settings";

export default function Home() {
  const {
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
  } = useAppState();

  const [editingExpense, setEditingExpense] = useState(null);

  // Prevent hydration mismatch: show nothing until client-side state loads
  if (!hydrated) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  // First-time setup
  if (!roommates.configured) {
    return <SetupScreen onComplete={updateRoommates} />;
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setActiveTab("add");
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "add") setEditingExpense(null);
        }}
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
        name1={roommates.name1}
        name2={roommates.name2}
        connectionStatus={connectionStatus}
      />

      <main className="app-main">
        {activeTab === "dashboard" && (
          <Dashboard expenses={expenses} roommates={roommates} onTabChange={setActiveTab} />
        )}

        {activeTab === "add" && (
          <AddExpenseForm
            roommates={roommates}
            onAdd={(data) => addExpense(data)}
            onUpdate={updateExpense}
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {activeTab === "history" && (
          <ExpenseHistory
            expenses={expenses}
            sortedExpenses={sortedExpenses}
            roommates={roommates}
            filters={filters}
            onFilterChange={setFilters}
            onEdit={handleEdit}
            onDelete={deleteExpense}
          />
        )}

        {activeTab === "analytics" && <Analytics expenses={expenses} roommates={roommates} />}

        {activeTab === "settings" && (
          <Settings roommates={roommates} onUpdateRoommates={updateRoommates} onResetData={resetData} />
        )}
      </main>
    </div>
  );
}
