// ============================================================
// LEARN: StatCard is a "presentational component" (also called
// a "dumb component"). It receives all its data via props and
// has zero internal state. This makes it:
//   - Easy to test
//   - Easy to reuse anywhere
//   - Easy to reason about (output = pure function of props)
// ============================================================

// LEARN: Destructuring props directly in the function signature
// is idiomatic React. Instead of (props) => props.title, we
// pull out exactly what we need right in the parameter list.
const StatCard = ({ title, value, subtitle, icon, accent }) => {
  return (
    // LEARN: The "style" prop accepts a JS object — note double
    // curly braces: outer = JSX expression, inner = JS object.
    // We use a CSS variable trick here: --accent is set inline
    // so child elements can reference it with var(--accent).
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="stat-card__header">
        {/* LEARN: Conditional rendering with &&
            If icon is truthy, render the span. If falsy, render nothing. */}
        {icon && <span className="stat-card__icon">{icon}</span>}
        <span className="stat-card__title">{title}</span>
      </div>

      <div className="stat-card__value">{value}</div>

      {/* LEARN: Another conditional render — subtitle is optional */}
      {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}

      {/* Decorative accent bar at the bottom — purely visual */}
      <div className="stat-card__bar" />
    </div>
  );
};

export default StatCard;
