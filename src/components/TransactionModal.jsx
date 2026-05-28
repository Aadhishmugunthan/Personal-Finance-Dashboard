// ============================================================
// LEARN: Modal / Dialog pattern in React
//
// Key concepts here:
//
// 1. CONTROLLED FORM — every input is tied to a state field.
//    The form state is a single object: { description, amount,
//    category, date, type }. One onChange handler updates it
//    using the spread operator to keep other fields intact.
//
// 2. PORTAL — ideally modals render outside the main DOM tree
//    using ReactDOM.createPortal(). We keep it simple here and
//    use a fixed overlay instead (same visual result).
//
// 3. ESCAPE KEY — useEffect adds a keydown listener so pressing
//    Escape closes the modal. Always clean up listeners in the
//    return function of useEffect (prevents memory leaks).
//
// 4. EDIT vs ADD — the same modal handles both. If `editData`
//    prop is provided, we pre-fill the form (edit mode).
//    If null, the form starts empty (add mode).
// ============================================================

import { useState, useEffect } from "react";
import { CATEGORIES } from "../data/financeData";

// Empty form state — used when adding a new transaction
const EMPTY_FORM = {
  description: "",
  amount: "",
  category: "Food",
  date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  type: "expense",
};

const TransactionModal = ({ editData, onSave, onClose }) => {
  // LEARN: When editData exists, pre-fill the form with its values.
  // Math.abs() strips the negative sign from expense amounts so
  // the user sees a positive number in the input field.
  const [form, setForm] = useState(
    editData
      ? {
          description: editData.description,
          amount:      Math.abs(editData.amount).toString(),
          category:    editData.category,
          date:        editData.date,
          type:        editData.type,
        }
      : EMPTY_FORM
  );

  const [errors, setErrors] = useState({});

  // LEARN: useEffect with [] runs once on mount.
  // We add an Escape key listener to close the modal.
  // The return function is the "cleanup" — it removes the
  // listener when the component unmounts (modal closes).
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // LEARN: Single onChange handler using computed property names.
  // [e.target.name] dynamically sets the key that matches the
  // input's `name` attribute. One function handles all fields.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Basic client-side validation
  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = "Enter a valid positive amount";
    if (!form.date.trim()) errs.date = "Date is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload (default form behavior)

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // LEARN: Build the transaction object to pass back to the parent.
    // Expenses are stored as negative numbers internally.
    const saved = {
      // If editing, keep the original id; otherwise parent assigns a new one
      ...(editData ? { id: editData.id } : {}),
      description: form.description.trim(),
      // Expenses stored as negative, income as positive
      amount: form.type === "expense"
        ? -Math.abs(Number(form.amount))
        :  Math.abs(Number(form.amount)),
      category: form.category,
      date:     form.date.trim(),
      type:     form.type,
    };

    onSave(saved); // lift the data up to the parent
  };

  const isEdit = Boolean(editData);

  return (
    // LEARN: Fixed overlay — covers the whole viewport.
    // onClick on the backdrop closes the modal (click-outside pattern).
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit transaction" : "Add transaction"}>
      {/* stopPropagation prevents the backdrop click from firing
          when the user clicks inside the modal box */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? "Edit Transaction" : "Add Transaction"}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Type toggle — Income / Expense */}
          <div className="modal__field">
            <label className="modal__label">Type</label>
            <div className="type-toggle">
              {["income", "expense"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`type-toggle__btn type-toggle__btn--${t} ${form.type === t ? "type-toggle__btn--active" : ""}`}
                  onClick={() => {
                    // When switching type, also auto-set category
                    setForm((prev) => ({
                      ...prev,
                      type: t,
                      category: t === "income" ? "Income" : "Food",
                    }));
                  }}
                >
                  {t === "income" ? "💰 Income" : "💸 Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="modal__field">
            <label className="modal__label" htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              className={`modal__input ${errors.description ? "modal__input--error" : ""}`}
              placeholder="e.g. Salary, Grocery Store..."
              value={form.description}
              onChange={handleChange}
              autoFocus
            />
            {errors.description && <span className="modal__error">{errors.description}</span>}
          </div>

          {/* Amount */}
          <div className="modal__field">
            <label className="modal__label" htmlFor="amount">Amount (₹)</label>
            <div className="modal__input-prefix-wrap">
              <span className="modal__input-prefix">₹</span>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                className={`modal__input modal__input--prefixed ${errors.amount ? "modal__input--error" : ""}`}
                placeholder="0"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
            {errors.amount && <span className="modal__error">{errors.amount}</span>}
          </div>

          {/* Category + Date — side by side */}
          <div className="modal__row">
            <div className="modal__field">
              <label className="modal__label" htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className="modal__input modal__select"
                value={form.category}
                onChange={handleChange}
              >
                {/* LEARN: Filter categories based on type so you can't
                    pick "Income" category for an expense and vice versa */}
                {CATEGORIES
                  .filter((c) => form.type === "income" ? c === "Income" : c !== "Income")
                  .map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>
            </div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="date">Date</label>
              <input
                id="date"
                name="date"
                type="text"
                className={`modal__input ${errors.date ? "modal__input--error" : ""}`}
                placeholder="Jun 24"
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && <span className="modal__error">{errors.date}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`btn btn--primary btn--${form.type}`}>
              {isEdit ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
