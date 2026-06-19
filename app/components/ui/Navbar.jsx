"use client";

import { Moon, Sun, Users, Wifi, WifiOff, Loader2 } from "lucide-react";
import "./Navbar.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", emoji: "📊" },
  { id: "add", label: "Add", emoji: "➕" },
  { id: "history", label: "History", emoji: "📋" },
  { id: "analytics", label: "Analytics", emoji: "📈" },
  { id: "settings", label: "Settings", emoji: "⚙️" },
];

function ConnectionBadge({ status }) {
  if (status === "online") {
    return (
      <span className="conn-badge conn-online" title="Live — synced with your roommate">
        <Wifi size={13} />
        <span className="conn-label">Live</span>
      </span>
    );
  }
  if (status === "offline") {
    return (
      <span className="conn-badge conn-offline" title="Offline — showing cached data">
        <WifiOff size={13} />
        <span className="conn-label">Offline</span>
      </span>
    );
  }
  return (
    <span className="conn-badge conn-connecting" title="Connecting...">
      <Loader2 size={13} className="conn-spin" />
      <span className="conn-label">Syncing</span>
    </span>
  );
}

export default function Navbar({
  activeTab,
  onTabChange,
  darkMode,
  onToggleDark,
  name1,
  name2,
  connectionStatus,
}) {
  return (
    <>
      {/* Desktop top bar */}
      <header className="navbar navbar-desktop">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <Users size={16} color="#fff" />
          </div>
          <span className="navbar-name">SplitRoom</span>
          <span className="navbar-roommates">
            {name1} & {name2}
          </span>
          <ConnectionBadge status={connectionStatus} />
        </div>

        <nav className="navbar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`navbar-nav-btn ${activeTab === item.id ? "navbar-nav-btn-active" : ""}`}
            >
              <span className="navbar-nav-emoji">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={onToggleDark} className="navbar-icon-btn" aria-label="Toggle dark mode">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Mobile top bar */}
      <header className="navbar navbar-mobile">
        <div className="navbar-brand-mobile">
          <div className="navbar-logo navbar-logo-sm">
            <Users size={14} color="#fff" />
          </div>
          <span className="navbar-name">SplitRoom</span>
          <ConnectionBadge status={connectionStatus} />
        </div>
        <button onClick={onToggleDark} className="navbar-icon-btn navbar-icon-btn-sm">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`bottom-nav-btn ${activeTab === item.id ? "bottom-nav-btn-active" : ""}`}
          >
            <span className="bottom-nav-emoji">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
