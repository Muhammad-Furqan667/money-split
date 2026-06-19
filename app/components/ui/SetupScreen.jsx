"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import "@/app/styles/forms.css";
import "./SetupScreen.css";

export default function SetupScreen({ onComplete }) {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const errs = {};
    if (!name1.trim()) errs.name1 = "Enter first roommate's name";
    if (!name2.trim()) errs.name2 = "Enter second roommate's name";
    if (name1.trim().toLowerCase() === name2.trim().toLowerCase())
      errs.name2 = "Names must be different";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onComplete({ name1: name1.trim(), name2: name2.trim(), configured: true });
  };

  return (
    <div className="setup-screen">
      <div className="setup-container">
        {/* Logo / Brand */}
        <div className="setup-brand">
          <div className="setup-logo">
            <Users size={32} color="#fff" />
          </div>
          <h1 className="setup-title">SplitRoom</h1>
          <p className="setup-subtitle">Track shared expenses between two roommates</p>
        </div>

        {/* Card */}
        <div className="setup-card">
          <h2 className="setup-card-title">Who lives here?</h2>
          <p className="setup-card-desc">Enter both roommates' names to get started.</p>

          <div className="setup-form">
            <div className="form-field">
              <label className="form-label">Roommate 1</label>
              <input
                type="text"
                value={name1}
                onChange={(e) => {
                  setName1(e.target.value);
                  setErrors((prev) => ({ ...prev, name1: undefined }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Ali"
                className={`form-input ${errors.name1 ? "form-input-error" : ""}`}
              />
              {errors.name1 && <p className="form-error">{errors.name1}</p>}
            </div>

            <div className="form-field">
              <label className="form-label">Roommate 2</label>
              <input
                type="text"
                value={name2}
                onChange={(e) => {
                  setName2(e.target.value);
                  setErrors((prev) => ({ ...prev, name2: undefined }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. Ahmed"
                className={`form-input ${errors.name2 ? "form-input-error" : ""}`}
              />
              {errors.name2 && <p className="form-error">{errors.name2}</p>}
            </div>

            <button onClick={handleSubmit} className="setup-submit-btn">
              Get Started →
            </button>
          </div>
        </div>

        <p className="setup-footer">Data is shared live between both of you via Supabase</p>
      </div>
    </div>
  );
}
