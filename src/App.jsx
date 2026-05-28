// ============================================================
// LEARN: App.jsx now owns the transactions array in state.
// This is the "single source of truth" pattern — all CRUD
// operations happen here and flow down to child components.
//
// Why here and not inside TransactionList?
// Because the KPI cards and charts also depend on transactions.
// If state lived inside TransactionList, the charts couldn't
// react to changes. Lifting state to the common ancestor
// (App) lets every component stay in sync automatically.
// ============================================================

import { useState, useMemo } from "react";
import "./App.css";

import {
  monthlyData,
  categoryData,
  initialTransactions,
  summaryStats,
} from "./data/financeData";

import { fmtINR } from "./utils/format";

import Sidebar            from "./components/Sidebar";
import StatCard           from "./components/StatCard";
import IncomeExpenseChart from "./components/IncomeExpenseChart";
import CategoryPieChart   from "./components/CategoryPieChart";
import MonthlyTrendChart  from "./components/MonthlyTrendChart";
import TransactionList    from "./components/TransactionList";
import SavingsProgress    from "./components/SavingsProgress";

// ============================================================
// LEARN: useMemo — recompute derived values only when the
// dependency (transactions) changes, not on every render.
// For small arrays this barely matters, but it's a good habit
// and teaches you when memoization is appropriate.
// ============================================================
const computeStats = (txns) => {
  const totalIncome   = txns.filter(t => t.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpenses = txns.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const netSavings    = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  return { totalIncome, totalExpenses, netSavings, savingsRate };
};

// ── Dashboard Page ────────────────────────────────────────────
// LEARN: We pass transactions + CRUD handlers as props so the
// dashboard can render live stats and the transaction list.
const DashboardPage = ({ transactions, onAdd, onEdit, onDelete }) => {
  // LEARN: useMemo with [transactions] dependency — stats only
  // recompute when the transactions array reference changes.
  const stats = useMemo(() => computeStats(transactions), [transactions]);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__subtitle">Welcome back — here's your June 2026 summary</p>
        </div>
        <div className="page__badge">June 2026</div>
      </div>

      {/* KPI Cards — now computed live from transactions state */}
      <div className="stats-grid">
        <StatCard
          title="Total Income"
          value={fmtINR(stats.totalIncome)}
          subtitle="↑ 10% vs last month"
          icon="💵"
          accent="#6366f1"
        />
        <StatCard
          title="Total Expenses"
          value={fmtINR(stats.totalExpenses)}
          subtitle="↑ 3% vs last month"
          icon="💸"
          accent="#f59e0b"
        />
        <StatCard
          title="Net Savings"
          value={fmtINR(stats.netSavings)}
          subtitle="This month"
          icon="🏦"
          accent="#10b981"
        />
        <StatCard
          title="Savings Rate"
          value={`${stats.savingsRate}%`}
          subtitle="Of total income"
          icon="📈"
          accent="#8b5cf6"
        />
      </div>

      <div className="charts-grid">
        <IncomeExpenseChart data={monthlyData} />
        <CategoryPieChart   data={categoryData} />
      </div>

      <div className="charts-grid charts-grid--asymmetric">
        <MonthlyTrendChart data={monthlyData} />
        <SavingsProgress
          savingsRate={stats.savingsRate}
          netSavings={stats.netSavings}
          goal={40000}
        />
      </div>

      {/* LEARN: Pass CRUD callbacks down to TransactionList */}
      <TransactionList
        transactions={transactions}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

const PlaceholderPage = ({ title, icon }) => (
  <div className="page">
    <div className="page__header">
      <h1 className="page__title">{title}</h1>
    </div>
    <div className="placeholder-page">
      <span className="placeholder-page__icon">{icon}</span>
      <h2>Coming Soon</h2>
      <p>This section is under construction. Check back later!</p>
    </div>
  </div>
);

// ── Root App ──────────────────────────────────────────────────
function App() {
  const [activePage, setActivePage] = useState("dashboard");

  // LEARN: The transactions array lives here — it's the single
  // source of truth. All CRUD operations update this state,
  // which triggers a re-render of everything that depends on it.
  const [transactions, setTransactions] = useState(initialTransactions);

  // ── CREATE ────────────────────────────────────────────────
  // LEARN: We generate a new id by finding the current max id
  // and adding 1. In a real app the backend assigns the id.
  const handleAdd = (txnData) => {
    const newId = transactions.length > 0
      ? Math.max(...transactions.map(t => t.id)) + 1
      : 1;
    // LEARN: Never mutate state directly. Always create a new array.
    // Spread [...prev, newItem] creates a new array reference,
    // which tells React something changed → triggers re-render.
    setTransactions((prev) => [{ ...txnData, id: newId }, ...prev]);
  };

  // ── UPDATE ────────────────────────────────────────────────
  // LEARN: .map() returns a new array. We replace the matching
  // item and keep everything else unchanged.
  const handleEdit = (updated) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  // ── DELETE ────────────────────────────────────────────────
  // LEARN: .filter() returns a new array without the deleted item.
  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const pages = {
    dashboard: (
      <DashboardPage
        transactions={transactions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    reports: <PlaceholderPage title="Reports" icon="📈" />,
    budget:  <PlaceholderPage title="Budget"  icon="💳" />,
    savings: <PlaceholderPage title="Savings" icon="🏦" />,
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content" id="main-content">
        {pages[activePage] ?? <DashboardPage transactions={transactions} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />}
      </main>
    </div>
  );
}

export default App;
