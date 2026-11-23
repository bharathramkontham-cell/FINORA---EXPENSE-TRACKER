
# FINORA — Personal Finance & Expense Tracker

<p align="center">
  <strong>Take control of your money. Make every decision count.</strong>
</p>

FINORA is a modern personal finance and expense management application designed to help users track income and expenses, manage budgets, monitor recurring transactions, and understand their spending habits through an elegant dashboard.

## Overview

Managing personal finances can be difficult without the right tools. FINORA brings essential money-management features together in one place, with a clean interface and useful financial insights.

## Features

- **Secure Authentication** — User registration, login, logout, and JWT-based authentication.
- **Dashboard** — View important financial information in one place.
- **Transaction Management** — Add, edit, delete, and track income and expenses.
- **Budget Management** — Create and monitor monthly spending budgets.
- **Recurring Transactions** — Manage regular income and expenses.
- **Financial Analytics** — Visualize spending patterns and monthly comparisons.
- **Category Analytics** — Understand where your money goes.
- **Financial Health Score** — Get an overview of your financial habits.
- **Smart Insights** — Discover useful observations about your spending.
- **CSV Export** — Export transaction records for further analysis.
- **Responsive Interface** — A modern dashboard designed for a smooth user experience.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| API | REST API |
| Version Control | Git and GitHub |

## Project Structure

```text
FINORA/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.ts
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── Auth.tsx
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

## Getting Started

Follow these steps to run FINORA locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/bharathramkontham-cell/FINORA---EXPENSE-TRACKER.git
cd FINORA---EXPENSE-TRACKER
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and configure:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/finora"
JWT_SECRET="your_long_random_secret"
PORT=5000
```

Replace the database username and password with your PostgreSQL credentials.

Run the database migrations:

```bash
npx prisma migrate dev
```

Start the backend development server:

```bash
npm run dev
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Security

- Passwords are hashed before being stored.
- JWT authentication protects private API routes.
- User-specific data is restricted to the authenticated account.
- Environment variables are used for sensitive configuration.
- Secret credentials should never be committed to GitHub.

## Future Enhancements

- AI-powered personalized financial recommendations.
- Advanced savings goals and financial planning.
- Enhanced data visualizations.
- Financial report generation.
- Cloud deployment and production monitoring.

## Project Status

**Active Development**

FINORA is being developed as a full-stack personal finance management project, with a focus on secure authentication, practical financial features, and a polished user experience.

## Author

**Bharath Ram**

GitHub: [@bharathramkontham-cell](https://github.com/bharathramkontham-cell)

---

<p align="center">
  <strong>FINORA — Your Money. Your Clarity. Your Control.</strong>
</p>
