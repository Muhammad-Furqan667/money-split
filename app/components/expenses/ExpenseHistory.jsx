"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_ICONS } from "@/app/types";
import { formatAmount, exportToCSV } from "@/app/lib/calculations";
import { exportBackup, importBackup } from "@/app/lib/storage";
import { format, parseISO } from "date-fns";
import { Search, Filter, Trash2, Pencil, X, Download, Upload } from "lucide-react";
import "@/app/styles/common.css";
import "@/app/styles/forms.css";
import "./ExpenseHistory.css";

export default function ExpenseHistory({
  expenses,
  sortedExpenses,
  roommates,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const clearFilters = () => {
    onFilterChange({ search: "", paidBy: "", category: "", dateFrom: "", dateTo: "" });
  };

  const hasActiveFilters =
    filters.search || filters.paidBy || filters.category || filters.dateFrom || filters.dateTo;

  const handleExportCSV = () => {
    const csv = exportToCSV(expenses, roommates.name1, roommates.name2);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `splitroom-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `splitroom-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          importBackup(data);
          window.location.reload();
        } catch {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">
            {sortedExpenses.length} of {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="history-export-btns">
          <button onClick={handleExportCSV} title="Export CSV" className="btn-secondary">
            <Download size={16} />
            <span className="btn-text-desktop">CSV</span>
          </button>
          <button onClick={handleExportJSON} title="Backup JSON" className="btn-secondary">
            <Download size={16} />
            <span className="btn-text-desktop">Backup</span>
          </button>
          <button onClick={handleImportJSON} title="Restore JSON" className="btn-secondary">
            <Upload size={16} />
            <span className="btn-text-desktop">Restore</span>
          </button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="card filter-bar">
        <div className="filter-search-row">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="form-input search-input"
            />
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`filter-toggle-btn ${showFilters || hasActiveFilters ? "filter-toggle-btn-active" : ""}`}
          >
            <Filter size={16} />
            <span className="btn-text-desktop">Filters</span>
            {hasActiveFilters && <span className="filter-dot" />}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="filter-clear-btn" title="Clear filters">
              <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filter-options-grid">
            <div className="form-field">
              <label className="filter-label">Paid By</label>
              <select
                value={filters.paidBy}
                onChange={(e) => onFilterChange({ ...filters, paidBy: e.target.value })}
                className="form-select"
              >
                <option value="">Anyone</option>
                <option value={roommates.name1}>{roommates.name1}</option>
                <option value={roommates.name2}>{roommates.name2}</option>
              </select>
            </div>
            <div className="form-field">
              <label className="filter-label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                className="form-select"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="filter-label">From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label className="filter-label">To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {sortedExpenses.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">🔍</p>
          <p className="empty-title">
            {hasActiveFilters ? "No expenses match your filters" : "No expenses yet"}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="link-btn">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="col-right">Amount</th>
                  <th>Paid By</th>
                  <th className="col-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="cell-muted cell-nowrap">
                      {format(parseISO(expense.date), "dd MMM yyyy")}
                    </td>
                    <td className="cell-strong cell-truncate">{expense.description}</td>
                    <td>
                      <span className="category-pill">
                        {CATEGORY_ICONS[expense.category]} {expense.category}
                      </span>
                    </td>
                    <td className="col-right cell-strong cell-nowrap">
                      {formatAmount(expense.amount)}
                    </td>
                    <td>
                      <span
                        className={`person-pill ${
                          expense.paidBy === roommates.name1 ? "person-pill-1" : "person-pill-2"
                        }`}
                      >
                        {expense.paidBy}
                      </span>
                    </td>
                    <td className="col-center">
                      <div className="action-btns">
                        <button onClick={() => onEdit(expense)} className="action-btn action-btn-edit" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className={`action-btn action-btn-delete ${
                            deleteConfirm === expense.id ? "action-btn-delete-confirm" : ""
                          }`}
                          title={deleteConfirm === expense.id ? "Click again to confirm" : "Delete"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="history-mobile-cards">
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className="card history-mobile-card">
                <div className="history-mobile-row">
                  <div className="history-mobile-left">
                    <span className="history-mobile-emoji">{CATEGORY_ICONS[expense.category]}</span>
                    <div className="history-mobile-info">
                      <p className="history-mobile-desc">{expense.description}</p>
                      <p className="history-mobile-meta">
                        {format(parseISO(expense.date), "dd MMM yyyy")} · {expense.category}
                      </p>
                      <span
                        className={`person-pill person-pill-sm ${
                          expense.paidBy === roommates.name1 ? "person-pill-1" : "person-pill-2"
                        }`}
                      >
                        {expense.paidBy}
                      </span>
                    </div>
                  </div>
                  <div className="history-mobile-right">
                    <p className="history-mobile-amount">{formatAmount(expense.amount)}</p>
                    <div className="action-btns">
                      <button onClick={() => onEdit(expense)} className="action-btn action-btn-edit">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className={`action-btn action-btn-delete ${
                          deleteConfirm === expense.id ? "action-btn-delete-confirm" : ""
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
