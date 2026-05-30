// ============================================================
// LEARN: Sidebar now consumes ThemeContext via the useTheme hook.
// This is Context in action — no prop drilling needed.
// The toggle button lives here, but the theme state lives in
// ThemeProvider (in main.jsx), and the CSS variables respond
// to the data-theme attribute on <html>.
// ============================================================

import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  icon: "📊" },
  { id: "reports",   label: "Reports",    icon: "📈" },
  { id: "budget",    label: "Budget",     icon: "💳" },
  { id: "savings",   label: "Savings",    icon: "🏦" },
];

const Sidebar = ({ activePage, onNavigate }) => {
  // LEARN: useTheme() reads from ThemeContext — no props needed
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar__brand">
        <span className="sidebar__logo">💰</span>
        <span className="sidebar__name">FinanceIQ</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <ul role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar__link ${activePage === item.id ? "sidebar__link--active" : ""}`}
                onClick={() => onNavigate(item.id)}
                aria-current={activePage === item.id ? "page" : undefined}
              >
                <span className="sidebar__link-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Theme toggle
          LEARN: aria-label describes the button's action to screen readers.
          We describe what it WILL do, not what it currently is. */}
      <div className="sidebar__theme-toggle">
        <span className="sidebar__theme-label">
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {/* LEARN: The toggle track + thumb is pure CSS.
              The `data-theme` attribute on <html> drives the position. */}
          <span className="theme-toggle__track">
            <span className="theme-toggle__thumb" />
          </span>
        </button>
      </div>

      {/* User profile */}
      <div className="sidebar__footer">
        <div className="sidebar__avatar">A</div>
        <div className="sidebar__user">
          <span className="sidebar__user-name">Aadhish Mugunthan</span>
          <span className="sidebar__user-role">Personal</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
