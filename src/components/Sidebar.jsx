// ============================================================
// LEARN: Sidebar navigation — a classic dashboard UI pattern.
//
// The sidebar receives `activePage` and `onNavigate` as props.
// This is "lifting state up" — the parent (App) owns which page
// is active, and passes down both the value and the setter.
// This way App can render the correct content for each page.
//
// Pattern: "controlled component" — the sidebar doesn't decide
// what's active, it just reports clicks upward via onNavigate.
// ============================================================

// Navigation items config — data-driven nav is easier to maintain
// than hardcoding each item separately
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",    icon: "📊" },
  { id: "reports",   label: "Reports",      icon: "📈" },
  { id: "budget",    label: "Budget",       icon: "💳" },
  { id: "savings",   label: "Savings",      icon: "🏦" },
];

const Sidebar = ({ activePage, onNavigate }) => {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand / Logo */}
      <div className="sidebar__brand">
        <span className="sidebar__logo">💰</span>
        <span className="sidebar__name">FinanceIQ</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <ul role="list">
          {/* LEARN: Data-driven rendering — map over config array
              instead of writing each <li> manually. Adding a new
              nav item = just add one object to NAV_ITEMS above. */}
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={`sidebar__link ${activePage === item.id ? "sidebar__link--active" : ""}`}
                onClick={() => onNavigate(item.id)}
                aria-current={activePage === item.id ? "page" : undefined}
              >
                <span className="sidebar__link-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section — user profile */}
      <div className="sidebar__footer">
        <div className="sidebar__avatar">A</div>
        <div className="sidebar__user">
          <span className="sidebar__user-name">Aadhithya</span>
          <span className="sidebar__user-role">Personal</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
