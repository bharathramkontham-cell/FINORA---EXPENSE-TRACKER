
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

    if (!category.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
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

  const panelStyle: React.CSSProperties = {
    background: "#172131",
    border: "1px solid #283344",
    borderRadius: "16px",
    padding: "20px",
  };

  const mutedStyle: React.CSSProperties = {
    color: "#aab5c5",
    fontSize: "13px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    marginTop: "7px",
    borderRadius: "8px",
    border: "1px solid #344256",
    background: "#101a28",
    color: "#ffffff",
  };

  return (
    <section
      id="budgets"
      style={{
        marginTop: "24px",
        display: "grid",
        gap: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <p
            style={{
              ...mutedStyle,
              letterSpacing: "1.5px",
              margin: "0 0 7px",
            }}
          >
            SMART MONEY MANAGEMENT
          </p>
          <h2 style={{ margin: 0, color: "#ffffff" }}>
            Monthly Budgets
          </h2>
          <p style={{ ...mutedStyle, marginBottom: 0 }}>
            Set spending limits and stay in control.
          </p>
        </div>

        <button
          type="button"
          className="add-button"
          onClick={openAddForm}
        >
          <Plus size={17} />
          Add Budget
        </button>
      </div>

      <div
        style={{
          ...panelStyle,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          type="button"
          className="icon-button"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
        >
          <ChevronLeft />
        </button>

        <strong style={{ color: "#ffffff", fontSize: "17px" }}>
          {monthLabel}
        </strong>

        <button
          type="button"
          className="icon-button"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
        >
          <ChevronRight />
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: "12px",
            borderRadius: "9px",
            background: "#442323",
            color: "#ffb6b6",
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <div style={panelStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <h3 style={{ color: "#ffffff", margin: 0 }}>
              {editingBudget ? "Edit budget" : "Create monthly budget"}
            </h3>

            <button
              type="button"
              className="icon-button"
              aria-label="Close budget form"
              onClick={() => setShowForm(false)}
            >
              <X size={19} />
            </button>
          </div>

          <form
            onSubmit={handleSaveBudget}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginTop: "16px",
            }}
          >
            <label style={{ color: "#aab5c5", fontSize: "13px" }}>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ color: "#aab5c5", fontSize: "13px" }}>
              Monthly limit (₹)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="e.g. 5000"
                required
                style={inputStyle}
              />
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: "9px",
              }}
            >
              <button
                type="submit"
                className="add-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingBudget
                    ? "Update Budget"
                    : "Save Budget"}
              </button>

              <button
                type="button"
                className="icon-button"
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
        <div
          style={{
            ...panelStyle,
            textAlign: "center",
            color: "#ffffff",
            padding: "35px",
          }}
        >
          <LoaderCircle className="spin" size={28} />
          <p>Loading monthly budgets...</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "14px",
            }}
          >
            <div style={panelStyle}>
              <div style={mutedStyle}>Total allocated</div>
              <h2 style={{ color: "#ffffff", marginBottom: 0 }}>
                {currency(totals.allocated)}
              </h2>
            </div>

            <div style={panelStyle}>
              <div style={mutedStyle}>Total spent</div>
              <h2 style={{ color: "#e87979", marginBottom: 0 }}>
                {currency(totals.spent)}
              </h2>
            </div>

            <div style={panelStyle}>
              <div style={mutedStyle}>Remaining budget</div>
              <h2
                style={{
                  color: totals.remaining < 0 ? "#e87979" : "#22c98b",
                  marginBottom: 0,
                }}
              >
                {currency(totals.remaining)}
              </h2>
            </div>
          </div>

          {budgets.length > 0 && (
            <div style={panelStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <strong style={{ color: "#ffffff" }}>
                  Overall budget usage
                </strong>
                <strong style={{ color: "#ffffff" }}>
                  {totals.percentage.toFixed(1)}%
                </strong>
              </div>

              <div
                style={{
                  height: "11px",
                  borderRadius: "20px",
                  background: "#283344",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(totals.percentage, 100)}%`,
                    height: "100%",
                    borderRadius: "20px",
                    background:
                      totals.percentage >= 100
                        ? "#e87979"
                        : totals.percentage >= 80
                          ? "#f0b45b"
                          : "#22c98b",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              <p style={{ ...mutedStyle, marginBottom: 0 }}>
                {totals.percentage >= 100
                  ? "Your overall spending has exceeded the allocated budget."
                  : totals.percentage >= 80
                    ? "You have used at least 80% of your total budget."
                    : "Your overall spending is within the allocated budget."}
              </p>
            </div>
          )}

          <div style={{ display: "grid", gap: "14px" }}>
            <h3 style={{ color: "#ffffff", margin: "4px 0" }}>
              Category breakdown
            </h3>

            {budgets.length === 0 ? (
              <div
                style={{
                  ...panelStyle,
                  textAlign: "center",
                  padding: "38px 20px",
                }}
              >
                <Wallet
                  size={34}
                  style={{ color: "#22c98b", marginBottom: "10px" }}
                />
                <h3 style={{ color: "#ffffff" }}>
                  No budgets for this month
                </h3>
                <p style={mutedStyle}>
                  Create your first category budget to start tracking
                  your spending.
                </p>
                <button
                  type="button"
                  className="add-button"
                  onClick={openAddForm}
                >
                  <Plus size={17} />
                  Create Your First Budget
                </button>
              </div>
            ) : (
              budgets.map((budget) => {
                const exceeded = budget.status === "EXCEEDED";
                const warning = budget.status === "WARNING";

                const barColor = exceeded
                  ? "#e87979"
                  : warning
                    ? "#f0b45b"
                    : "#22c98b";

                return (
                  <div
                    key={budget.id}
                    style={panelStyle}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: "#ffffff",
                            fontSize: "16px",
                          }}
                        >
                          {budget.category}
                        </strong>

                        <p style={{ ...mutedStyle, margin: "5px 0 0" }}>
                          {currency(budget.spent)} spent of{" "}
                          {currency(budget.amount)}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Edit ${budget.category} budget`}
                          title="Edit budget"
                          onClick={() => openEditForm(budget)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="icon-button"
                          aria-label={`Delete ${budget.category} budget`}
                          title="Delete budget"
                          style={{ color: "#e87979" }}
                          onClick={() => void handleDeleteBudget(budget)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        margin: "17px 0 8px",
                        gap: "10px",
                      }}
                    >
                      <span style={mutedStyle}>
                        {currency(budget.remaining)} remaining
                      </span>

                      <strong style={{ color: barColor, fontSize: "13px" }}>
                        {budget.percentage.toFixed(1)}%
                      </strong>
                    </div>

                    <div
                      style={{
                        height: "10px",
                        background: "#283344",
                        borderRadius: "20px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                          height: "100%",
                          background: barColor,
                          borderRadius: "20px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        marginTop: "13px",
                        color: barColor,
                        fontSize: "12px",
                      }}
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
