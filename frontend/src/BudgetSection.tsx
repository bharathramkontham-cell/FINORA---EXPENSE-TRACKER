
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  LoaderCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Target,
  TrendingUp,
  PiggyBank,
  Sparkles,
} from "lucide-react";

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  type Budget,
} from "./lib/api";

type Props = {
  userId: number;
};

const CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Housing",
  "Education",
  "Entertainment",
  "Healthcare",
  "Bills",
  "Other",
];

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const budgetStyles = `
.budget-section {
  --budget-text: #f4f6ff;
  --budget-muted: #9ca9c2;
  --budget-border: rgba(148, 163, 184, .14);
  display: grid;
  gap: 20px;
  margin-top: 28px;
  color: var(--budget-text);
}

.budget-section * {
  box-sizing: border-box;
}

.budget-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.budget-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #a78bfa;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.8px;
  margin: 0 0 8px;
}

.budget-title {
  color: var(--budget-text);
  font-size: clamp(22px, 3vw, 27px);
  font-weight: 800;
  letter-spacing: -.8px;
  margin: 0;
}

.budget-subtitle {
  color: var(--budget-muted);
  font-size: 13px;
  margin: 7px 0 0;
}

.budget-primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 12px;
  padding: 12px 18px;
  color: white;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  background: linear-gradient(115deg, #7657ed, #4779f5 60%, #16b8c9);
  box-shadow: 0 8px 24px rgba(93, 91, 235, .25);
  transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
}

.budget-primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(93, 91, 235, .36);
  filter: brightness(1.08);
}

.budget-primary-button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.budget-month-bar,
.budget-panel {
  border: 1px solid var(--budget-border);
  border-radius: 19px;
  background: linear-gradient(145deg, rgba(23, 34, 61, .94), rgba(15, 24, 45, .94));
  box-shadow: 0 12px 35px rgba(0, 0, 0, .14);
}

.budget-month-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 13px 17px;
}

.budget-month-name {
  color: #f4f6ff;
  font-size: 16px;
  font-weight: 800;
  text-align: center;
}

.budget-icon-button {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(148, 163, 184, .17);
  border-radius: 11px;
  background: rgba(255, 255, 255, .045);
  color: #cbd5e1;
  cursor: pointer;
  transition: background .2s ease, color .2s ease, transform .2s ease;
}

.budget-icon-button:hover:not(:disabled) {
  background: rgba(124, 98, 245, .18);
  color: white;
  transform: translateY(-1px);
}

.budget-icon-button:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.budget-error {
  padding: 13px 15px;
  border: 1px solid rgba(248, 113, 113, .24);
  border-radius: 12px;
  background: rgba(127, 29, 29, .2);
  color: #fca5a5;
  font-size: 13px;
}

.budget-form {
  padding: 21px;
  border: 1px solid rgba(139, 120, 255, .25);
  border-radius: 19px;
  background:
    radial-gradient(ellipse at top right, rgba(110, 87, 238, .16), transparent 48%),
    linear-gradient(145deg, rgba(28, 35, 69, .96), rgba(15, 25, 47, .96));
  box-shadow: 0 14px 35px rgba(0, 0, 0, .18);
}

.budget-form-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.budget-form-title {
  margin: 0;
  color: white;
  font-size: 17px;
  font-weight: 800;
}

.budget-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
  align-items: end;
}

.budget-field {
  display: grid;
  gap: 8px;
  color: #c4cce0;
  font-size: 12px;
  font-weight: 700;
}

.budget-input {
  width: 100%;
  min-height: 46px;
  padding: 11px 13px;
  border: 1px solid rgba(148, 163, 184, .22);
  border-radius: 11px;
  outline: none;
  background: rgba(7, 14, 31, .68);
  color: white;
  font: inherit;
  font-size: 13px;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}

.budget-input:focus {
  border-color: #8b78ff;
  background: rgba(12, 19, 42, .95);
  box-shadow: 0 0 0 3px rgba(139, 120, 255, .15);
}

.budget-input option {
  background: #111a30;
  color: white;
}

.budget-form-actions {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.budget-cancel-button {
  min-height: 43px;
  padding: 10px 16px;
  border: 1px solid rgba(148, 163, 184, .2);
  border-radius: 11px;
  background: rgba(255, 255, 255, .045);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.budget-cancel-button:hover {
  background: rgba(255, 255, 255, .09);
  color: white;
}

.budget-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
}

.budget-summary-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, .15);
  border-radius: 19px;
  background: linear-gradient(145deg, rgba(25, 37, 67, .96), rgba(15, 24, 45, .96));
  box-shadow: 0 12px 30px rgba(0, 0, 0, .15);
  transition: transform .22s ease, border-color .22s ease;
}

.budget-summary-card:hover {
  transform: translateY(-3px);
  border-color: rgba(167, 139, 250, .38);
}

.budget-summary-card::after {
  content: "";
  position: absolute;
  width: 125px;
  height: 125px;
  border-radius: 50%;
  right: -42px;
  top: -52px;
  background: var(--budget-glow);
  filter: blur(3px);
  opacity: .22;
  pointer-events: none;
}

.budget-summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.budget-summary-label {
  color: #aab6ce;
  font-size: 12px;
  font-weight: 650;
}

.budget-summary-icon {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--budget-accent);
  background: var(--budget-icon-bg);
}

.budget-summary-value {
  position: relative;
  z-index: 1;
  margin: 17px 0 5px;
  color: var(--budget-accent);
  font-size: clamp(19px, 2.3vw, 25px);
  font-weight: 850;
  letter-spacing: -.7px;
  overflow-wrap: anywhere;
}

.budget-summary-caption {
  color: #8795b0;
  font-size: 11px;
}

.budget-overview {
  padding: 21px;
}

.budget-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 17px;
}

.budget-section-heading {
  margin: 0;
  color: white;
  font-size: 15px;
  font-weight: 800;
}

.budget-overview-percent {
  color: #c4b5fd;
  font-size: 18px;
  font-weight: 850;
}

.budget-progress-track {
  width: 100%;
  height: 13px;
  overflow: hidden;
  border-radius: 30px;
  background: rgba(148, 163, 184, .15);
}

.budget-progress-fill {
  height: 100%;
  border-radius: inherit;
  transition: width .5s ease;
}

.budget-overview-caption {
  margin: 12px 0 0;
  color: var(--budget-muted);
  font-size: 12px;
  line-height: 1.6;
}

.budget-category-section {
  display: grid;
  gap: 14px;
}

.budget-category-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 4px 0 2px;
}

.budget-category-heading svg {
  color: #a78bfa;
}

.budget-category-card {
  padding: 19px 20px;
  border: 1px solid var(--budget-border);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(23, 34, 61, .95), rgba(14, 23, 43, .96));
  box-shadow: 0 10px 28px rgba(0, 0, 0, .13);
  transition: transform .2s ease, border-color .2s ease;
}

.budget-category-card:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 120, 255, .3);
}

.budget-category-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.budget-category-name-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.budget-category-dot {
  width: 11px;
  height: 35px;
  border-radius: 10px;
  flex-shrink: 0;
}

.budget-category-name {
  color: white;
  font-size: 15px;
  font-weight: 800;
}

.budget-category-description {
  color: #9ca9c2;
  font-size: 11px;
  margin: 5px 0 0;
  overflow-wrap: anywhere;
}

.budget-category-actions {
  display: flex;
  gap: 7px;
  flex-shrink: 0;
}

.budget-category-actions .budget-icon-button {
  width: 34px;
  height: 34px;
}

.budget-category-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 19px 0 9px;
}

.budget-remaining {
  color: #aab6ce;
  font-size: 11px;
}

.budget-percent {
  font-size: 12px;
  font-weight: 850;
}

.budget-category-progress {
  height: 9px;
}

.budget-status {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 13px;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.5;
}

.budget-empty {
  padding: 38px 20px;
  text-align: center;
}

.budget-empty-icon {
  width: 65px;
  height: 65px;
  display: grid;
  place-items: center;
  margin: 0 auto 17px;
  border: 1px solid rgba(139, 120, 255, .25);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(139, 92, 246, .18), rgba(34, 211, 238, .1));
  color: #a78bfa;
}

.budget-empty h3 {
  color: white;
  font-size: 17px;
  margin: 0 0 8px;
}

.budget-empty p {
  max-width: 370px;
  margin: 0 auto 18px;
  color: var(--budget-muted);
  font-size: 12px;
  line-height: 1.7;
}

.budget-loading {
  padding: 38px 20px;
  text-align: center;
  color: #c4b5fd;
}

.budget-loading p {
  color: var(--budget-muted);
  font-size: 12px;
}

.budget-spin {
  animation: budget-spin 1s linear infinite;
}

@keyframes budget-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 700px) {
  .budget-summary-grid {
    grid-template-columns: 1fr;
  }

  .budget-summary-card {
    padding: 17px;
  }

  .budget-summary-value {
    margin-top: 11px;
  }

  .budget-form-grid {
    grid-template-columns: 1fr;
  }

  .budget-form-actions {
    align-items: stretch;
  }

  .budget-form-actions button {
    flex: 1;
  }

  .budget-category-card {
    padding: 16px;
  }
}

@media (max-width: 420px) {
  .budget-heading {
    align-items: stretch;
  }

  .budget-heading > button {
    width: 100%;
  }

  .budget-month-bar {
    padding: 11px;
  }

  .budget-month-name {
    font-size: 14px;
  }

  .budget-category-top {
    gap: 8px;
  }

  .budget-category-name {
    font-size: 13px;
  }

  .budget-category-description {
    font-size: 10px;
  }

  .budget-category-actions .budget-icon-button {
    width: 31px;
    height: 31px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .budget-section *,
  .budget-section *::before,
  .budget-section *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
`;

function BudgetSection({ userId }: Props) {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingBudget, setEditingBudget] =
    useState<Budget | null>(null);

  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");

  async function loadBudgets() {
    try {
      setError("");

      const result = await getBudgets(userId, month, year);
      setBudgets(result.budgets);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load budgets"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBudgets();
  }, [userId, month, year]);

  const totals = useMemo(() => {
    const allocated = budgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );

    const spent = budgets.reduce(
      (sum, budget) => sum + budget.spent,
      0
    );

    return {
      allocated,
      spent,
      remaining: allocated - spent,
      percentage:
        allocated > 0 ? (spent / allocated) * 100 : 0,
    };
  }, [budgets]);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

  function changeMonth(direction: number) {
    const nextDate = new Date(year, month - 1 + direction, 1);

    setMonth(nextDate.getMonth() + 1);
    setYear(nextDate.getFullYear());
  }

  function openAddForm() {
    setEditingBudget(null);
    setCategory("Food");
    setAmount("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(budget: Budget) {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(String(budget.amount));
    setError("");
    setShowForm(true);
  }

  async function handleSaveBudget(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (
      !category.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Enter a valid category and budget amount.");
      return;
    }

    try {
      setSaving(true);

      if (editingBudget) {
        await updateBudget(editingBudget.id, {
          userId,
          amount: numericAmount,
          category,
        });
      } else {
        await createBudget({
          userId,
          category,
          amount: numericAmount,
          month,
          year,
        });
      }

      setShowForm(false);
      setEditingBudget(null);
      setAmount("");

      await loadBudgets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save budget"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBudget(budget: Budget) {
    const confirmed = window.confirm(
      `Delete the ${budget.category} budget of ${currency(
        budget.amount
      )} for ${monthLabel}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteBudget(budget.id, userId);
      await loadBudgets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete budget"
      );
    }
  }

  const overallColor =
    totals.percentage >= 100
      ? "#fb7185"
      : totals.percentage >= 80
        ? "#fbbf24"
        : "#34d399";

  const summaryCards = [
    {
      label: "Total allocated",
      value: totals.allocated,
      caption: "Your planned monthly spending",
      icon: Target,
      accent: "#a78bfa",
      glow: "rgba(139, 92, 246, .9)",
      iconBg: "rgba(139, 92, 246, .15)",
    },
    {
      label: "Total spent",
      value: totals.spent,
      caption: "Your spending so far",
      icon: TrendingUp,
      accent: "#fb7185",
      glow: "rgba(244, 63, 94, .9)",
      iconBg: "rgba(244, 63, 94, .14)",
    },
    {
      label: "Remaining budget",
      value: totals.remaining,
      caption: totals.remaining < 0
        ? "Amount over your planned budget"
        : "Available for the rest of the month",
      icon: PiggyBank,
      accent: totals.remaining < 0 ? "#fb7185" : "#34d399",
      glow: "rgba(16, 185, 129, .9)",
      iconBg: "rgba(16, 185, 129, .14)",
    },
  ];

  return (
    <section id="budgets" className="budget-section">
      <style>{budgetStyles}</style>

      <div className="budget-heading">
        <div>
          <p className="budget-eyebrow">
            <Sparkles size={13} />
            SMART MONEY MANAGEMENT
          </p>
          <h2 className="budget-title">Monthly Budgets</h2>
          <p className="budget-subtitle">
            Set spending limits and stay in control of your money.
          </p>
        </div>

        <button
          type="button"
          className="budget-primary-button"
          onClick={openAddForm}
        >
          <Plus size={17} />
          Add Budget
        </button>
      </div>

      <div className="budget-month-bar">
        <button
          type="button"
          className="budget-icon-button"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="budget-month-name">{monthLabel}</div>

        <button
          type="button"
          className="budget-icon-button"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {error && (
        <div className="budget-error" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <div className="budget-form">
          <div className="budget-form-heading">
            <h3 className="budget-form-title">
              {editingBudget ? "Edit budget" : "Create monthly budget"}
            </h3>

            <button
              type="button"
              className="budget-icon-button"
              aria-label="Close budget form"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              <X size={19} />
            </button>
          </div>

          <form
            onSubmit={handleSaveBudget}
            className="budget-form-grid"
          >
            <label className="budget-field">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="budget-input"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="budget-field">
              Monthly limit (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="e.g. 5000"
                required
                className="budget-input"
              />
            </label>

            <div className="budget-form-actions">
              <button
                type="submit"
                className="budget-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={16} className="budget-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    {editingBudget ? "Update Budget" : "Save Budget"}
                  </>
                )}
              </button>

              <button
                type="button"
                className="budget-cancel-button"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="budget-panel budget-loading">
          <LoaderCircle size={30} className="budget-spin" />
          <p>Loading your monthly budgets...</p>
        </div>
      ) : (
        <>
          <div className="budget-summary-grid">
            {summaryCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="budget-summary-card"
                  key={item.label}
                  style={{
                    "--budget-accent": item.accent,
                    "--budget-glow": item.glow,
                    "--budget-icon-bg": item.iconBg,
                  } as React.CSSProperties}
                >
                  <div className="budget-summary-top">
                    <span className="budget-summary-label">
                      {item.label}
                    </span>

                    <span className="budget-summary-icon">
                      <Icon size={19} />
                    </span>
                  </div>

                  <div className="budget-summary-value">
                    {currency(item.value)}
                  </div>

                  <div className="budget-summary-caption">
                    {item.caption}
                  </div>
                </div>
              );
            })}
          </div>

          {budgets.length > 0 && (
            <div className="budget-panel budget-overview">
              <div className="budget-overview-header">
                <div>
                  <h3 className="budget-section-heading">
                    Overall budget usage
                  </h3>
                  <p className="budget-subtitle">
                    Your total spending compared with your limits
                  </p>
                </div>

                <strong
                  className="budget-overview-percent"
                  style={{ color: overallColor }}
                >
                  {totals.percentage.toFixed(1)}%
                </strong>
              </div>

              <div className="budget-progress-track">
                <div
                  className="budget-progress-fill"
                  style={{
                    width: `${Math.min(totals.percentage, 100)}%`,
                    background: `linear-gradient(90deg, ${overallColor}, #818cf8)`,
                  }}
                />
              </div>

              <p className="budget-overview-caption">
                {totals.percentage >= 100
                  ? "Your overall spending has exceeded the allocated budget. Review your categories to get back on track."
                  : totals.percentage >= 80
                    ? "You have used at least 80% of your total budget. Keep an eye on your remaining spending."
                    : "Your overall spending is within the allocated budget. Keep up the good work."}
              </p>
            </div>
          )}

          <div className="budget-category-section">
            <div className="budget-category-heading">
              <Wallet size={19} />
              <h3 className="budget-section-heading">
                Category breakdown
              </h3>
            </div>

            {budgets.length === 0 ? (
              <div className="budget-panel budget-empty">
                <div className="budget-empty-icon">
                  <Wallet size={30} />
                </div>

                <h3>No budgets for this month</h3>

                <p>
                  Create your first category budget to start tracking
                  your spending and build better money habits.
                </p>

                <button
                  type="button"
                  className="budget-primary-button"
                  onClick={openAddForm}
                >
                  <Plus size={17} />
                  Create Your First Budget
                </button>
              </div>
            ) : (
              budgets.map((budget, index) => {
                const exceeded = budget.status === "EXCEEDED";
                const warning = budget.status === "WARNING";

                const barColor = exceeded
                  ? "#fb7185"
                  : warning
                    ? "#fbbf24"
                    : "#34d399";

                const categoryColors = [
                  "#a78bfa",
                  "#38bdf8",
                  "#2dd4bf",
                  "#fb923c",
                  "#f472b6",
                  "#818cf8",
                  "#4ade80",
                  "#facc15",
                  "#94a3b8",
                ];

                const categoryColor =
                  categoryColors[index % categoryColors.length];

                return (
                  <div
                    key={budget.id}
                    className="budget-category-card"
                  >
                    <div className="budget-category-top">
                      <div className="budget-category-name-wrap">
                        <span
                          className="budget-category-dot"
                          style={{ background: categoryColor }}
                        />

                        <div>
                          <strong className="budget-category-name">
                            {budget.category}
                          </strong>

                          <p className="budget-category-description">
                            {currency(budget.spent)} spent of{" "}
                            {currency(budget.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="budget-category-actions">
                        <button
                          type="button"
                          className="budget-icon-button"
                          aria-label={`Edit ${budget.category} budget`}
                          title="Edit budget"
                          onClick={() => openEditForm(budget)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="budget-icon-button"
                          aria-label={`Delete ${budget.category} budget`}
                          title="Delete budget"
                          style={{ color: "#fb7185" }}
                          onClick={() => void handleDeleteBudget(budget)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="budget-category-progress-info">
                      <span className="budget-remaining">
                        {currency(budget.remaining)} remaining
                      </span>

                      <strong
                        className="budget-percent"
                        style={{ color: barColor }}
                      >
                        {budget.percentage.toFixed(1)}%
                      </strong>
                    </div>

                    <div className="budget-progress-track budget-category-progress">
                      <div
                        className="budget-progress-fill"
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                          background: `linear-gradient(90deg, ${barColor}, #818cf8)`,
                        }}
                      />
                    </div>

                    <div
                      className="budget-status"
                      style={{ color: barColor }}
                    >
                      {exceeded ? (
                        <>
                          <AlertTriangle size={15} />
                          Budget exceeded. Reduce spending in this category.
                        </>
                      ) : warning ? (
                        <>
                          <AlertTriangle size={15} />
                          Spending alert: 80% or more of budget used.
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          Spending is within your budget.
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default BudgetSection;
