// ============================================================
// LEARN: App.jsx is now lean — it only owns:
//   1. Navigation state (activePage)
//   2. Transactions state (single source of truth for CRUD)
//   3. CRUD handlers
//
// Each page is its own file in src/pages/. This is the standard
// structure for React apps — one component per file, grouped
// by feature or type.
// ============================================================

import { useState } from "react";
import "./App.css";

import { initialTransactions } from "./data/financeData";

import Sidebar        from "./components/Sidebar";
import DashboardPage  from "./pages/DashboardPage";
import ReportsPage    from "./pages/ReportsPage";
import BudgetPage     from "./pages/BudgetPage";
import SavingsPage    from "./pages/SavingsPage";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  // ── Transactions state — shared across Dashboard + Reports + Budget
  const [transactions, setTransactions] = useState(initialTransactions);

  // ── CRUD handlers ─────────────────────────────────────────
  const handleAdd = (txnData) => {
    const newId = transactions.length > 0
      ? Math.max(...transactions.map(t => t.id)) + 1
      : 1;
    setTransactions(prev => [{ ...txnData, id: newId }, ...prev]);
  };

  const handleEdit = (updated) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // LEARN: Page map — each key renders a different page component.
  // Reports and Budget also receive transactions so they can
  // derive their own data from the same source of truth.
  const pages = {
    dashboard: (
      <DashboardPage
        transactions={transactions}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
    reports: <ReportsPage transactions={transactions} />,
    budget:  <BudgetPage  transactions={transactions} />,
    savings: <SavingsPage />,
  };

  return (
    // LEARN: data-theme is set on <html> by ThemeContext (in main.jsx).
    // The app-shell just needs to use CSS variables — the theme
    // switch happens automatically via the attribute selector in CSS.
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content" id="main-content">
        {pages[activePage] ?? pages.dashboard}
      </main>
    </div>
  );
}

export default App;
