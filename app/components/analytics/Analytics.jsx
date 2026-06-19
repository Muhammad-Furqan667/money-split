"use client";

import {
  getExpensesByCategory,
  getMonthlyTotals,
  getSpendingByPerson,
  getDashboardStats,
  formatAmount,
} from "@/app/lib/calculations";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import "@/app/styles/common.css";
import "./Analytics.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        {label && <p className="chart-tooltip-label">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="chart-tooltip-value">
            {p.name}: {formatAmount(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{payload[0].name}</p>
        <p className="chart-tooltip-sub">{formatAmount(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function Analytics({ expenses, roommates }) {
  const stats = getDashboardStats(expenses, roommates.name1, roommates.name2);
  const categoryData = getExpensesByCategory(expenses);
  const monthlyData = getMonthlyTotals(expenses);
  const perPersonData = getSpendingByPerson(expenses, roommates.name1, roommates.name2);

  const categories = Array.from(new Set(expenses.map((e) => e.category)));

  const perPersonBarData = categories.map((cat) => ({
    name: cat,
    [roommates.name1]: perPersonData[roommates.name1]?.[cat] || 0,
    [roommates.name2]: perPersonData[roommates.name2]?.[cat] || 0,
  }));

  if (expenses.length === 0) {
    return (
      <div className="analytics-page">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Spending insights</p>
        </div>
        <div className="empty-state">
          <p className="empty-emoji">📊</p>
          <p className="empty-title">No data to analyze yet</p>
          <p className="empty-desc">Add some expenses to see charts and insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">
          Spending breakdown for {roommates.name1} & {roommates.name2}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary-grid">
        <div className="card analytics-summary-card">
          <p className="analytics-summary-value">{expenses.length}</p>
          <p className="analytics-summary-label">Total Expenses</p>
        </div>
        <div className="card analytics-summary-card">
          <p className="analytics-summary-value">{formatAmount(stats.totalExpenses / expenses.length)}</p>
          <p className="analytics-summary-label">Avg per Expense</p>
        </div>
        <div className="card analytics-summary-card">
          <p className="analytics-summary-value analytics-value-emerald">{formatAmount(stats.person1Total)}</p>
          <p className="analytics-summary-label">{roommates.name1}</p>
        </div>
        <div className="card analytics-summary-card">
          <p className="analytics-summary-value analytics-value-violet">{formatAmount(stats.person2Total)}</p>
          <p className="analytics-summary-label">{roommates.name2}</p>
        </div>
      </div>

      {/* Pie + Bar */}
      <div className="analytics-charts-grid">
        <div className="card analytics-chart-card">
          <h2 className="chart-title">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {categoryData.map((item) => (
              <div key={item.name} className="chart-legend-item">
                <div className="chart-legend-dot" style={{ backgroundColor: item.color }} />
                <span className="chart-legend-name">{item.name}</span>
                <span className="chart-legend-value">{formatAmount(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card analytics-chart-card">
          <h2 className="chart-title">Per-Person by Category</h2>
          {perPersonBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={perPersonBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" iconSize={8} />
                <Bar dataKey={roommates.name1} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey={roommates.name2} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Not enough data</div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <div className="card analytics-chart-card">
          <h2 className="chart-title">Monthly Spending Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly Table */}
      {monthlyData.length > 0 && (
        <div className="card analytics-table-card">
          <div className="analytics-table-header">
            <h2 className="chart-title">Monthly Reports</h2>
          </div>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="col-right">Total</th>
                <th className="col-right">Expenses</th>
                <th className="col-right">Avg</th>
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].reverse().map((row) => (
                <tr key={row.month}>
                  <td className="cell-strong">{row.month}</td>
                  <td className="col-right cell-strong">{formatAmount(row.total)}</td>
                  <td className="col-right cell-muted">{row.count}</td>
                  <td className="col-right cell-muted">{formatAmount(row.total / row.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
