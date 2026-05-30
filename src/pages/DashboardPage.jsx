// ============================================================
// LEARN: Dashboard Page — extracted from App.jsx into its own
// file. This is better separation of concerns.
//
// Dynamic charts: all chart data is now DERIVED from the live
// transactions array using useMemo. Add a transaction → every
// chart updates instantly. No manual data sync needed.
//
// Filters: date range + category filter sit above the charts.
// The filtered transactions feed both the charts AND the list.
// ============================================================

import { useState, useMemo } from "react";
import { fmtINR } from "../utils/format";
import StatCard           from "../components/StatCard";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import CategoryPieChart   from "../components/CategoryPieChart";
import MonthlyTrendChart  from "../components/MonthlyTrendChart";
import SavingsProgress    from "../components/SavingsProgress";
import TransactionList    from "../components/TransactionList";
import { CATEGORIES }     from "../data/financeData";

// Month order for sorting chart data
const MONTH_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CATEGORY_COLORS = {
  Housing: "#6366f1", Food: "#f59e0b", Transport: "#10b981",
  Health: "#ef4444", Shopping: "#8b5cf6", Utilities: "#06b6d4", Savings: "#84cc16",
};

// ── Derive chart data from transactions ───────────────────────
// LEARN: These pure functions take transactions and return the
// exact shape Recharts expects. Pure functions = easy to test.

const buildMonthlyChartData = (txns) => {
  const map = {};
  txns.forEach((t) => {
    // "Jun 24" → "Jun"  |  "Jun" → "Jun"
    const m = t.date.includes(" ") ? t.date.split(" ")[0] : t.date;
    if (!map[m]) map[m] = { month: m, income: 0, expenses: 0 };
    if (t.type === "income")  map[m].income   += Math.abs(t.amount);
    if (t.type === "expense") map[m].expenses += Math.abs(t.amount);
  });
  return Object.values(map)
    .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
};

const buildCategoryChartData = (txns) => {
  const map = {};
  txns.filter(t => t.type === "expense").forEach((t) => {
    map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
  });
  return Object.entries(map).map(([name, value]) => ({
    name, value, color: CATEGORY_COLORS[name] || "#6366f1",
  }));
};

const computeStats = (txns) => {
  const totalIncome   = txns.filter(t => t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpenses = txns.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const netSavings    = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  return { totalIncome, totalExpenses, netSavings, savingsRate };
};

// ── Filter Bar ────────────────────────────────────────────────
// LEARN: A separate component for the filter controls keeps
// DashboardPage cleaner. It receives state + setters as props.
const FilterBar = ({ filters, onChange, onReset }) => {
  const hasActive = filters.category !== "all" || filters.dateFrom || filters.dateTo;

  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        {/* Category filter */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={filters.category}
            onChange={e => onChange("category", e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Date from */}
        <div className="filter-group">
          <label className="filter-label">From</label>
          <input
            type="month"
            className="filter-input"
            value={filters.dateFrom}
            onChange={e => onChange("dateFrom", e.target.value)}
          />
        </div>

        {/* Date to */}
        <div className="filter-group">
          <label className="filter-label">To</label>
          <input
            type="month"
            className="filter-input"
            value={filters.dateTo}
            onChange={e => onChange("dateTo", e.target.value)}
          />
        </div>

        {/* Reset — only shown when a filter is active */}
        {hasActive && (
          <button className="btn btn--ghost filter-reset" onClick={onReset}>
            ✕ Reset
          </button>
        )}
      </div>

      {hasActive && (
        <p className="filter-bar__hint">
          Filters active — charts and stats reflect filtered data
        </p>
      )}
    </div>
  );
};

// ── Dashboard Page ────────────────────────────────────────────
const DashboardPage = ({ transactions, onAdd, onEdit, onDelete }) => {
  // LEARN: Filter state — one object with all filter fields.
  // This is cleaner than 3 separate useState calls.
  const [filters, setFilters] = useState({
    category: "all",
    dateFrom: "",
    dateTo:   "",
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters({ category: "all", dateFrom: "", dateTo: "" });

  // LEARN: Apply filters to transactions.
  // useMemo ensures this only recomputes when transactions or
  // filters change — not on every render.
  const filteredTxns = useMemo(() => {
    return transactions.filter((t) => {
      // Category filter
      if (filters.category !== "all" && t.category !== filters.category) return false;

      // Date range filter — we parse the month from the date string
      // "Jun 24" → month index 5 (June)
      // This is simplified; a real app would use proper Date objects
      if (filters.dateFrom || filters.dateTo) {
        const monthName = t.date.split(" ")[0];
        const monthIdx  = MONTH_ORDER.indexOf(monthName);
        if (filters.dateFrom) {
          const [, fromMonth] = filters.dateFrom.split("-");
          if (monthIdx < Number(fromMonth) - 1) return false;
        }
        if (filters.dateTo) {
          const [, toMonth] = filters.dateTo.split("-");
          if (monthIdx > Number(toMonth) - 1) return false;
        }
      }
      return true;
    });
  }, [transactions, filters]);

  // Derive all chart data from filtered transactions
  const stats        = useMemo(() => computeStats(filteredTxns), [filteredTxns]);
  const monthlyData  = useMemo(() => buildMonthlyChartData(filteredTxns), [filteredTxns]);
  const categoryData = useMemo(() => buildCategoryChartData(filteredTxns), [filteredTxns]);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__subtitle">Welcome back — here's your financial overview</p>
        </div>
        <div className="page__badge">June 2026</div>
      </div>

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={handleFilterChange} onReset={resetFilters} />

      {/* KPI Cards — live from filtered transactions */}
      <div className="stats-grid">
        <StatCard title="Total Income"   value={fmtINR(stats.totalIncome)}   subtitle="↑ 10% vs last month" icon="💵" accent="#6366f1" />
        <StatCard title="Total Expenses" value={fmtINR(stats.totalExpenses)} subtitle="↑ 3% vs last month"  icon="💸" accent="#f59e0b" />
        <StatCard title="Net Savings"    value={fmtINR(stats.netSavings)}    subtitle="This period"          icon="🏦" accent="#10b981" />
        <StatCard title="Savings Rate"   value={`${stats.savingsRate}%`}     subtitle="Of total income"      icon="📈" accent="#8b5cf6" />
      </div>

      {/* Charts — all fed by derived data from filteredTxns */}
      <div className="charts-grid">
        {/* LEARN: We pass derived data, not raw transactions.
            The chart components stay "dumb" — they just render
            whatever data array they receive. */}
        <IncomeExpenseChart data={monthlyData.length > 0 ? monthlyData : [{ month: "—", income: 0, expenses: 0 }]} />
        <CategoryPieChart   data={categoryData.length > 0 ? categoryData : [{ name: "No data", value: 1, color: "var(--border)" }]} />
      </div>

      <div className="charts-grid charts-grid--asymmetric">
        <MonthlyTrendChart data={monthlyData.length > 0 ? monthlyData : [{ month: "—", income: 0, expenses: 0 }]} />
        <SavingsProgress
          savingsRate={stats.savingsRate}
          netSavings={stats.netSavings}
          goal={40000}
        />
      </div>

      {/* Transaction list — also uses filteredTxns so it stays in sync */}
      <TransactionList
        transactions={filteredTxns}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default DashboardPage;
