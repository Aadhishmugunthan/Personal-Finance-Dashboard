// ============================================================
// LEARN: Reports Page — derives ALL its data from transactions.
// This is the power of lifting state up: one array in App.jsx
// feeds the dashboard, the transaction list, AND this page.
//
// New Recharts concept here: ComposedChart — lets you mix
// Bar and Line series in the same chart. Great for showing
// totals (bars) alongside a trend line.
// ============================================================

import { useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { fmtINR, fmtINRCompact } from "../utils/format";
import StatCard from "../components/StatCard";

// Month order for sorting
const MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Derive monthly summary from raw transactions ──────────────
// LEARN: This is a classic "group by" operation using .reduce().
// We accumulate income/expenses per month into an object, then
// convert it to an array for Recharts.
const buildMonthlyReport = (transactions) => {
  const map = {};
  transactions.forEach((t) => {
    const m = t.date.split(" ")[1] || t.date; // "Jun 24" → "Jun"
    if (!map[m]) map[m] = { month: m, income: 0, expenses: 0 };
    if (t.type === "income")  map[m].income   += Math.abs(t.amount);
    if (t.type === "expense") map[m].expenses += Math.abs(t.amount);
  });
  return Object.values(map)
    .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month))
    .map((m) => ({ ...m, net: m.income - m.expenses }));
};

// ── Derive category totals ────────────────────────────────────
const CATEGORY_COLORS = {
  Housing: "#6366f1", Food: "#f59e0b", Transport: "#10b981",
  Health: "#ef4444", Shopping: "#8b5cf6", Utilities: "#06b6d4", Savings: "#84cc16",
};

const buildCategoryReport = (transactions) => {
  const map = {};
  transactions.filter(t => t.type === "expense").forEach((t) => {
    if (!map[t.category]) map[t.category] = 0;
    map[t.category] += Math.abs(t.amount);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || "#6366f1" }))
    .sort((a, b) => b.value - a.value);
};

const ReportsPage = ({ transactions }) => {
  const monthly  = useMemo(() => buildMonthlyReport(transactions), [transactions]);
  const byCategory = useMemo(() => buildCategoryReport(transactions), [transactions]);

  const totalIncome   = useMemo(() => transactions.filter(t => t.type === "income").reduce((s,t) => s + Math.abs(t.amount), 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s,t) => s + Math.abs(t.amount), 0), [transactions]);
  const totalNet      = totalIncome - totalExpenses;
  const avgMonthly    = monthly.length > 0 ? Math.round(totalExpenses / monthly.length) : 0;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Reports</h1>
          <p className="page__subtitle">Detailed breakdown of your finances</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="stats-grid">
        <StatCard title="Total Income"    value={fmtINR(totalIncome)}   icon="💵" accent="#6366f1" subtitle="All time" />
        <StatCard title="Total Expenses"  value={fmtINR(totalExpenses)} icon="💸" accent="#f59e0b" subtitle="All time" />
        <StatCard title="Net Balance"     value={fmtINR(totalNet)}      icon="📊" accent="#10b981" subtitle={totalNet >= 0 ? "Surplus" : "Deficit"} />
        <StatCard title="Avg Monthly Exp" value={fmtINR(avgMonthly)}    icon="📅" accent="#8b5cf6" subtitle="Per month" />
      </div>

      {/* Monthly ComposedChart — Bar + Line */}
      <div className="chart-card">
        <div className="chart-card__header">
          <h2 className="chart-card__title">Monthly Income vs Expenses</h2>
          {/* LEARN: ComposedChart = Bar + Line in one chart */}
          <p className="chart-card__subtitle">Bars = amounts · Line = net savings</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtINRCompact} tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip
              formatter={(v, name) => [fmtINR(v), name]}
              contentStyle={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }}
            />
            <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }} iconType="circle" iconSize={8} />
            <Bar dataKey="income"   name="Income"   fill="#6366f1" radius={[4,4,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4,4,0,0]} />
            {/* LEARN: Line on top of bars — type="monotone" = smooth curve */}
            <Line dataKey="net" name="Net" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown table */}
      <div className="chart-card">
        <div className="chart-card__header">
          <h2 className="chart-card__title">Spending by Category</h2>
          <p className="chart-card__subtitle">Ranked by total spend</p>
        </div>
        <div className="report-table">
          {byCategory.map((cat, i) => {
            const pct = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0;
            return (
              <div key={cat.name} className="report-row">
                <span className="report-row__rank">#{i + 1}</span>
                <span className="report-row__dot" style={{ background: cat.color }} />
                <span className="report-row__name">{cat.name}</span>
                <div className="report-row__bar-wrap">
                  <div className="report-row__bar" style={{ width: `${pct}%`, background: cat.color }} />
                </div>
                <span className="report-row__pct">{pct.toFixed(1)}%</span>
                <span className="report-row__value">{fmtINR(cat.value)}</span>
              </div>
            );
          })}
          {byCategory.length === 0 && (
            <p className="txn-empty">No expense data yet. Add some transactions!</p>
          )}
        </div>
      </div>

      {/* Monthly summary table */}
      <div className="chart-card">
        <div className="chart-card__header">
          <h2 className="chart-card__title">Monthly Summary</h2>
        </div>
        <div className="summary-table">
          <div className="summary-table__head">
            <span>Month</span><span>Income</span><span>Expenses</span><span>Net</span>
          </div>
          {monthly.map((m) => (
            <div key={m.month} className="summary-table__row">
              <span className="summary-table__month">{m.month}</span>
              <span style={{ color: "var(--green)" }}>{fmtINR(m.income)}</span>
              <span style={{ color: "var(--yellow)" }}>{fmtINR(m.expenses)}</span>
              <span style={{ color: m.net >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                {m.net >= 0 ? "+" : ""}{fmtINR(m.net)}
              </span>
            </div>
          ))}
          {monthly.length === 0 && (
            <p className="txn-empty">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
