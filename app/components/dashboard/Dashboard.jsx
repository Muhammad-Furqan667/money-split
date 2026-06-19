"use client";

import { getDashboardStats, formatAmount } from "@/app/lib/calculations";
import {
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import "@/app/styles/common.css";
import "./Dashboard.css";

const QUICK_ADD_ITEMS = [
  { label: "Groceries", emoji: "🛒" },
  { label: "Rent", emoji: "🏠" },
  { label: "Internet", emoji: "📡" },
  { label: "Utilities", emoji: "💡" },
  { label: "Food", emoji: "🍔" },
  { label: "Transport", emoji: "🚗" },
];

const CATEGORY_EMOJI = {
  Groceries: "🛒",
  Rent: "🏠",
  Internet: "📡",
  Utilities: "💡",
  Food: "🍔",
  Transport: "🚗",
  Other: "📦",
};

export default function Dashboard({ expenses, roommates, onTabChange }) {
  const stats = getDashboardStats(expenses, roommates.name1, roommates.name2);
  const { settlement } = stats;

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {roommates.name1} & {roommates.name2}'s shared expenses
          </p>
        </div>
        <button onClick={() => onTabChange("add")} className="btn-primary">
          <PlusCircle size={16} />
          <span className="btn-text-desktop">Add Expense</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Total Spent</span>
            <div className="stat-icon stat-icon-indigo">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="stat-value">{formatAmount(stats.totalExpenses)}</p>
          <p className="stat-meta">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label stat-card-label-truncate">{roommates.name1}</span>
            <div className="stat-icon stat-icon-emerald">
              <Wallet size={18} />
            </div>
          </div>
          <p className="stat-value">{formatAmount(stats.person1Total)}</p>
          <p className="stat-meta">
            {stats.totalExpenses > 0
              ? `${((stats.person1Total / stats.totalExpenses) * 100).toFixed(0)}% of total`
              : "No expenses yet"}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label stat-card-label-truncate">{roommates.name2}</span>
            <div className="stat-icon stat-icon-violet">
              <Wallet size={18} />
            </div>
          </div>
          <p className="stat-value">{formatAmount(stats.person2Total)}</p>
          <p className="stat-meta">
            {stats.totalExpenses > 0
              ? `${((stats.person2Total / stats.totalExpenses) * 100).toFixed(0)}% of total`
              : "No expenses yet"}
          </p>
        </div>
      </div>

      {/* Settlement Banner */}
      <div className={`settlement-banner ${settlement.settled ? "settlement-settled" : "settlement-pending"}`}>
        <div className={`settlement-icon ${settlement.settled ? "settlement-icon-settled" : "settlement-icon-pending"}`}>
          {settlement.settled ? <CheckCircle2 size={24} /> : <ArrowRightLeft size={24} />}
        </div>
        <div className="settlement-text">
          <p className="settlement-label">Settlement Status</p>
          {settlement.settled ? (
            <p className="settlement-amount settlement-amount-settled">All settled up! 🎉</p>
          ) : (
            <p className="settlement-amount settlement-amount-pending">
              <strong>{settlement.owes}</strong> owes <strong>{settlement.owed}</strong>{" "}
              <span className="settlement-figure">{formatAmount(settlement.amount)}</span>
            </p>
          )}
          {!settlement.settled && (
            <p className="settlement-share">
              Each person's fair share: {formatAmount(stats.totalExpenses / 2)}
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="section-heading">Quick Add</h2>
        <div className="quick-add-grid">
          {QUICK_ADD_ITEMS.map((item) => (
            <button key={item.label} onClick={() => onTabChange("add")} className="quick-add-btn">
              <span className="quick-add-emoji">{item.emoji}</span>
              <span className="quick-add-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="recent-header">
          <h2 className="section-heading">Recent Expenses</h2>
          {expenses.length > 5 && (
            <button onClick={() => onTabChange("history")} className="link-btn">
              View all →
            </button>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="empty-state">
            <p className="empty-emoji">💸</p>
            <p className="empty-title">No expenses yet</p>
            <p className="empty-desc">Add your first expense to get started</p>
            <button onClick={() => onTabChange("add")} className="btn-primary empty-cta">
              Add Expense
            </button>
          </div>
        ) : (
          <div className="recent-list">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="recent-row">
                <span className="recent-emoji">{CATEGORY_EMOJI[expense.category] || "📦"}</span>
                <div className="recent-info">
                  <p className="recent-desc">{expense.description}</p>
                  <p className="recent-meta">
                    {expense.paidBy} · {expense.date}
                  </p>
                </div>
                <span className="recent-amount">{formatAmount(expense.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
