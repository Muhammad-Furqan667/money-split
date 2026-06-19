"use client";

import { useState, useEffect } from "react";
import { CATEGORIES, CATEGORY_ICONS } from "@/app/types";
import { CheckCircle2 } from "lucide-react";
import "@/app/styles/common.css";
import "@/app/styles/forms.css";
import "./AddExpenseForm.css";

const today = () => new Date().toISOString().split("T")[0];

export default function AddExpenseForm({
  roommates,
  onAdd,
  onUpdate,
  editingExpense,
  onCancelEdit,
  defaultCategory,
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(defaultCategory || "Groceries");
  const [paidBy, setPaidBy] = useState(roommates.name1);
  const [date, setDate] = useState(today());
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(String(editingExpense.amount));
      setDescription(editingExpense.description);
      setCategory(editingExpense.category);
      setPaidBy(editingExpense.paidBy);
      setDate(editingExpense.date);
      setErrors({});
    }
  }, [editingExpense]);

  const validate = () => {
    const errs = {};
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0)
      errs.amount = "Amount must be greater than 0";
    if (!description.trim()) errs.description = "Description is required";
    if (!date) errs.date = "Date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      description: description.trim(),
      category,
      paidBy,
      date,
    };

    if (editingExpense && onUpdate) {
      onUpdate(editingExpense.id, data);
      if (onCancelEdit) onCancelEdit();
    } else {
      onAdd(data);
      setAmount("");
      setDescription("");
      setCategory("Groceries");
      setPaidBy(roommates.name1);
      setDate(today());
      setErrors({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }
  };

  const isEditing = !!editingExpense;

  return (
    <div className="expense-form-page">
      <div>
        <h1 className="page-title">{isEditing ? "Edit Expense" : "Add Expense"}</h1>
        <p className="page-subtitle">
          {isEditing ? "Update the expense details below." : "Record a new shared expense."}
        </p>
      </div>

      {success && (
        <div className="success-flash">
          <CheckCircle2 size={20} />
          <p>Expense added successfully!</p>
        </div>
      )}

      <div className="card expense-form-card">
        {/* Amount */}
        <div className="form-field">
          <label className="form-label">
            Amount (Rs.) <span className="form-required">*</span>
          </label>
          <div className="amount-input-wrap">
            <span className="amount-prefix">Rs.</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors((p) => ({ ...p, amount: "" }));
              }}
              placeholder="0.00"
              className={`form-input amount-input ${errors.amount ? "form-input-error" : ""}`}
            />
          </div>
          {errors.amount && <p className="form-error">{errors.amount}</p>}
        </div>

        {/* Description */}
        <div className="form-field">
          <label className="form-label">
            Description <span className="form-required">*</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((p) => ({ ...p, description: "" }));
            }}
            placeholder="e.g. Monthly groceries"
            className={`form-input ${errors.description ? "form-input-error" : ""}`}
          />
          {errors.description && <p className="form-error">{errors.description}</p>}
        </div>

        {/* Category */}
        <div className="form-field">
          <label className="form-label">Category</label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`category-btn ${category === cat ? "category-btn-active" : ""}`}
              >
                <span className="category-emoji">{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Paid By */}
        <div className="form-field">
          <label className="form-label">Paid By</label>
          <div className="paid-by-grid">
            {[roommates.name1, roommates.name2].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setPaidBy(name)}
                className={`paid-by-btn ${paidBy === name ? "paid-by-btn-active" : ""}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="form-field">
          <label className="form-label">
            Date <span className="form-required">*</span>
          </label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => {
              setDate(e.target.value);
              setErrors((p) => ({ ...p, date: "" }));
            }}
            className={`form-input ${errors.date ? "form-input-error" : ""}`}
          />
          {errors.date && <p className="form-error">{errors.date}</p>}
        </div>

        {/* Buttons */}
        <div className="form-actions">
          {isEditing && (
            <button type="button" onClick={onCancelEdit} className="btn-secondary form-actions-flex">
              Cancel
            </button>
          )}
          <button type="button" onClick={handleSubmit} className="btn-primary form-actions-flex form-submit-btn">
            {isEditing ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
