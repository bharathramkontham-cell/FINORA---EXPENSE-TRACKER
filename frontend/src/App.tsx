
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Wallet,
  Settings,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sparkles,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Menu,
  LoaderCircle,
  RefreshCw,
  X,
  Trash2,
  Pencil,
  SlidersHorizontal,
  Download,
  LogOut,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  getSummary,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  setAuthToken,
  clearAuthToken,
  type Transaction,
  type DashboardSummary,
} from "./lib/api";

import Auth from "./Auth";
import BudgetSection from "./BudgetSection";
import "./App.css";

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

const AUTH_USER_KEY = "finora_user";

const CATEGORY_COLORS = [
  "#22c98b",
  "#60a5fa",
  "#f59e0b",
  "#e87979",
  "#a78bfa",
  "#38bdf8",
  "#f472b6",
  "#94a3b8",
];

type TransactionTypeFilter = "ALL" | "INCOME" | "EXPENSE";

type SortOrder =
  | "NEWEST"
  | "OLDEST"
  | "HIGHEST"
  | "LOWEST";

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

function getStoredUser(): AuthUser | null {
  const token = localStorage.getItem("finora_token");
  const savedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!token || !savedUser) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedUser) as AuthUser;

    if (
      typeof parsed.id === "number" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string"
    ) {
      return parsed;
    }
  } catch {
    // Invalid saved account data.
  }

  localStorage.removeItem("finora_token");
  localStorage.removeItem(AUTH_USER_KEY);

  return null;
}

const getTransactionIcon = (category: string | null) => {
  switch (category?.toLowerCase()) {
    case "food":
      return Coffee;
    case "shopping":
      return ShoppingBag;
    case "travel":
    case "transport":
      return Car;
    case "housing":
      return Home;
    default:
      return Wallet;
  }
};

function App() {
  // Authentication
  const [user, setUser] = useState<AuthUser | null>(
    () => getStoredUser()
  );

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [deleteError, setDeleteError] = useState("");

  // Edit transaction state
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const [editType, setEditType] =
    useState<"INCOME" | "EXPENSE">("EXPENSE");

  const [editCategory, setEditCategory] = useState("Food");

  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Search, filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [typeFilter, setTypeFilter] =
    useState<TransactionTypeFilter>("ALL");

  const [sortOrder, setSortOrder] =
    useState<SortOrder>("NEWEST");

  // Transaction form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const [type, setType] =
    useState<"INCOME" | "EXPENSE">("EXPENSE");

  const [category, setCategory] = useState("Food");

  // Load dashboard data for the logged-in user
  async function loadDashboard() {
    if (!user) {
      setSummary(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const [summaryResult, transactionResult] =
        await Promise.all([
          getSummary(user.id),
          getTransactions(user.id),
        ]);

      setSummary(summaryResult.summary);
      setTransactions(transactionResult.transactions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }

  // Load data whenever the authenticated user changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    void loadDashboard();
  }, [user]);

  // Login and registration success
  function handleAuthSuccess(
    authenticatedUser: AuthUser,
    token: string
  ) {
    setAuthToken(token);

    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(authenticatedUser)
    );

    setSummary(null);
    setTransactions([]);
    setUser(authenticatedUser);
    setError("");
    setLoading(true);
  }

  // Logout
  function handleLogout() {
    clearAuthToken();
    localStorage.removeItem(AUTH_USER_KEY);

    setUser(null);
    setSummary(null);
    setTransactions([]);

    setShowForm(false);
    setEditingTransaction(null);

    setError("");
    setLoading(false);
  }

  // Six-month financial chart
  const chartData = useMemo(() => {
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1
      );

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        income: 0,
        expenses: 0,
      };
    });

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      const key =
        `${date.getFullYear()}-${date.getMonth()}`;

      const month = months.find(
        (item) => item.key === key
      );

      if (!month) return;

      const value = Number(transaction.amount);

      if (transaction.type === "INCOME") {
        month.income += value;
      } else {
        month.expenses += value;
      }
    });

    return months;
  }, [transactions]);

  // Category-wise expense analytics
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};

    transactions
      .filter((item) => item.type === "EXPENSE")
      .forEach((item) => {
        const categoryName =
          item.category || "Uncategorized";

        totals[categoryName] =
          (totals[categoryName] || 0) +
          Number(item.amount);
      });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Current month versus previous month
  const monthlyComparison = useMemo(() => {
    const now = new Date();

    const currentStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const previousStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    let currentExpenses = 0;
    let previousExpenses = 0;

    transactions
      .filter((item) => item.type === "EXPENSE")
      .forEach((item) => {
        const date = new Date(item.date);
        const value = Number(item.amount);

        if (date >= currentStart && date <= now) {
          currentExpenses += value;
        } else if (
          date >= previousStart &&
          date < currentStart
        ) {
          previousExpenses += value;
        }
      });

    const change =
      previousExpenses === 0
        ? currentExpenses > 0
          ? 100
          : 0
        : ((currentExpenses - previousExpenses) /
            previousExpenses) *
          100;

    return {
      currentExpenses,
      previousExpenses,
      change,
    };
  }, [transactions]);

  // Savings rate
  const savingsRate = useMemo(() => {
    const income = Number(summary?.totalIncome ?? 0);
    const expenses = Number(summary?.totalExpenses ?? 0);

    if (income <= 0) return 0;

    return ((income - expenses) / income) * 100;
  }, [summary]);

  // Smart financial insights
  const financialInsights = useMemo(() => {
    const insights: {
      title: string;
      message: string;
      type: "success" | "warning" | "info";
    }[] = [];

    const income = Number(summary?.totalIncome ?? 0);
    const expenses = Number(summary?.totalExpenses ?? 0);

    if (income === 0 && expenses === 0) {
      insights.push({
        title: "Start your financial journey",
        message:
          "Add income and expenses to unlock personalized spending insights.",
        type: "info",
      });
    } else if (income > 0 && savingsRate >= 20) {
      insights.push({
        title: "Great savings performance!",
        message:
          `You're retaining ${savingsRate.toFixed(1)}% of your recorded income. Keep building this habit.`,
        type: "success",
      });
    } else if (income > 0 && savingsRate > 0) {
      insights.push({
        title: "Improve your savings",
        message:
          "Try reducing non-essential expenses to increase the amount you save.",
        type: "info",
      });
    } else {
      insights.push({
        title: "Review your spending",
        message:
          "Your recorded expenses are equal to or higher than your income. Review your spending habits.",
        type: "warning",
      });
    }

    if (categoryData.length > 0) {
      const topCategory = categoryData[0];

      insights.push({
        title: "Your biggest spending category",
        message:
          `${topCategory.name} accounts for ${currency(topCategory.value)} of your recorded expenses. Review this category for possible savings.`,
        type: "info",
      });
    }

    if (monthlyComparison.previousExpenses > 0) {
      insights.push({
        title:
          monthlyComparison.change > 0
            ? "Monthly spending increased"
            : monthlyComparison.change < 0
              ? "Monthly spending decreased"
              : "Monthly spending is stable",

        message:
          monthlyComparison.change > 0
            ? `Your expenses increased by ${Math.abs(monthlyComparison.change).toFixed(1)}% compared with last month.`
            : monthlyComparison.change < 0
              ? `Your expenses decreased by ${Math.abs(monthlyComparison.change).toFixed(1)}% compared with last month.`
              : "Your expenses are unchanged compared with last month.",

        type:
          monthlyComparison.change > 0
            ? "warning"
            : "success",
      });
    }

    return insights;
  }, [
    summary,
    savingsRate,
    categoryData,
    monthlyComparison,
  ]);

  // Financial Health Score
  const financialHealth = useMemo(() => {
    const income = Number(summary?.totalIncome ?? 0);
    const expenses = Number(summary?.totalExpenses ?? 0);

    let score = 0;

    if (income > 0) {
      score += Math.min(
        40,
        Math.max(0, savingsRate) * 2
      );
    }

    if (income > expenses) {
      score += 30;
    } else if (income === expenses && income > 0) {
      score += 15;
    }

    if (monthlyComparison.previousExpenses > 0) {
      if (monthlyComparison.change <= 0) {
        score += 20;
      } else if (monthlyComparison.change <= 10) {
        score += 10;
      }
    } else if (monthlyComparison.currentExpenses === 0) {
      score += 20;
    }

    if (transactions.length >= 10) {
      score += 10;
    } else if (transactions.length >= 5) {
      score += 7;
    } else if (transactions.length > 0) {
      score += 4;
    }

    const finalScore = Math.round(
      Math.min(100, Math.max(0, score))
    );

    return {
      score: finalScore,
      rating:
        finalScore >= 80
          ? "Excellent"
          : finalScore >= 60
            ? "Good"
            : finalScore >= 40
              ? "Fair"
              : "Needs Improvement",
    };
  }, [
    summary,
    savingsRate,
    monthlyComparison,
    transactions.length,
  ]);

  // Search, category filter, type filter and sorting
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = transactions.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.category ?? "Uncategorized")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "ALL" ||
        (item.category ?? "Uncategorized").toLowerCase() ===
          categoryFilter.toLowerCase();

      const matchesType =
        typeFilter === "ALL" ||
        item.type === typeFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType
      );
    });

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case "OLDEST":
          return (
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
          );

        case "HIGHEST":
          return Number(b.amount) - Number(a.amount);

        case "LOWEST":
          return Number(a.amount) - Number(b.amount);

        case "NEWEST":
        default:
          return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
          );
      }
    });
  }, [
    transactions,
    searchQuery,
    categoryFilter,
    typeFilter,
    sortOrder,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    sortOrder !== "NEWEST";

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setSortOrder("NEWEST");
  }

  // Add transaction
  async function handleAddTransaction(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setFormError("");

    if (!user) return;

    const numericAmount = Number(amount);

    if (
      !title.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setFormError("Enter a valid title and amount.");
      return;
    }

    try {
      setSaving(true);

      await createTransaction({
        title: title.trim(),
        amount: numericAmount,
        type,
        category,
        userId: user.id,
      });

      setTitle("");
      setAmount("");
      setType("EXPENSE");
      setCategory("Food");
      setShowForm(false);

      await loadDashboard();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not save transaction"
      );
    } finally {
      setSaving(false);
    }
  }

  // Open edit form
  function handleEditClick(item: Transaction) {
    setEditingTransaction(item);
    setEditTitle(item.title);
    setEditAmount(String(item.amount));
    setEditType(item.type);
    setEditCategory(item.category || "Other");
    setEditError("");
  }

  // Save updated transaction
  async function handleUpdateTransaction(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setEditError("");

    if (!user) return;

    const numericAmount = Number(editAmount);

    if (
      !editTitle.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setEditError("Enter a valid title and amount.");
      return;
    }

    if (!editingTransaction) return;

    try {
      setUpdating(true);

      await updateTransaction(editingTransaction.id, {
        title: editTitle.trim(),
        amount: numericAmount,
        type: editType,
        category: editCategory,
        userId: user.id,
      });

      setEditingTransaction(null);

      await loadDashboard();
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Could not update transaction."
      );
    } finally {
      setUpdating(false);
    }
  }

  // Delete transaction after confirmation
  async function handleDeleteTransaction(
    item: Transaction
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}" (${currency(
        Number(item.amount)
      )})?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleteError("");
      setDeletingId(item.id);

      await deleteTransaction(item.id);

      await loadDashboard();
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Could not delete this transaction."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Export transactions to CSV
  function exportTransactions() {
    if (transactions.length === 0) {
      window.alert("No transactions available to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Title",
      "Amount",
      "Type",
      "Category",
      "Date",
    ];

    const escapeCSV = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = transactions.map((item) => [
      item.id,
      item.title,
      item.amount,
      item.type,
      item.category || "Uncategorized",
      new Date(item.date).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "FINORA_Transactions.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // Show authentication screen when logged out
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Loading screen
  if (loading) {
    return (
      <div
        className="app-shell"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#ffffff",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <LoaderCircle className="spin" size={38} />
          <p>Connecting to FINORA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">F</div>
          <span>FINORA</span>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          <a className="nav-item active" href="#">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a className="nav-item" href="#transactions">
            <ArrowLeftRight size={19} />
            Transactions
          </a>

          <a className="nav-item" href="#analytics">
            <ChartNoAxesCombined size={19} />
            Analytics
          </a>

          <a className="nav-item" href="#budgets">
            <Wallet size={19} />
            Monthly Budgets
          </a>

          <a className="nav-item" href="#insights">
            <Wallet size={19} />
            Financial overview
          </a>
        </nav>

        <div className="sidebar-bottom">
          <a className="nav-item" href="#settings">
            <Settings size={19} />
            Settings
          </a>

          <div className="profile">
            <div className="avatar">
              {user.name.trim().charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open menu"
            type="button"
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            Workspace / <strong>Overview</strong>
          </div>

          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="Search"
              type="button"
              onClick={() => {
                document
                  .getElementById("transaction-search")
                  ?.focus();
              }}
            >
              <Search size={19} />
            </button>

            <button
              className="icon-button"
              aria-label="Notifications"
              type="button"
            >
              <Bell size={19} />
            </button>

            <div className="avatar">
              {user.name.trim().charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              className="view-all"
              onClick={handleLogout}
              title="Logout from FINORA"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard">
          {/* Welcome and main actions */}
          <div className="welcome-row">
            <div>
              <p className="eyebrow">
                YOUR FINANCIAL OVERVIEW
              </p>

              <h1>
                Welcome, {user.name.split(" ")[0]} 👋
              </h1>

              <p className="subheading">
                Here's what's happening with your money.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="view-all"
                onClick={exportTransactions}
                disabled={transactions.length === 0}
                style={{
                  opacity:
                    transactions.length === 0 ? 0.5 : 1,
                  cursor:
                    transactions.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <Download size={17} />
                Export CSV
              </button>

              <button
                type="button"
                className="add-button"
                onClick={() => {
                  setFormError("");
                  setShowForm(true);
                }}
              >
                <Plus size={18} />
                Add Transaction
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: "14px",
                marginBottom: "18px",
                borderRadius: "10px",
                background: "#442323",
                color: "#ffb6b6",
              }}
            >
              {error}

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void loadDashboard();
                }}
                style={{ marginLeft: "12px" }}
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          )}

          {/* Add transaction form */}
          {showForm && (
            <section
              className="panel"
              style={{
                marginBottom: "22px",
                padding: "22px",
              }}
            >
              <div className="panel-heading">
                <div>
                  <h3>Add a transaction</h3>
                  <p>
                    Save a new income or expense to your account.
                  </p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={handleAddTransaction}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "14px",
                  marginTop: "18px",
                }}
              >
                <label>
                  <small>Transaction title</small>
                  <input
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Grocery shopping"
                    required
                  />
                </label>

                <label>
                  <small>Amount (₹)</small>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="250"
                    required
                  />
                </label>

                <label>
                  <small>Type</small>
                  <select
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target.value as
                          | "INCOME"
                          | "EXPENSE"
                      )
                    }
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </label>

                <label>
                  <small>Category</small>
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                  >
                    <option>Food</option>
                    <option>Shopping</option>
                    <option>Travel</option>
                    <option>Housing</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                    <option>Salary</option>
                    <option>Other</option>
                  </select>
                </label>

                {formError && (
                  <p
                    role="alert"
                    style={{
                      color: "#ff8585",
                      gridColumn: "1 / -1",
                    }}
                  >
                    {formError}
                  </p>
                )}

                <button
                  className="add-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Transaction"}
                </button>
              </form>
            </section>
          )}

          {/* Dashboard statistics */}
          <div className="stats-grid">
            <div className="stat-card balance-card">
              <div className="stat-heading">
                <span>Total Balance</span>
                <Wallet size={20} />
              </div>

              <h2>
                {currency(summary?.balance ?? 0)}
              </h2>

              <p className="subheading">
                Income minus expenses
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-heading">
                <span>Total Income</span>

                <div className="stat-icon green">
                  <ArrowDownRight />
                </div>
              </div>

              <h2>
                {currency(summary?.totalIncome ?? 0)}
              </h2>

              <p className="positive">Money received</p>
            </div>

            <div className="stat-card">
              <div className="stat-heading">
                <span>Total Expenses</span>

                <div className="stat-icon red">
                  <ArrowUpRight />
                </div>
              </div>

              <h2>
                {currency(summary?.totalExpenses ?? 0)}
              </h2>

              <p className="negative">Money spent</p>
            </div>

            <div className="stat-card">
              <div className="stat-heading">
                <span>Total Transactions</span>

                <div className="stat-icon green">
                  <ArrowLeftRight />
                </div>
              </div>

              <h2>
                {summary?.transactionCount ?? 0}
              </h2>

              <p className="positive">
                Recorded transactions
              </p>
            </div>
          </div>

          {/* Monthly budgets */}
          <div id="budgets">
            <BudgetSection userId={user.id} />
          </div>

          {/* Advanced Financial Analytics */}
          <section
            className="panel"
            style={{
              marginBottom: "22px",
              padding: "22px",
            }}
          >
            <div className="panel-heading">
              <div>
                <h3>Advanced Financial Analytics</h3>
                <p>
                  Understand your spending and savings performance.
                </p>
              </div>

              <Sparkles size={22} color="#22c98b" />
            </div>

            <div
              className="stats-grid"
              style={{ marginTop: "20px" }}
            >
              <div className="stat-card">
                <div className="stat-heading">
                  <span>Savings Rate</span>
                  <Wallet size={20} />
                </div>

                <h2>{savingsRate.toFixed(1)}%</h2>

                <p className="positive">
                  Income remaining after expenses
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-heading">
                  <span>This Month's Expenses</span>
                  <ArrowUpRight size={20} />
                </div>

                <h2>
                  {currency(monthlyComparison.currentExpenses)}
                </h2>

                <p className="subheading">
                  Current month
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-heading">
                  <span>Previous Month</span>
                  <ArrowLeftRight size={20} />
                </div>

                <h2>
                  {currency(monthlyComparison.previousExpenses)}
                </h2>

                <p className="subheading">
                  Previous month expenses
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-heading">
                  <span>Spending Change</span>
                  <ChartNoAxesCombined size={20} />
                </div>

                <h2>
                  {monthlyComparison.change.toFixed(1)}%
                </h2>

                <p
                  className={
                    monthlyComparison.change > 0
                      ? "negative"
                      : "positive"
                  }
                >
                  {monthlyComparison.change > 0
                    ? "Spending increased"
                    : monthlyComparison.change < 0
                      ? "Spending decreased"
                      : "No spending change"}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "22px",
                marginTop: "25px",
              }}
            >
              {/* Category pie chart */}
              <div
                className="panel"
                style={{ padding: "18px" }}
              >
                <h3>Category-wise Spending</h3>

                <p className="subheading">
                  Expense distribution across categories.
                </p>

                {categoryData.length === 0 ? (
                  <p className="subheading">
                    No expense data available yet.
                  </p>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "280px",
                    }}
                  >
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={3}
                        >
                          {categoryData.map(
                            (entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  CATEGORY_COLORS[
                                    index % CATEGORY_COLORS.length
                                  ]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            currency(Number(value))
                          }
                          contentStyle={{
                            background: "#172131",
                            border: "1px solid #344256",
                            borderRadius: "10px",
                            color: "#fff",
                          }}
                        />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Monthly spending comparison */}
              <div
                className="panel"
                style={{ padding: "18px" }}
              >
                <h3>Monthly Spending Comparison</h3>

                <p className="subheading">
                  Compare this month with last month.
                </p>

                <div style={{ marginTop: "25px" }}>
                  <p>This month</p>

                  <h2>
                    {currency(monthlyComparison.currentExpenses)}
                  </h2>

                  <div
                    style={{
                      height: "12px",
                      background: "#283344",
                      borderRadius: "20px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${
                          Math.max(
                            monthlyComparison.currentExpenses,
                            monthlyComparison.previousExpenses
                          ) === 0
                            ? 0
                            : (monthlyComparison.currentExpenses /
                                Math.max(
                                  monthlyComparison.currentExpenses,
                                  monthlyComparison.previousExpenses
                                )) *
                              100
                        }%`,
                        background: "#22c98b",
                        borderRadius: "20px",
                      }}
                    />
                  </div>

                  <p style={{ marginTop: "22px" }}>
                    Previous month
                  </p>

                  <h2>
                    {currency(monthlyComparison.previousExpenses)}
                  </h2>

                  <div
                    style={{
                      height: "12px",
                      background: "#283344",
                      borderRadius: "20px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${
                          Math.max(
                            monthlyComparison.currentExpenses,
                            monthlyComparison.previousExpenses
                          ) === 0
                            ? 0
                            : (monthlyComparison.previousExpenses /
                                Math.max(
                                  monthlyComparison.currentExpenses,
                                  monthlyComparison.previousExpenses
                                )) *
                              100
                        }%`,
                        background: "#60a5fa",
                        borderRadius: "20px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Health Score */}
          <section
            className="panel"
            style={{
              marginBottom: "22px",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "24px",
            }}
          >
            <div>
              <div className="ai-heading">
                <Sparkles size={20} />
                <span>FINORA FINANCIAL WELLNESS</span>
              </div>

              <h3 style={{ marginTop: "14px" }}>
                Financial Health Score
              </h3>

              <p
                style={{
                  color: "#aab5c5",
                  lineHeight: 1.7,
                }}
              >
                A simple score based on your savings,
                spending balance, monthly trends, and
                transaction tracking.
              </p>

              <h2
                style={{
                  color: "#22c98b",
                  fontSize: "28px",
                  marginTop: "12px",
                }}
              >
                {financialHealth.rating}
              </h2>

              <p
                style={{
                  color: "#8995a8",
                  fontSize: "12px",
                }}
              >
                Your score updates when your financial
                activity changes.
              </p>
            </div>

            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: `conic-gradient(#22c98b ${financialHealth.score * 3.6}deg, #283344 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "132px",
                  height: "132px",
                  borderRadius: "50%",
                  background: "#111b2a",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <strong
                  style={{
                    fontSize: "38px",
                    color: "#ffffff",
                  }}
                >
                  {financialHealth.score}
                </strong>

                <span
                  style={{
                    color: "#8995a8",
                    fontSize: "12px",
                  }}
                >
                  OUT OF 100
                </span>
              </div>
            </div>
          </section>

          {/* Smart Financial Insights */}
          <section
            className="panel"
            id="insights"
            style={{
              marginBottom: "22px",
              padding: "22px",
            }}
          >
            <div className="panel-heading">
              <div>
                <div className="ai-heading">
                  <Sparkles size={20} />
                  <span>FINORA INTELLIGENCE</span>
                </div>

                <h3 style={{ marginTop: "12px" }}>
                  Your Smart Financial Insights
                </h3>

                <p>
                  Personalized observations based on your
                  financial activity.
                </p>
              </div>

              <Sparkles size={25} color="#22c98b" />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
                marginTop: "22px",
              }}
            >
              {financialInsights.map((insight, index) => (
                <div
                  key={index}
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "#172131",
                    border: "1px solid #344256",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      marginBottom: "12px",
                    }}
                  >
                    {insight.type === "success" ? (
                      <ArrowDownRight
                        color="#22c98b"
                        size={21}
                      />
                    ) : insight.type === "warning" ? (
                      <ArrowUpRight
                        color="#f59e0b"
                        size={21}
                      />
                    ) : (
                      <Sparkles
                        color="#60a5fa"
                        size={21}
                      />
                    )}

                    <strong>{insight.title}</strong>
                  </div>

                  <p
                    style={{
                      color: "#aab5c5",
                      fontSize: "13px",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {insight.message}
                  </p>
                </div>
              ))}
            </div>

            <p
              style={{
                color: "#8995a8",
                fontSize: "11px",
                marginTop: "18px",
              }}
            >
              Insights are currently generated using
              transaction-based rules. AI-powered
              recommendations will be introduced in a
              future phase.
            </p>
          </section>

          {/* Financial Analytics Summary */}
          <section
            className="panel"
            style={{
              marginBottom: "22px",
              padding: "22px",
            }}
          >
            <div className="panel-heading">
              <div>
                <h3>Financial Analytics Summary</h3>
                <p>
                  A snapshot of your overall financial activity.
                </p>
              </div>

              <ChartNoAxesCombined
                size={24}
                color="#22c98b"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginTop: "22px",
              }}
            >
              <div
                style={{
                  background: "#172131",
                  padding: "18px",
                  borderRadius: "14px",
                }}
              >
                <p
                  style={{
                    color: "#aab5c5",
                    fontSize: "13px",
                  }}
                >
                  Total Income
                </p>

                <h3
                  style={{
                    color: "#22c98b",
                    marginTop: "10px",
                  }}
                >
                  {currency(Number(summary?.totalIncome ?? 0))}
                </h3>
              </div>

              <div
                style={{
                  background: "#172131",
                  padding: "18px",
                  borderRadius: "14px",
                }}
              >
                <p
                  style={{
                    color: "#aab5c5",
                    fontSize: "13px",
                  }}
                >
                  Total Expenses
                </p>

                <h3
                  style={{
                    color: "#f59e0b",
                    marginTop: "10px",
                  }}
                >
                  {currency(Number(summary?.totalExpenses ?? 0))}
                </h3>
              </div>

              <div
                style={{
                  background: "#172131",
                  padding: "18px",
                  borderRadius: "14px",
                }}
              >
                <p
                  style={{
                    color: "#aab5c5",
                    fontSize: "13px",
                  }}
                >
                  Net Savings
                </p>

                <h3
                  style={{
                    color:
                      Number(summary?.totalIncome ?? 0) -
                        Number(summary?.totalExpenses ?? 0) >=
                      0
                        ? "#22c98b"
                        : "#e87979",
                    marginTop: "10px",
                  }}
                >
                  {currency(
                    Number(summary?.totalIncome ?? 0) -
                      Number(summary?.totalExpenses ?? 0)
                  )}
                </h3>
              </div>

              <div
                style={{
                  background: "#172131",
                  padding: "18px",
                  borderRadius: "14px",
                }}
              >
                <p
                  style={{
                    color: "#aab5c5",
                    fontSize: "13px",
                  }}
                >
                  Expense Categories
                </p>

                <h3
                  style={{
                    color: "#60a5fa",
                    marginTop: "10px",
                  }}
                >
                  {categoryData.length}
                </h3>
              </div>
            </div>
          </section>

          {/* Six-month financial analytics */}
          <div className="content-grid">
            <section
              className="panel analytics-panel"
              id="analytics"
            >
              <div className="panel-heading">
                <div>
                  <h3>Financial Analytics</h3>
                  <p>
                    Income and expenses from your saved
                    transactions.
                  </p>
                </div>

                <span className="period-label">
                  Last 6 months
                </span>
              </div>

              <div className="chart-legend">
                <span>
                  <i className="legend-income" />
                  Income
                </span>

                <span>
                  <i className="legend-expense" />
                  Expenses
                </span>
              </div>

              <div className="chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="incomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#22c98b"
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="100%"
                          stopColor="#22c98b"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="expenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#e87979"
                          stopOpacity={0.2}
                        />

                        <stop
                          offset="100%"
                          stopColor="#e87979"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#283344"
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="month"
                      stroke="#8995a8"
                    />

                    <YAxis stroke="#8995a8" />

                    <Tooltip
                      formatter={(value) =>
                        currency(Number(value))
                      }
                      contentStyle={{
                        background: "#172131",
                        border: "1px solid #344256",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#22c98b"
                      fill="url(#incomeGradient)"
                      strokeWidth={2.5}
                    />

                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#e87979"
                      fill="url(#expenseGradient)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Financial overview */}
            <section className="panel insight-panel">
              <div className="ai-heading">
                <Sparkles size={20} />
                <span>FINORA FINANCIAL OVERVIEW</span>
              </div>

              <h3>Your financial insight</h3>

              <p>
                {(summary?.totalIncome ?? 0) >
                (summary?.totalExpenses ?? 0)
                  ? "Your recorded income is higher than your expenses. Keep tracking your spending to understand your financial habits."
                  : (summary?.totalIncome ?? 0) === 0 &&
                      (summary?.totalExpenses ?? 0) === 0
                    ? "Start recording your income and expenses to receive insights based on your financial activity."
                    : "Your recorded expenses are currently equal to or higher than your income. Review your transactions to understand where your money is going."}
              </p>

              <div className="saving-highlight">
                <span>Recorded savings</span>

                <strong>
                  {currency(summary?.balance ?? 0)}
                </strong>
              </div>

              <p className="demo-note">
                Basic insights based on your saved
                transactions. AI-powered analysis will be
                added in a later phase.
              </p>
            </section>
          </div>

          {/* Transaction management */}
          <section
            className="panel transactions-panel"
            id="transactions"
          >
            <div className="panel-heading">
              <div>
                <h3>Recent Transactions</h3>

                <p>
                  {filteredTransactions.length} matching out of{" "}
                  {transactions.length} saved transactions.
                </p>
              </div>

              <button
                type="button"
                className="view-all"
                onClick={() => {
                  setLoading(true);
                  void loadDashboard();
                }}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {/* Search and filters */}
            <div
              className="transaction-filters"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "12px",
                padding: "18px 16px",
                borderBottom: "1px solid #283344",
              }}
            >
              <label style={{ position: "relative" }}>
                <small
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#aab5c5",
                  }}
                >
                  Search transactions
                </small>

                <div style={{ position: "relative" }}>
                  <Search
                    size={17}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8995a8",
                      pointerEvents: "none",
                    }}
                  />

                  <input
                    id="transaction-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search by title or category..."
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      paddingLeft: "38px",
                    }}
                  />
                </div>
              </label>

              <label>
                <small
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#aab5c5",
                  }}
                >
                  Category
                </small>

                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                  style={{ width: "100%" }}
                >
                  <option value="ALL">All categories</option>
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Travel">Travel</option>
                  <option value="Housing">Housing</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">
                    Entertainment
                  </option>
                  <option value="Salary">Salary</option>
                  <option value="Other">Other</option>
                  <option value="Uncategorized">
                    Uncategorized
                  </option>
                </select>
              </label>

              <label>
                <small
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#aab5c5",
                  }}
                >
                  Transaction type
                </small>

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as TransactionTypeFilter
                    )
                  }
                  style={{ width: "100%" }}
                >
                  <option value="ALL">All transactions</option>
                  <option value="INCOME">Income only</option>
                  <option value="EXPENSE">Expenses only</option>
                </select>
              </label>

              <label>
                <small
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    color: "#aab5c5",
                  }}
                >
                  Sort by
                </small>

                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(
                      event.target.value as SortOrder
                    )
                  }
                  style={{ width: "100%" }}
                >
                  <option value="NEWEST">Newest first</option>
                  <option value="OLDEST">Oldest first</option>
                  <option value="HIGHEST">Highest amount</option>
                  <option value="LOWEST">Lowest amount</option>
                </select>
              </label>
            </div>

            {/* Filter status */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                padding: "12px 16px",
              }}
            >
              <span
                style={{
                  color: "#aab5c5",
                  fontSize: "13px",
                }}
              >
                <SlidersHorizontal
                  size={14}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: "6px",
                  }}
                />

                Showing {filteredTransactions.length} transactions
              </span>

              <button
                type="button"
                className="view-all"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                style={{
                  opacity: hasActiveFilters ? 1 : 0.45,
                  cursor: hasActiveFilters
                    ? "pointer"
                    : "not-allowed",
                }}
              >
                <X size={15} />
                Clear filters
              </button>
            </div>

            {deleteError && (
              <p
                role="alert"
                style={{
                  color: "#ff8585",
                  padding: "10px 16px",
                  margin: 0,
                }}
              >
                {deleteError}
              </p>
            )}

            {/* Edit transaction form */}
            {editingTransaction && (
              <section
                className="panel"
                style={{
                  margin: "16px",
                  padding: "22px",
                  border: "1px solid #22c98b",
                }}
              >
                <div className="panel-heading">
                  <div>
                    <h3>Edit Transaction</h3>
                    <p>Update your transaction details.</p>
                  </div>

                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      setEditingTransaction(null);
                      setEditError("");
                    }}
                    aria-label="Cancel editing"
                  >
                    <X size={19} />
                  </button>
                </div>

                <form
                  onSubmit={handleUpdateTransaction}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "14px",
                    marginTop: "18px",
                  }}
                >
                  <label>
                    <small>Transaction title</small>
                    <input
                      value={editTitle}
                      onChange={(event) =>
                        setEditTitle(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    <small>Amount (₹)</small>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editAmount}
                      onChange={(event) =>
                        setEditAmount(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    <small>Type</small>
                    <select
                      value={editType}
                      onChange={(event) =>
                        setEditType(
                          event.target.value as
                            | "INCOME"
                            | "EXPENSE"
                        )
                      }
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </label>

                  <label>
                    <small>Category</small>
                    <select
                      value={editCategory}
                      onChange={(event) =>
                        setEditCategory(event.target.value)
                      }
                    >
                      <option>Food</option>
                      <option>Shopping</option>
                      <option>Travel</option>
                      <option>Housing</option>
                      <option>Education</option>
                      <option>Entertainment</option>
                      <option>Salary</option>
                      <option>Other</option>
                    </select>
                  </label>

                  {editError && (
                    <p
                      role="alert"
                      style={{
                        color: "#ff8585",
                        gridColumn: "1 / -1",
                      }}
                    >
                      {editError}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="submit"
                      className="add-button"
                      disabled={updating}
                    >
                      {updating
                        ? "Updating..."
                        : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="view-all"
                      disabled={updating}
                      onClick={() => {
                        setEditingTransaction(null);
                        setEditError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Transaction list */}
            <div className="transaction-list">
              {filteredTransactions.length === 0 ? (
                <div
                  style={{
                    padding: "30px 20px",
                    textAlign: "center",
                  }}
                >
                  <Search
                    size={28}
                    style={{
                      color: "#8995a8",
                      marginBottom: "8px",
                    }}
                  />

                  <p
                    style={{
                      color: "#ffffff",
                      margin: "0 0 6px",
                    }}
                  >
                    No matching transactions found.
                  </p>

                  <p className="subheading">
                    Try another search or clear your filters.
                  </p>

                  <button
                    type="button"
                    className="view-all"
                    onClick={clearFilters}
                    style={{ marginTop: "10px" }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredTransactions.map((item) => {
                  const Icon = getTransactionIcon(item.category);
                  const isIncome = item.type === "INCOME";
                  const isDeleting = deletingId === item.id;

                  return (
                    <div
                      className="transaction-row"
                      key={item.id}
                    >
                      <div className="transaction-icon">
                        <Icon size={19} />
                      </div>

                      <div className="transaction-info">
                        <strong>{item.title}</strong>

                        <small>
                          {item.category ?? "Uncategorized"} ·{" "}
                          {new Date(item.date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </small>
                      </div>

                      <strong
                        className={
                          isIncome
                            ? "amount-income"
                            : "amount-expense"
                        }
                      >
                        {isIncome ? "+" : "-"}
                        {currency(Number(item.amount))}
                      </strong>

                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Edit transaction ${item.title}`}
                        title="Edit transaction"
                        disabled={
                          deletingId !== null || updating
                        }
                        onClick={() => handleEditClick(item)}
                        style={{
                          marginLeft: "12px",
                          color: "#60a5fa",
                        }}
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Delete transaction ${item.title}`}
                        title="Delete transaction"
                        disabled={deletingId !== null}
                        onClick={() =>
                          void handleDeleteTransaction(item)
                        }
                        style={{
                          marginLeft: "12px",
                          color: "#e87979",
                          opacity:
                            deletingId !== null && !isDeleting
                              ? 0.45
                              : 1,
                          cursor:
                            deletingId !== null
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isDeleting ? (
                          <LoaderCircle
                            className="spin"
                            size={18}
                          />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <span>
              © 2026 FINORA. Smart money, smarter decisions.
            </span>

            <span>
              Live data · PostgreSQL connected
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
