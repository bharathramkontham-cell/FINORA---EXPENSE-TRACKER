
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// ==========================================
// AUTHENTICATION TOKEN
// ==========================================

export const AUTH_TOKEN_KEY = "finora_token";

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ==========================================
// COMMON API REQUEST FUNCTION
// ==========================================

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();

  let result: unknown = {};

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
  }

  if (!response.ok) {
    const errorResult = result as { message?: string };

    throw new Error(
      errorResult.message || `Request failed (${response.status})`
    );
  }

  return result as T;
}

// ==========================================
// TYPES
// ==========================================

export type Transaction = {
  id: number;
  title: string;
  amount: number | string;
  type: "INCOME" | "EXPENSE";
  category: string | null;
  date: string;
  userId: number;
};

export type DashboardSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
};

export type Budget = {
  id: number;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  month: number;
  year: number;
  status: "GOOD" | "WARNING" | "EXCEEDED";
};

export type RecurringTransaction = {
  id: number;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string | null;
  description: string | null;
  frequency: "WEEKLY" | "MONTHLY";
  startDate: string;
  nextRunAt: string;
  endDate: string | null;
  lastRunAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: number;
};

// ==========================================
// CHECK BACKEND
// ==========================================

export async function checkBackend() {
  return apiRequest("/api/health");
}

// ==========================================
// CHECK DATABASE
// ==========================================

export async function checkDatabase() {
  return apiRequest("/api/db-check");
}

// ==========================================
// DASHBOARD SUMMARY
// ==========================================

export async function getSummary(userId: number) {
  return apiRequest<{
    success: boolean;
    summary: DashboardSummary;
  }>(`/api/summary?userId=${userId}`);
}

// ==========================================
// TRANSACTIONS
// ==========================================

export async function getTransactions(userId: number) {
  return apiRequest<{
    success: boolean;
    transactions: Transaction[];
  }>(`/api/transactions?userId=${userId}`);
}

export async function createTransaction(data: {
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  userId: number;
}) {
  return apiRequest("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(
  id: number,
  data: {
    title: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    category: string;
    userId: number;
  }
) {
  return apiRequest(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: number) {
  return apiRequest(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// MONTHLY BUDGET APIs
// ==========================================

export async function getBudgets(
  userId: number,
  month: number,
  year: number
) {
  const params = new URLSearchParams({
    userId: String(userId),
    month: String(month),
    year: String(year),
  });

  return apiRequest<{
    success: boolean;
    month: number;
    year: number;
    budgets: Budget[];
  }>(`/api/budgets?${params.toString()}`);
}

export async function createBudget(data: {
  userId: number;
  category: string;
  amount: number;
  month: number;
  year: number;
}) {
  return apiRequest("/api/budgets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBudget(
  id: number,
  data: {
    userId: number;
    amount: number;
    category?: string;
  }
) {
  return apiRequest(`/api/budgets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBudget(
  id: number,
  userId: number
) {
  return apiRequest(
    `/api/budgets/${id}?userId=${userId}`,
    {
      method: "DELETE",
    }
  );
}

// ==========================================
// RECURRING TRANSACTION APIs
// ==========================================

export async function getRecurringTransactions(
  userId: number
) {
  return apiRequest<{
    success: boolean;
    recurringTransactions: RecurringTransaction[];
  }>(`/api/recurring-transactions?userId=${userId}`);
}

export async function createRecurringTransaction(data: {
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  frequency: "WEEKLY" | "MONTHLY";
  startDate: string;
  endDate?: string;
  userId: number;
}) {
  return apiRequest("/api/recurring-transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRecurringStatus(
  id: number,
  userId: number,
  isActive: boolean
) {
  return apiRequest(
    `/api/recurring-transactions/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        userId,
        isActive,
      }),
    }
  );
}

export async function deleteRecurringTransaction(
  id: number,
  userId: number
) {
  return apiRequest(
    `/api/recurring-transactions/${id}?userId=${userId}`,
    {
      method: "DELETE",
    }
  );
}
