// ============================================================
// LEARN: Savings Page — a full CRUD feature for savings goals.
//
// Each goal has: name, targetAmount, savedAmount, deadline, icon.
// Users can add, edit, deposit into, and delete goals.
//
// New patterns here:
//   - Multiple modals managed with a single `modal` state object
//     { type: "add" | "edit" | "deposit", data: ... }
//   - Derived progress percentage
//   - Date formatting with Intl.DateTimeFormat
// ============================================================

import { useState } from "react";
import { fmtINR } from "../utils/format";
import StatCard from "../components/StatCard";

const GOAL_ICONS = ["🏠","🚗","✈️","📱","🎓","💍","🏖️","💻","🏋️","🎸","🌍","🏦"];

const DEFAULT_GOALS = [
  { id: 1, name: "Emergency Fund",  icon: "🏦", target: 300000, saved: 125000, deadline: "2026-12-31" },
  { id: 2, name: "New Laptop",      icon: "💻", target: 80000,  saved: 45000,  deadline: "2026-09-01" },
  { id: 3, name: "Goa Trip",        icon: "✈️", target: 50000,  saved: 12000,  deadline: "2026-11-01" },
];

const EMPTY_GOAL = { name: "", icon: "🏦", target: "", saved: "", deadline: "" };

// Days remaining until deadline
const daysLeft = (deadline) => {
  const diff = new Date(deadline) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ── Goal Add/Edit Modal ───────────────────────────────────────
const GoalModal = ({ goal, onSave, onClose }) => {
  const [form, setForm] = useState(goal || EMPTY_GOAL);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(goal?.id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                         errs.name     = "Name is required";
    if (!form.target || Number(form.target) <= 0)  errs.target   = "Enter a valid target";
    if (form.saved !== "" && Number(form.saved) < 0) errs.saved  = "Cannot be negative";
    if (!form.deadline)                            errs.deadline = "Pick a deadline";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...(isEdit ? { id: goal.id } : {}),
      name:     form.name.trim(),
      icon:     form.icon,
      target:   Number(form.target),
      saved:    Number(form.saved) || 0,
      deadline: form.deadline,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? "Edit Goal" : "New Savings Goal"}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {/* Icon picker */}
          <div className="modal__field">
            <label className="modal__label">Icon</label>
            <div className="icon-picker">
              {GOAL_ICONS.map(ic => (
                <button key={ic} type="button"
                  className={`icon-picker__btn ${form.icon === ic ? "icon-picker__btn--active" : ""}`}
                  onClick={() => setForm(p => ({ ...p, icon: ic }))}
                >{ic}</button>
              ))}
            </div>
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="g-name">Goal Name</label>
            <input id="g-name" name="name" type="text"
              className={`modal__input ${errors.name ? "modal__input--error" : ""}`}
              placeholder="e.g. Emergency Fund" value={form.name} onChange={handleChange} autoFocus />
            {errors.name && <span className="modal__error">{errors.name}</span>}
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="g-target">Target (₹)</label>
              <div className="modal__input-prefix-wrap">
                <span className="modal__input-prefix">₹</span>
                <input id="g-target" name="target" type="number" min="1"
                  className={`modal__input modal__input--prefixed ${errors.target ? "modal__input--error" : ""}`}
                  placeholder="0" value={form.target} onChange={handleChange} />
              </div>
              {errors.target && <span className="modal__error">{errors.target}</span>}
            </div>
            <div className="modal__field">
              <label className="modal__label" htmlFor="g-saved">Already Saved (₹)</label>
              <div className="modal__input-prefix-wrap">
                <span className="modal__input-prefix">₹</span>
                <input id="g-saved" name="saved" type="number" min="0"
                  className={`modal__input modal__input--prefixed ${errors.saved ? "modal__input--error" : ""}`}
                  placeholder="0" value={form.saved} onChange={handleChange} />
              </div>
              {errors.saved && <span className="modal__error">{errors.saved}</span>}
            </div>
          </div>

          <div className="modal__field">
            <label className="modal__label" htmlFor="g-deadline">Target Date</label>
            <input id="g-deadline" name="deadline" type="date"
              className={`modal__input ${errors.deadline ? "modal__input--error" : ""}`}
              value={form.deadline} onChange={handleChange} />
            {errors.deadline && <span className="modal__error">{errors.deadline}</span>}
          </div>

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">{isEdit ? "Save Changes" : "Create Goal"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Quick Deposit Modal ───────────────────────────────────────
const DepositModal = ({ goal, onDeposit, onClose }) => {
  const [amount, setAmount] = useState("");
  const [error, setError]   = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) { setError("Enter a valid amount"); return; }
    onDeposit(goal.id, val);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{goal.icon} Add to {goal.name}</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal__field">
            <label className="modal__label">Amount to Add (₹)</label>
            <div className="modal__input-prefix-wrap">
              <span className="modal__input-prefix">₹</span>
              <input type="number" min="1" autoFocus
                className={`modal__input modal__input--prefixed ${error ? "modal__input--error" : ""}`}
                placeholder="0" value={amount}
                onChange={e => { setAmount(e.target.value); setError(""); }} />
            </div>
            {error && <span className="modal__error">{error}</span>}
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
              Current: {fmtINR(goal.saved)} / {fmtINR(goal.target)}
            </p>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ background: "var(--green)" }}>
              + Add Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const SavingsPage = () => {
  const [goals, setGoals]     = useState(DEFAULT_GOALS);
  const [modal, setModal]     = useState(null); // { type, data }
  const [confirmDel, setConfirmDel] = useState(null);

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved  = goals.reduce((s, g) => s + g.saved,  0);
  const completed   = goals.filter(g => g.saved >= g.target).length;

  const handleSaveGoal = (data) => {
    if (data.id) {
      setGoals(prev => prev.map(g => g.id === data.id ? data : g));
    } else {
      const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
      setGoals(prev => [{ ...data, id: newId }, ...prev]);
    }
    setModal(null);
  };

  const handleDeposit = (id, amount) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g
    ));
    setModal(null);
  };

  const handleDelete = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    setConfirmDel(null);
  };

  return (
    <>
      <div className="page">
        <div className="page__header">
          <div>
            <h1 className="page__title">Savings Goals</h1>
            <p className="page__subtitle">Track progress toward your financial goals</p>
          </div>
          <button className="btn btn--primary" onClick={() => setModal({ type: "add" })}>
            + New Goal
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="stats-grid">
          <StatCard title="Total Goals"  value={goals.length.toString()} icon="🎯" accent="#6366f1" subtitle={`${completed} completed`} />
          <StatCard title="Total Target" value={fmtINR(totalTarget)}     icon="🏆" accent="#f59e0b" subtitle="Combined target" />
          <StatCard title="Total Saved"  value={fmtINR(totalSaved)}      icon="💰" accent="#10b981"
            subtitle={`${totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}% of total`} />
          <StatCard title="Still Needed" value={fmtINR(totalTarget - totalSaved)} icon="📈" accent="#8b5cf6" subtitle="To reach all goals" />
        </div>

        {/* Goal cards grid */}
        <div className="goals-grid">
          {goals.map((goal) => {
            const pct  = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
            const done = goal.saved >= goal.target;
            const days = daysLeft(goal.deadline);
            const monthlyNeeded = days > 0
              ? Math.ceil((goal.target - goal.saved) / (days / 30))
              : 0;

            return (
              <div key={goal.id} className={`goal-card ${done ? "goal-card--done" : ""}`}>
                <div className="goal-card__header">
                  <span className="goal-card__icon">{goal.icon}</span>
                  <div className="goal-card__actions">
                    <button className="txn-action" onClick={() => setModal({ type: "edit", data: goal })} title="Edit">✏️</button>
                    <button className="txn-action txn-action--delete" onClick={() => setConfirmDel(goal.id)} title="Delete">🗑️</button>
                  </div>
                </div>

                <h3 className="goal-card__name">{goal.name}</h3>

                {done ? (
                  <div className="goal-card__done-badge">🎉 Goal Reached!</div>
                ) : (
                  <p className="goal-card__deadline">
                    {days > 0 ? `${days} days left` : "Deadline passed"} ·{" "}
                    {new Date(goal.deadline).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                )}

                <div className="goal-card__progress">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: done ? "var(--green)" : undefined,
                        backgroundImage: done ? "none" : undefined,
                      }}
                    />
                  </div>
                  <div className="goal-card__amounts">
                    <span>{fmtINR(goal.saved)} saved</span>
                    <span style={{ fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                    <span>{fmtINR(goal.target)} goal</span>
                  </div>
                </div>

                {!done && monthlyNeeded > 0 && (
                  <p className="goal-card__tip">
                    Save {fmtINR(monthlyNeeded)}/month to reach this goal
                  </p>
                )}

                {!done && (
                  <button
                    className="btn btn--primary goal-card__deposit"
                    onClick={() => setModal({ type: "deposit", data: goal })}
                  >
                    + Add Funds
                  </button>
                )}
              </div>
            );
          })}

          {/* Add new goal placeholder card */}
          <button className="goal-card goal-card--add" onClick={() => setModal({ type: "add" })}>
            <span style={{ fontSize: "32px" }}>+</span>
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "add"     && <GoalModal goal={null}       onSave={handleSaveGoal} onClose={() => setModal(null)} />}
      {modal?.type === "edit"    && <GoalModal goal={modal.data} onSave={handleSaveGoal} onClose={() => setModal(null)} />}
      {modal?.type === "deposit" && <DepositModal goal={modal.data} onDeposit={handleDeposit} onClose={() => setModal(null)} />}

      {/* Delete confirmation */}
      {confirmDel !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Delete Goal?</h2>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
              This will permanently remove this savings goal.
            </p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={() => handleDelete(confirmDel)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SavingsPage;
