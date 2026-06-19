"use client";

import { useState } from "react";
import { resetEverything } from "@/app/lib/storage";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import "@/app/styles/common.css";
import "@/app/styles/forms.css";
import "./Settings.css";

export default function Settings({ roommates, onUpdateRoommates, onResetData }) {
  const [name1, setName1] = useState(roommates.name1);
  const [name2, setName2] = useState(roommates.name2);
  const [nameErrors, setNameErrors] = useState({});
  const [nameSaved, setNameSaved] = useState(false);

  const [resetDataConfirm, setResetDataConfirm] = useState(false);
  const [resetAllConfirm, setResetAllConfirm] = useState(false);

  const handleSaveNames = () => {
    const errs = {};
    if (!name1.trim()) errs.name1 = "Name cannot be empty";
    if (!name2.trim()) errs.name2 = "Name cannot be empty";
    if (name1.trim().toLowerCase() === name2.trim().toLowerCase() && name1.trim() && name2.trim())
      errs.name2 = "Names must be different";
    if (Object.keys(errs).length) {
      setNameErrors(errs);
      return;
    }
    onUpdateRoommates({ ...roommates, name1: name1.trim(), name2: name2.trim() });
    setNameErrors({});
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  };

  const handleResetData = () => {
    if (resetDataConfirm) {
      onResetData();
      setResetDataConfirm(false);
    } else {
      setResetDataConfirm(true);
    }
  };

  const handleResetAll = () => {
    if (resetAllConfirm) {
      resetEverything();
      window.location.reload();
    } else {
      setResetAllConfirm(true);
    }
  };

  return (
    <div className="settings-page">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your SplitRoom preferences</p>
      </div>

      {/* Roommate Names */}
      <div className="card settings-card">
        <h2 className="settings-card-title">Roommate Names</h2>
        <p className="settings-card-desc">Changes take effect immediately across the entire app.</p>

        {nameSaved && (
          <div className="settings-success">
            <CheckCircle2 size={16} />
            <p>Names updated successfully!</p>
          </div>
        )}

        <div className="settings-form">
          <div className="form-field">
            <label className="form-label">Roommate 1</label>
            <input
              type="text"
              value={name1}
              onChange={(e) => {
                setName1(e.target.value);
                setNameErrors((p) => ({ ...p, name1: undefined }));
              }}
              className={`form-input ${nameErrors.name1 ? "form-input-error" : ""}`}
            />
            {nameErrors.name1 && <p className="form-error">{nameErrors.name1}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Roommate 2</label>
            <input
              type="text"
              value={name2}
              onChange={(e) => {
                setName2(e.target.value);
                setNameErrors((p) => ({ ...p, name2: undefined }));
              }}
              className={`form-input ${nameErrors.name2 ? "form-input-error" : ""}`}
            />
            {nameErrors.name2 && <p className="form-error">{nameErrors.name2}</p>}
          </div>

          <button onClick={handleSaveNames} className="btn-primary settings-save-btn">
            Save Names
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card settings-card settings-danger-card">
        <div className="settings-danger-title-row">
          <AlertTriangle size={16} className="settings-danger-icon" />
          <h2 className="settings-card-title">Danger Zone</h2>
        </div>
        <p className="settings-card-desc">These actions are irreversible. Make sure to export a backup first.</p>

        <div className="settings-danger-list">
          <div className="settings-danger-row">
            <div>
              <p className="settings-danger-row-title">Clear all expenses</p>
              <p className="settings-danger-row-desc">Removes all expense history. Names are kept.</p>
            </div>
            <button
              onClick={handleResetData}
              onBlur={() => setTimeout(() => setResetDataConfirm(false), 300)}
              className={`settings-danger-btn ${resetDataConfirm ? "settings-danger-btn-confirm" : ""}`}
            >
              {resetDataConfirm ? "Confirm?" : "Clear"}
            </button>
          </div>

          <div className="settings-danger-row">
            <div>
              <p className="settings-danger-row-title">Reset everything</p>
              <p className="settings-danger-row-desc">Wipes all data including names and settings.</p>
            </div>
            <button
              onClick={handleResetAll}
              onBlur={() => setTimeout(() => setResetAllConfirm(false), 300)}
              className={`settings-danger-btn ${resetAllConfirm ? "settings-danger-btn-confirm" : ""}`}
            >
              {resetAllConfirm ? "Confirm?" : "Reset"}
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card settings-card">
        <h2 className="settings-card-title">About</h2>
        <div className="settings-about-list">
          <div className="settings-about-row">
            <span>App</span>
            <span className="settings-about-value">SplitRoom</span>
          </div>
          <div className="settings-about-row">
            <span>Storage</span>
            <span className="settings-about-value">Supabase (shared, real-time)</span>
          </div>
          <div className="settings-about-row">
            <span>Authentication</span>
            <span className="settings-about-value">None required</span>
          </div>
          <div className="settings-about-row">
            <span>Data sharing</span>
            <span className="settings-about-value">Live between both roommates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
