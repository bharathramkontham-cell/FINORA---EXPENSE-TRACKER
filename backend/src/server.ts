
import express from "express";
import cors from "cors";

import { prisma } from "./config/prisma.js";
import authRouter from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;


app.use(
  cors({
    origin: [
      "https://finora-expense-tracker-self.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10kb" }));


app.use("/api/auth", authRouter);

// Helper
function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

// ==========================================
// PUBLIC ROUTES
// ==========================================

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to FINORA API",
    status: "Running",
    project: "FINORA",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "FINORA backend is running",
  });
});

app.get("/api/db-check", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "PostgreSQL connected successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ==========================================
// PHASE 10: SECURE TRANSACTION APIs
// ==========================================

app.use("/api/transactions", authenticateToken);

// GET transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const userId = req.userId!;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
});

// CREATE transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    const userId = req.userId!;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !["INCOME", "EXPENSE"].includes(type) ||
      typeof category !== "string" ||
      !category.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      (date !== undefined && Number.isNaN(new Date(date).getTime()))
    ) {
      res.status(400).json({
        message: "Please provide valid transaction details",
      });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: title.trim(),
        amount: Number(amount),
        type,
        category: category.trim(),
        user: {
          connect: { id: userId },
        },
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create transaction",
    });
  }
});

// UPDATE transaction
app.put("/api/transactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId!;

    const { title, amount, type, category } = req.body;
    const parsedAmount = Number(amount);

    if (
      !isPositiveInteger(id) ||
      typeof title !== "string" ||
      !title.trim() ||
      !["INCOME", "EXPENSE"].includes(type) ||
      typeof category !== "string" ||
      !category.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide valid transaction details",
      });
      return;
    }

    const existingTransaction =
      await prisma.transaction.findFirst({
        where: { id, userId },
      });

    if (!existingTransaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    const updatedTransaction =
      await prisma.transaction.update({
        where: { id },
        data: {
          title: title.trim(),
          amount: parsedAmount,
          type,
          category: category.trim(),
        },
      });

    res.json({
      success: true,
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
});

// DELETE transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId!;

    if (!isPositiveInteger(id)) {
      res.status(400).json({
        message: "Invalid transaction ID",
      });
      return;
    }

    const result = await prisma.transaction.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      res.status(404).json({
        message: "Transaction not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete transaction",
    });
  }
});

// ==========================================
// SECURE DASHBOARD SUMMARY
// ==========================================

app.use("/api/summary", authenticateToken);

app.get("/api/summary", async (req, res) => {
  try {
    const userId = req.userId!;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    res.json({
      success: true,
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error("Summary API error:", error);

    res.status(500).json({
      message: "Failed to load summary",
    });
  }
});

// ==========================================
// PHASE 10: SECURE MONTHLY BUDGET APIs
// ==========================================

app.use("/api/budgets", authenticateToken);

// GET budgets
app.get("/api/budgets", async (req, res) => {
  try {
    const userId = req.userId!;
    const now = new Date();

    const month =
      req.query.month === undefined
        ? now.getMonth() + 1
        : Number(req.query.month);

    const year =
      req.query.year === undefined
        ? now.getFullYear()
        : Number(req.query.year);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      res.status(400).json({
        message: "Valid month and year are required",
      });
      return;
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      orderBy: {
        category: "asc",
      },
    });

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const categories = budgets.map((budget) => budget.category);

    const expenses =
      categories.length > 0
        ? await prisma.transaction.findMany({
            where: {
              userId,
              type: "EXPENSE",
              category: {
                in: categories,
              },
              date: {
                gte: startDate,
                lt: endDate,
              },
            },
          })
        : [];

    const budgetResults = budgets.map((budget) => {
      const spent = expenses
        .filter((expense) => expense.category === budget.category)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

      const amount = Number(budget.amount);
      const remaining = amount - spent;
      const percentage = amount > 0 ? (spent / amount) * 100 : 0;

      return {
        id: budget.id,
        category: budget.category,
        amount,
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        month: budget.month,
        year: budget.year,
        status:
          percentage >= 100
            ? "EXCEEDED"
            : percentage >= 80
              ? "WARNING"
              : "GOOD",
      };
    });

    res.json({
      success: true,
      month,
      year,
      budgets: budgetResults,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    res.status(500).json({
      message: "Failed to fetch budgets",
    });
  }
});

// CREATE or update category budget
app.post("/api/budgets", async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const userId = req.userId!;
    const parsedAmount = Number(amount);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (
      typeof category !== "string" ||
      !category.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !Number.isInteger(parsedMonth) ||
      parsedMonth < 1 ||
      parsedMonth > 12 ||
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000 ||
      parsedYear > 2100
    ) {
      res.status(400).json({
        message: "Please provide valid budget details",
      });
      return;
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category: category.trim(),
          month: parsedMonth,
          year: parsedYear,
        },
      },
      update: {
        amount: parsedAmount,
      },
      create: {
        category: category.trim(),
        amount: parsedAmount,
        month: parsedMonth,
        year: parsedYear,
        user: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Budget saved successfully",
      budget: {
        ...budget,
        amount: Number(budget.amount),
      },
    });
  } catch (error) {
    console.error("Create budget error:", error);

    res.status(500).json({
      message: "Failed to save budget",
    });
  }
});

// UPDATE budget
app.put("/api/budgets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId!;
    const amount = Number(req.body.amount);
    const category = req.body.category;

    if (
      !isPositiveInteger(id) ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      (category !== undefined &&
        (typeof category !== "string" || !category.trim()))
    ) {
      res.status(400).json({
        message: "Please provide valid budget details",
      });
      return;
    }

    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existingBudget) {
      res.status(404).json({
        message: "Budget not found",
      });
      return;
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        amount,
        ...(category !== undefined
          ? { category: category.trim() }
          : {}),
      },
    });

    res.json({
      success: true,
      message: "Budget updated successfully",
      budget: {
        ...updatedBudget,
        amount: Number(updatedBudget.amount),
      },
    });
  } catch (error) {
    console.error("Update budget error:", error);

    res.status(409).json({
      message:
        "Failed to update budget. Check whether this category already has a budget for the month.",
    });
  }
});

// DELETE budget
app.delete("/api/budgets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId!;

    if (!isPositiveInteger(id)) {
      res.status(400).json({
        message: "Invalid budget ID",
      });
      return;
    }

    const result = await prisma.budget.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      res.status(404).json({
        message: "Budget not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    res.status(500).json({
      message: "Failed to delete budget",
    });
  }
});

// ==========================================
// PHASE 10: RECURRING TRANSACTION APIs
// ==========================================

// Calculate next scheduled date
function getNextRecurringDate(
  currentDate: Date,
  frequency: "WEEKLY" | "MONTHLY"
) {
  const nextDate = new Date(currentDate);

  if (frequency === "WEEKLY") {
    nextDate.setDate(nextDate.getDate() + 7);
    return nextDate;
  }

  const originalDay = currentDate.getDate();

  nextDate.setDate(1);
  nextDate.setMonth(nextDate.getMonth() + 1);

  const lastDayOfMonth = new Date(
    nextDate.getFullYear(),
    nextDate.getMonth() + 1,
    0
  ).getDate();

  nextDate.setDate(Math.min(originalDay, lastDayOfMonth));

  return nextDate;
}

// Process due recurring transactions
let processingRecurring = false;

async function processDueRecurringTransactions() {
  if (processingRecurring) return;

  processingRecurring = true;

  try {
    const now = new Date();

    const dueSchedules =
      await prisma.recurringTransaction.findMany({
        where: {
          isActive: true,
          nextRunAt: {
            lte: now,
          },
        },
        orderBy: {
          nextRunAt: "asc",
        },
      });

    for (const schedule of dueSchedules) {
      let nextRunAt = new Date(schedule.nextRunAt);

      for (let count = 0; count < 500 && nextRunAt <= now; count++) {
        const scheduledDate = new Date(nextRunAt);

        if (
          schedule.endDate &&
          scheduledDate > schedule.endDate
        ) {
          await prisma.recurringTransaction.update({
            where: { id: schedule.id },
            data: { isActive: false },
          });

          break;
        }

        const followingDate = getNextRecurringDate(
          scheduledDate,
          schedule.frequency as "WEEKLY" | "MONTHLY"
        );

        await prisma.$transaction(async (tx) => {
          await tx.transaction.create({
            data: {
              title: schedule.title,
              amount: schedule.amount,
              type: schedule.type,
              category: schedule.category,
              description: schedule.description,
              date: scheduledDate,
              userId: schedule.userId,
            },
          });

          await tx.recurringTransaction.update({
            where: { id: schedule.id },
            data: {
              lastRunAt: scheduledDate,
              nextRunAt: followingDate,
              ...(schedule.endDate &&
              followingDate > schedule.endDate
                ? { isActive: false }
                : {}),
            },
          });
        });

        nextRunAt = followingDate;

        if (
          schedule.endDate &&
          followingDate > schedule.endDate
        ) {
          break;
        }
      }
    }
  } catch (error) {
    console.error(
      "Process recurring transactions error:",
      error
    );
  } finally {
    processingRecurring = false;
  }
}
app.use("/api/recurring-transactions", authenticateToken);

// CREATE recurring transaction
app.post("/api/recurring-transactions", async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      description,
      frequency,
      startDate,
      endDate,
    } = req.body;

    const userId = req.userId!;
    const parsedAmount = Number(amount);
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !["INCOME", "EXPENSE"].includes(type) ||
      !["WEEKLY", "MONTHLY"].includes(frequency) ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !isPositiveInteger(userId) ||
      !startDate ||
      Number.isNaN(parsedStartDate.getTime()) ||
      (endDate &&
        (parsedEndDate === null ||
          Number.isNaN(parsedEndDate.getTime()) ||
          parsedEndDate < parsedStartDate)) ||
      (category !== undefined &&
        category !== null &&
        typeof category !== "string")
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide valid recurring transaction details",
      });
      return;
    }

    const recurringTransaction =
      await prisma.recurringTransaction.create({
        data: {
          title: title.trim(),
          amount: parsedAmount,
          type,
          category:
            typeof category === "string"
              ? category.trim()
              : null,
          description:
            typeof description === "string"
              ? description.trim()
              : null,
          frequency,
          startDate: parsedStartDate,
          nextRunAt: parsedStartDate,
          endDate: parsedEndDate,
          user: {
            connect: { id: userId },
          },
        },
      });

    res.status(201).json({
      success: true,
      message: "Recurring transaction created successfully",
      recurringTransaction: {
        ...recurringTransaction,
        amount: Number(recurringTransaction.amount),
      },
    });
  } catch (error) {
    console.error("Create recurring transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create recurring transaction",
    });
  }
});

// GET recurring transactions
app.get("/api/recurring-transactions", async (req, res) => {
  try {
  const userId = req.userId!;

    await processDueRecurringTransactions();

    const recurringTransactions =
      await prisma.recurringTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

    res.json({
      success: true,
      recurringTransactions: recurringTransactions.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
    });
  } catch (error) {
    console.error("Get recurring transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recurring transactions",
    });
  }
});

// PAUSE or RESUME recurring transaction
app.patch(
  "/api/recurring-transactions/:id/status",
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const userId = req.userId!;
      const { isActive } = req.body;

      if (
        !isPositiveInteger(id) ||
        
        typeof isActive !== "boolean"
      ) {
        res.status(400).json({
          success: false,
          message: "Valid ID, userId, and status are required",
        });
        return;
      }

      const existing =
        await prisma.recurringTransaction.findFirst({
          where: { id, userId },
        });

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Recurring transaction not found",
        });
        return;
      }

      const updated =
        await prisma.recurringTransaction.update({
          where: { id },
          data: { isActive },
        });

      res.json({
        success: true,
        message: isActive
          ? "Recurring transaction resumed"
          : "Recurring transaction paused",
        recurringTransaction: {
          ...updated,
          amount: Number(updated.amount),
        },
      });
    } catch (error) {
      console.error("Update recurring status error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update recurring transaction",
      });
    }
  }
);


// DELETE recurring transaction
app.delete(
  "/api/recurring-transactions/:id",
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      // Always use the authenticated user's ID
      const userId = req.userId!;

      if (!isPositiveInteger(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid recurring transaction ID",
        });
        return;
      }

      const result =
        await prisma.recurringTransaction.deleteMany({
          where: {
            id,
            userId,
          },
        });

      if (result.count === 0) {
        res.status(404).json({
          success: false,
          message: "Recurring transaction not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Recurring transaction deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete recurring transaction error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete recurring transaction",
      });
    }
  }
);


// Process recurring transactions every minute
void processDueRecurringTransactions();

setInterval(() => {
  void processDueRecurringTransactions();
}, 60 * 1000);

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FINORA backend running on port ${PORT}`);
});
