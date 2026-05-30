// ============================================================
// LEARN: Budget Page — demonstrates:
//
// 1. LOCAL STATE for budgets (separate from transactions).
//    Budgets are user-defined limits per category.
//
// 2. DERIVED DATA — actual spend per category is computed
//    from the transactions prop on every render.
//
// 3. INLINE EDITING — clicking a budget value opens a small
//    inline input. This is a common UX pattern for dashboards.
//
// 4. STATUS LOGIC — we classify each category as "safe",
//    "warning" (>75%), or "over" (>100%) and style accordingly.
// ============================================================

import { useState, useMemo } from "react";
import { fmtINR } from "../utils/format";
import StatCard from "../components/StatCard";

// Default budget limits per category (in ₹)
const DEFAULT_BUDGETS = {
  Housing:   30000,
  Food:      15000,
  Transport:  8000,
  Health:     5000,
  Shopping:  10000,
  Utilities:  5000,
  Savings:   20000,
};

const CATEGORY_COLORS = {
  Housing: "#6366f1", Food: "#f59e0b", Transport: "#10b981",
  Health: "#ef4444", Shopping: "#8b5cf6", Utilities: "#06b6d4", Savings: "#84cc16",
};

const CATEGORY_ICONS = {
  Housing: "🏠", Food: "🍔", Transport: "🚗",
  Health: "💊", Shopping: "🛍️", Utilities: "⚡", Savings: "🏦",
};

// Classify spend vs budget
const getStatus = (spent, budget) => {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  if (pct >= 100) return "over";
  if (pct >= 75)  return "warning";
  return "safe";
};

const STATUS_COLORS = { safe: "var(--green)", warning: "var(--yellow)", over: "var(--red)" };
const STATUS_LABELS = { safe: "On track", warning: "Near limit", over: "Over budget" };

const BudgetPage = ({ transactions }) => {
  // LEARN: budgets state — an object keyed by category name.
  // We initialize from DEFAULT_BUDGETS so users start with
  // sensible values they can then edit.
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);

  // LEARN: editingCategory tracks which row is in edit mode.
  // null = no row editing. Only one row edits at a time.
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Derive actual spend per category from transactions
  // LEARN: .reduce() builds an object: { Housing: 25000, Food: 3200, ... }
  const actualSpend = useMemo(() => {
    return transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});
  }, [transactions]);

  // Build rows for display
  const rows = Object.keys(budgets).map((cat) => {
    const budget = budgets[cat];
    const spent  = actualSpend[cat] || 0;
    const remaining = budget - spent;
    const pct    = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const status = getStatus(spent, budget);
    return { cat, budget, spent, remaining, pct, status };
  });

  // Summary stats
  const totalBudget  = rows.reduce((s, r) => s + r.budget, 0);
  const totalSpent   = rows.reduce((s, r) => s + r.spent, 0);
  const overBudget   = rows.filter(r => r.status === "over").length;
  const onTrack      = rows.filter(r => r.status === "safe").length;

  // ── Edit handlers ─────────────────────────────────────────
  const startEdit = (cat, currentValue) => {
    setEditingCategory(cat);
    setEditValue(currentValue.toString());
  };

  const commitEdit = (cat) => {
    const val = Number(editValue);
    if (!isNaN(val) && val > 0) {
      // LEARN: Spread to create a new object — never mutate state directly
      setBudgets(prev => ({ ...prev, [cat]: val }));
    }
    setEditingCategory(null);
  };

  const handleEditKey = (e, cat) => {
    if (e.key === "Enter")  commitEdit(cat);
    if (e.key === "Escape") setEditingCategory(null);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Budget</h1>
          <p className="page__subtitle">Set limits and track spending per category</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="stats-grid">
        <StatCard title="Total Budget"  value={fmtINR(totalBudget)} icon="🎯" accent="#6366f1" subtitle="Monthly limit" />
        <StatCard title="Total Spent"   value={fmtINR(totalSpent)}  icon="💸" accent="#f59e0b" subtitle={`${((totalSpent/totalBudget)*100||0).toFixed(0)}% of budget`} />
        <StatCard title="Remaining"     value={fmtINR(totalBudget - totalSpent)} icon="💰" accent="#10b981" subtitle="Left to spend" />
        <StatCard title="Over Budget"   value={`${overBudget} / ${rows.length}`} icon="⚠️" accent={overBudget > 0 ? "#ef4444" : "#10b981"} subtitle={`${onTrack} categories on track`} />
      </div>

      {/* Budget rows */}
      <div className="chart-card">
        <div className="chart-card__header">
          <h2 className="chart-card__title">Category Budgets</h2>
          <p className="chart-card__subtitle">Click a budget amount to edit it</p>
        </div>

        <div className="budget-list">
          {rows.map(({ cat, budget, spent, remaining, pct, status }) => (
            <div key={cat} className="budget-row">
              {/* Icon + name */}
              <div className="budget-row__label">
                <span className="budget-row__icon">{CATEGORY_ICONS[cat]}</span>
                <span className="budget-row__name">{cat}</span>
              </div>

              {/* Progress bar */}
              <div className="budget-row__progress">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: STATUS_COLORS[status],
                      // LEARN: Override the gradient for status colors
                      backgroundImage: "none",
                    }}
                  />
                </div>
                <div className="budget-row__meta">
                  <span style={{ color: STATUS_COLORS[status], fontSize: "11px", fontWeight: 600 }}>
                    {STATUS_LABELS[status]}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    {fmtINR(spent)} spent
                  </span>
                </div>
              </div>

              {/* Budget amount — click to edit */}
              <div className="budget-row__amounts">
                {editingCategory === cat ? (
                  // LEARN: Inline edit input — autoFocus opens keyboard immediately
                  <div className="budget-edit">
                    <span className="budget-edit__prefix">₹</span>
                    <input
                      className="budget-edit__input"
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(cat)}
                      onKeyDown={(e) => handleEditKey(e, cat)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <button
                    className="budget-amount"
                    onClick={() => startEdit(cat, budget)}
                    title="Click to edit budget"
                  >
                    {fmtINR(budget)}
                    <span className="budget-amount__edit-hint">✏️</span>
                  </button>
                )}
                <span
                  className="budget-row__remaining"
                  style={{ color: remaining >= 0 ? "var(--green)" : "var(--red)" }}
                >
                  {remaining >= 0 ? `${fmtINR(remaining)} left` : `${fmtINR(Math.abs(remaining))} over`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="chart-card">
        <div className="chart-card__header">
          <h2 className="chart-card__title">Budget Tips</h2>
        </div>
        <div className="tips-grid">
          {[
            { icon: "🎯", tip: "50/30/20 Rule", desc: "50% needs, 30% wants, 20% savings" },
            { icon: "📊", tip: "Track Weekly",  desc: "Review spending every Sunday to stay on track" },
            { icon: "🔔", tip: "Set Alerts",    desc: "Edit budgets when you're consistently over" },
            { icon: "💡", tip: "Pay Yourself",  desc: "Treat savings as a non-negotiable expense" },
          ].map((t) => (
            <div key={t.tip} className="tip-card">
              <span className="tip-card__icon">{t.icon}</span>
              <strong className="tip-card__title">{t.tip}</strong>
              <p className="tip-card__desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
