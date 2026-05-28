// ============================================================
// LEARN: TransactionList now handles full CRUD UI.
//
// It receives:
//   transactions — the live array from App state
//   onAdd        — callback to add a new transaction
//   onEdit       — callback to update an existing one
//   onDelete     — callback to remove one by id
//
// LEARN: This is the "smart container" pattern — the list
// manages its own UI state (search, filter, which modal is open)
// but delegates data mutations upward via callbacks.
// The actual data lives in App.jsx (single source of truth).
// ============================================================

import { useState } from "react";
import { fmtINR } from "../utils/format";
import TransactionModal from "./TransactionModal";

const CATEGORY_ICONS = {
  Income:    "💰",
  Housing:   "🏠",
  Food:      "🍔",
  Transport: "🚗",
  Health:    "💊",
  Shopping:  "🛍️",
  Utilities: "⚡",
  Savings:   "🏦",
};

const TransactionList = ({ transactions, onAdd, onEdit, onDelete }) => {
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");

  // LEARN: Modal state — null = closed, "add" = add form,
  // or a transaction object = edit form for that transaction.
  const [modal, setModal] = useState(null); // null | "add" | txn object

  // LEARN: Confirmation state — store the id of the transaction
  // the user wants to delete. null = no confirmation shown.
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Derived filtered list
  const filtered = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "income"  && t.type === "income") ||
      (filter === "expense" && t.type === "expense");
    return matchesSearch && matchesFilter;
  });

  // ── CRUD handlers ──────────────────────────────────────────
  // LEARN: These functions call the parent callbacks and then
  // close the modal. The parent updates state → re-render → list
  // automatically shows the new data. No manual DOM manipulation.

  const handleSave = (txnData) => {
    if (txnData.id) {
      onEdit(txnData);   // has id → update existing
    } else {
      onAdd(txnData);    // no id → create new
    }
    setModal(null);
  };

  const handleDeleteConfirm = () => {
    onDelete(confirmDelete);
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="chart-card">
        {/* Header row with Add button */}
        <div className="chart-card__header txn-header">
          <div>
            <h2 className="chart-card__title">Transactions</h2>
            <p className="chart-card__subtitle">{filtered.length} of {transactions.length} shown</p>
          </div>
          {/* LEARN: onClick opens the modal in "add" mode */}
          <button className="btn btn--primary" onClick={() => setModal("add")}>
            + Add
          </button>
        </div>

        {/* Controls */}
        <div className="txn-controls">
          <input
            type="text"
            className="txn-search"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
          />
          <div className="txn-tabs" role="tablist">
            {["all", "income", "expense"].map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={filter === tab}
                className={`txn-tab ${filter === tab ? "txn-tab--active" : ""}`}
                onClick={() => setFilter(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction rows */}
        <div className="txn-list">
          {filtered.length === 0 ? (
            <p className="txn-empty">No transactions found.</p>
          ) : (
            filtered.map((txn) => (
              <div key={txn.id} className="txn-row">
                <div className="txn-row__icon">
                  {CATEGORY_ICONS[txn.category] ?? "💳"}
                </div>

                <div className="txn-row__info">
                  <span className="txn-row__desc">{txn.description}</span>
                  <span className="txn-row__meta">{txn.category} · {txn.date}</span>
                </div>

                <span className={`txn-row__amount txn-row__amount--${txn.type}`}>
                  {txn.type === "income" ? "+" : "−"}
                  {fmtINR(Math.abs(txn.amount))}
                </span>

                {/* LEARN: Action buttons — only visible on hover via CSS.
                    Edit opens the modal pre-filled with this transaction.
                    Delete shows an inline confirmation (safer than window.confirm). */}
                <div className="txn-row__actions">
                  <button
                    className="txn-action txn-action--edit"
                    onClick={() => setModal(txn)}
                    aria-label={`Edit ${txn.description}`}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="txn-action txn-action--delete"
                    onClick={() => setConfirmDelete(txn.id)}
                    aria-label={`Delete ${txn.description}`}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────── */}
      {/* LEARN: Conditional rendering — modal only mounts when needed.
          When it unmounts, all its internal state resets automatically. */}
      {modal !== null && (
        <TransactionModal
          editData={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Delete Confirmation ──────────────────────────────── */}
      {/* LEARN: Inline confirmation is better UX than browser's
          window.confirm() — it's styled, non-blocking, and dismissable. */}
      {confirmDelete !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Delete Transaction?</h2>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
              This action cannot be undone.
            </p>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn btn--danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;
