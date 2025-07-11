
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
  isRecurring: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  invoiceImage?: string; // base64 encoded image
  goalId?: string; // Link to a goal
  debtId?: string; // Link to a debt
  subscriptionId?: string; // Link to a subscription
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
  order: number;
}

export interface Goal {
  id:string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string; // ISO string
  isEmergencyFund?: boolean;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  nextPaymentDate: string; // ISO string
}

export interface UserSettings {
  name: string;
  email: string;
  monthlyIncome: number;
  theme: 'light' | 'dark';
  autoLockMinutes: number;
}

// New type for Financial Planner
export interface FinancialPlanResponse {
  analysisTitle: string;
  summary: string;
  impactPoints: string[];
  recommendations: string[];
}

// New type for Emergency Fund Suggestion
export interface EmergencyFundSuggestion {
    essentialCategories: string[];
    monthlyAverage: number;
    threeMonthTarget: number;
    sixMonthTarget: number;
}

// New type for Financial Health Score
export interface FinancialHealthScore {
  totalScore: number;
  savingsRate: { score: number; value: number };
  debtToIncome: { score: number; value: number };
  emergencyFund: { score: number; value: number };
  incomeDiversity: { score: number; value: number };
}

export interface FinancialHealthTips {
    savingsRate: string;
    debtToIncome: string;
    emergencyFund: string;
    incomeDiversity: string;
    summary: string;
}

// New type for Subscriptions
export interface Subscription {
    id: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'yearly';
    nextPaymentDate: string; // ISO string
    category: string;
}

// New type for Invoice Details Parsing
export interface InvoiceDetails {
  merchantName: string;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  suggestedCategory: string;
}


// Context type for providing data and actions to components
export interface AppContextType {
  // State
  isAuthenticated: boolean;
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  debts: Debt[];
  settings: UserSettings;
  categories: Category[];
  subscriptions: Subscription[];
  isLoading: boolean;
  isDbReady: boolean;
  isOnline: boolean;
  
  // Actions
  login: (password: string) => Promise<boolean>;
  setPassword: (password: string) => Promise<void>;
  logout: () => void;
  hasPassword: () => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword:string) => Promise<{success: boolean; message: string;}>;
  
  // Data actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'createdAt'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addFundsToGoal: (goalId: string, amount: number) => Promise<void>;

  saveBudgets: (budgets: Budget[]) => Promise<void>;
  
  addDebt: (debt: Omit<Debt, 'id' | 'remainingAmount'>) => Promise<void>;
  updateDebt: (debt: Debt) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  recordDebtPayment: (debtId: string, amount: number) => Promise<void>;
  confirmRecurringTransaction: (transactionId: string) => Promise<void>;
  
  saveSettings: (settings: UserSettings) => Promise<void>;

  addCategory: (category: Omit<Category, 'id' | 'isDefault' | 'order'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategoryOrder: (categories: Category[]) => Promise<void>;

  // Subscription Actions
  addSubscription: (subscription: Omit<Subscription, 'id'>) => Promise<void>;
  updateSubscription: (subscription: Subscription) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  recordSubscriptionPayment: (subscriptionId: string) => Promise<void>;
  
  // Gemini actions
  getCategorySuggestion: (description: string) => Promise<string>;
  getBudgetSuggestion: () => Promise<Budget[]>;
  getSpendingAnalysis: () => Promise<string>;
  getFinancialPlan: (query: string) => Promise<FinancialPlanResponse | null>;
  getEmergencyFundSuggestion: () => Promise<EmergencyFundSuggestion | null>;
  getFinancialHealthTips: (score: FinancialHealthScore) => Promise<FinancialHealthTips | null>;
  getSubscriptionSuggestions: () => Promise<Omit<Subscription, 'id'>[]>;
  getInvoiceDetailsFromImage: (base64Image: string) => Promise<InvoiceDetails | null>;
  
  // App wide actions
  exportData: () => Promise<void>;
  wipeData: () => Promise<void>;
  archiveData: (startDate: string, endDate: string) => Promise<string>;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
