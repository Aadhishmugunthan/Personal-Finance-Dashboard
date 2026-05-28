// ============================================================
// LEARN: This is your "data layer" — in a real app this would
// come from an API (fetch/axios). For now we use static data
// so we can focus on the UI patterns without backend complexity.
//
// All amounts are in Indian Rupees (₹).
// ============================================================

// Monthly income vs expenses for the last 6 months
export const monthlyData = [
  { month: "Jan", income: 85000,  expenses: 62000 },
  { month: "Feb", income: 90000,  expenses: 58000 },
  { month: "Mar", income: 78000,  expenses: 71000 },
  { month: "Apr", income: 102000, expenses: 65000 },
  { month: "May", income: 95000,  expenses: 60000 },
  { month: "Jun", income: 110000, expenses: 74000 },
];

// Category breakdown for the Pie chart
export const categoryData = [
  { name: "Housing",   value: 25000, color: "#6366f1" },
  { name: "Food",      value: 14000, color: "#f59e0b" },
  { name: "Transport", value: 6500,  color: "#10b981" },
  { name: "Health",    value: 4200,  color: "#ef4444" },
  { name: "Shopping",  value: 9500,  color: "#8b5cf6" },
  { name: "Utilities", value: 3800,  color: "#06b6d4" },
  { name: "Savings",   value: 11000, color: "#84cc16" },
];

// Recent transactions — initial seed data
// LEARN: We export this as the INITIAL state. The live state
// will live in App.jsx so CRUD operations can mutate it.
export const initialTransactions = [
  { id: 1,  date: "Jun 24", description: "Salary",         category: "Income",    amount: 110000, type: "income"  },
  { id: 2,  date: "Jun 23", description: "Rent",           category: "Housing",   amount: -25000, type: "expense" },
  { id: 3,  date: "Jun 22", description: "Grocery Store",  category: "Food",      amount: -3200,  type: "expense" },
  { id: 4,  date: "Jun 21", description: "Netflix",        category: "Shopping",  amount: -649,   type: "expense" },
  { id: 5,  date: "Jun 20", description: "Freelance Work", category: "Income",    amount: 18000,  type: "income"  },
  { id: 6,  date: "Jun 19", description: "Electric Bill",  category: "Utilities", amount: -1800,  type: "expense" },
  { id: 7,  date: "Jun 18", description: "Gym Membership", category: "Health",    amount: -1500,  type: "expense" },
  { id: 8,  date: "Jun 17", description: "Ola/Uber",       category: "Transport", amount: -450,   type: "expense" },
  { id: 9,  date: "Jun 16", description: "Amazon",         category: "Shopping",  amount: -2200,  type: "expense" },
  { id: 10, date: "Jun 15", description: "Dividend",       category: "Income",    amount: 3500,   type: "income"  },
];

// Summary stats — derived from transactions above
export const summaryStats = {
  totalIncome:   128500,
  totalExpenses: 74000,
  netSavings:    36500,
  savingsRate:   28, // percentage
};

// All valid categories — used in the Add/Edit form dropdown
export const CATEGORIES = [
  "Income",
  "Housing",
  "Food",
  "Transport",
  "Health",
  "Shopping",
  "Utilities",
  "Savings",
];
