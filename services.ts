
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { IDBPDatabase, DBSchema } from 'idb';
import { openDB } from 'idb';
import { TransactionType, type Transaction, type Goal, type Budget, type Debt, type UserSettings, type Category, type FinancialPlanResponse, type EmergencyFundSuggestion, type FinancialHealthScore, type FinancialHealthTips, type Subscription, type InvoiceDetails } from './types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './constants';

// --- DATABASE (IndexedDB) SETUP ---

const DB_NAME = 'HesabnaDB';
const DB_VERSION = 2; // Incremented version for new object store

interface HesabnaDBSchema extends DBSchema {
  transactions: { key: string; value: Transaction; };
  goals: { key: string; value: Goal; };
  budgets: { key: string; value: Budget; };
  debts: { key: string; value: Debt; };
  categories: { key: string; value: Category; };
  subscriptions: { key: string; value: Subscription; };
  appState: { key: string; value: any; };
}

let db: IDBPDatabase<HesabnaDBSchema>;

async function initDB() {
  if (db) return db;
  db = await openDB<HesabnaDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion) {
      if (!database.objectStoreNames.contains('transactions')) {
        database.createObjectStore('transactions', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('goals')) {
        database.createObjectStore('goals', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('budgets')) {
        database.createObjectStore('budgets', { keyPath: 'category' });
      }
       if (!database.objectStoreNames.contains('debts')) {
        database.createObjectStore('debts', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('categories')) {
        database.createObjectStore('categories', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('appState')) {
        database.createObjectStore('appState');
      }
      if (oldVersion < 2 && !database.objectStoreNames.contains('subscriptions')) {
        database.createObjectStore('subscriptions', { keyPath: 'id' });
      }
    },
  });
  return db;
}

// --- UTILITY FUNCTIONS ---

export const utils = {
  uuid: () => self.crypto.randomUUID(),
  hashPassword: async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('ar-MA', { style: 'currency', currency: 'MAD' }).format(amount);
  },
  formatDate: (isoString: string) => {
    return new Date(isoString).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' });
  }
};

// --- AUTHENTICATION SERVICES ---

export const authService = {
  setPassword: async (password: string) => {
    const db = await initDB();
    const hashedPassword = await utils.hashPassword(password);
    await db.put('appState', hashedPassword, 'passwordHash');
  },
  verifyPassword: async (password: string) => {
    const db = await initDB();
    const hashedPassword = await db.get('appState', 'passwordHash');
    if (!hashedPassword) return false;
    const inputHash = await utils.hashPassword(password);
    return inputHash === hashedPassword;
  },
  hasPassword: async () => {
    const db = await initDB();
    const storedHash = await db.get('appState', 'passwordHash');
    return !!storedHash;
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<{success: boolean; message: string;}> => {
    const db = await initDB();
    const hashedPassword = await db.get('appState', 'passwordHash');
    if (!hashedPassword) {
        return { success: false, message: 'لا توجد كلمة مرور معينة.' };
    }
    const inputHash = await utils.hashPassword(oldPassword);
    if (inputHash !== hashedPassword) {
        return { success: false, message: 'كلمة المرور القديمة غير صحيحة.' };
    }
    const newHashedPassword = await utils.hashPassword(newPassword);
    await db.put('appState', newHashedPassword, 'passwordHash');
    return { success: true, message: 'تم تغيير كلمة المرور بنجاح.' };
  },
};

// --- DATA CRUD SERVICES ---

export const dbService = {
  // Transactions
  getTransactions: async () => (await initDB()).getAll('transactions'),
  addTransaction: async (tx: Transaction) => (await initDB()).put('transactions', tx),
  updateTransaction: async (tx: Transaction) => (await initDB()).put('transactions', tx),
  deleteTransaction: async (id: string) => (await initDB()).delete('transactions', id),
  
  // Categories
  getCategories: async () => (await initDB()).getAll('categories'),
  addCategory: async (category: Category) => (await initDB()).put('categories', category),
  updateCategory: async (category: Category) => (await initDB()).put('categories', category),
  deleteCategory: async (id: string) => (await initDB()).delete('categories', id),
  updateCategories: async (categories: Category[]) => {
    const db = await initDB();
    const tx = db.transaction('categories', 'readwrite');
    await Promise.all(categories.map(c => tx.store.put(c)));
    await tx.done;
  },

  // Subscriptions
  getSubscriptions: async () => (await initDB()).getAll('subscriptions'),
  addSubscription: async (sub: Subscription) => (await initDB()).put('subscriptions', sub),
  updateSubscription: async (sub: Subscription) => (await initDB()).put('subscriptions', sub),
  deleteSubscription: async (id: string) => (await initDB()).delete('subscriptions', id),

  // Goals
  getGoals: async () => (await initDB()).getAll('goals'),
  addGoal: async (goal: Goal) => (await initDB()).put('goals', goal),
  updateGoal: async (goal: Goal) => (await initDB()).put('goals', goal),
  deleteGoal: async (id: string) => (await initDB()).delete('goals', id),
  
  // Budgets
  getBudgets: async () => (await initDB()).getAll('budgets'),
  saveBudgets: async (budgets: Budget[]) => {
    const db = await initDB();
    const tx = db.transaction('budgets', 'readwrite');
    await Promise.all(budgets.map(b => tx.store.put(b)));
    await tx.done;
  },

  // Debts
  getDebts: async () => (await initDB()).getAll('debts'),
  addDebt: async (debt: Debt) => (await initDB()).put('debts', debt),
  updateDebt: async (debt: Debt) => (await initDB()).put('debts', debt),
  deleteDebt: async (id: string) => (await initDB()).delete('debts', id),

  // Settings
  getSettings: async () => {
      const db = await initDB();
      const settings = await db.get('appState', 'userSettings');
      const defaults: UserSettings = {
        name: 'مستخدم جديد',
        email: '',
        monthlyIncome: 5000,
        theme: 'light',
        autoLockMinutes: 15,
      };
      return { ...defaults, ...settings };
  },
  saveSettings: async (settings: UserSettings) => {
      const db = await initDB();
      await db.put('appState', settings, 'userSettings');
  },

  // Data Management
  exportData: async () => {
      const txns = await dbService.getTransactions();
      if (txns.length === 0) {
        alert('لا توجد بيانات لتصديرها.');
        return;
      }
      const header = Object.keys(txns[0]).join(',');
      const rows = txns.map(row => Object.values(row).join(',')).join('\n');
      const csvContent = `data:text/csv;charset=utf-8,${header}\n${rows}`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hesabna_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  },
  wipeData: async () => {
    const db = await initDB();
    await Promise.all([
        db.clear('transactions'),
        db.clear('goals'),
        db.clear('budgets'),
        db.clear('debts'),
        db.clear('categories'),
        db.clear('subscriptions'),
        db.clear('appState'),
    ]);
  }
};

// --- GEMINI API SERVICES ---

let ai: GoogleGenAI | null = null;

function getAi() {
    if (!ai) {
        if (process.env.API_KEY) {
            ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
            console.error("API_KEY is not set.");
            return null;
        }
    }
    return ai;
}

export const geminiService = {
  getCategorySuggestion: async (description: string): Promise<string> => {
    if (!navigator.onLine) return '';
    const ai = getAi();
    if (!ai) return '';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following transaction description, suggest the most appropriate category. Description: "${description}". Choose from this list: ${EXPENSE_CATEGORIES.join(', ')}, ${INCOME_CATEGORIES.join(', ')}. Respond with ONLY the category name in Arabic.`,
        config: { temperature: 0 }
      });
      return response.text.trim();
    } catch (error) {
      console.error("Error getting category suggestion:", error);
      return '';
    }
  },
  getBudgetSuggestion: async (transactions: Transaction[]): Promise<Budget[]> => {
    if (!navigator.onLine) return [];
    const ai = getAi();
    if (!ai || transactions.length === 0) return [];
    
    try {
        const prompt = `
            Analyze the following list of transactions from the last 3 months and suggest a reasonable monthly budget for each expense category.
            Transactions: ${JSON.stringify(transactions.filter(t => t.type === 'expense'))}.
            Return the result as a JSON array of objects, where each object has "category" (string in Arabic) and "limit" (number).
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            limit: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error getting budget suggestion:", error);
        return [];
    }
  },
  getSpendingAnalysis: async (transactions: Transaction[]): Promise<string> => {
    if (!navigator.onLine) return 'أنت غير متصل بالإنترنت. هذه الميزة تتطلب اتصالاً بالشبكة.';
    const ai = getAi();
    if (!ai || transactions.length === 0) return 'لا توجد بيانات كافية للتحليل.';
    
    try {
        const prompt = `
            Analyze the following expense transactions for a user in Morocco and provide a short, encouraging, and personalized analysis in Arabic. 
            Give actionable tips for improvement.
            Transactions: ${JSON.stringify(transactions.filter(t => t.type === 'expense'))}
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting spending analysis:", error);
        return 'حدث خطأ أثناء تحليل الإنفاق.';
    }
  },
  getFinancialPlan: async (
      query: string,
      transactions: Transaction[],
      goals: Goal[],
      debts: Debt[],
      settings: UserSettings
    ): Promise<FinancialPlanResponse | null> => {
        if (!navigator.onLine) return null;
        const ai = getAi();
        if (!ai) return null;

        const financialData = {
            monthlyIncome: settings.monthlyIncome,
            goals,
            debts,
            transactions_last_3_months: transactions.filter(t => new Date(t.date) > new Date(new Date().setMonth(new Date().getMonth() - 3)))
        };

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `User's financial data: ${JSON.stringify(financialData)}. User's 'what-if' query: "${query}"`,
                config: {
                    systemInstruction: `You are a helpful and insightful financial planner for a user in Morocco. Your name is 'حسابنا الذكي' (Hesabna Smart). 
                    You will be given the user's current financial data and a 'what-if' scenario question. 
                    Your task is to analyze the scenario and provide a clear, actionable, and encouraging response in Arabic. 
                    Do not make up information; base your analysis strictly on the data provided. 
                    Your response must be in JSON format.`,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            analysisTitle: { type: Type.STRING, description: "A short, engaging title for the analysis in Arabic." },
                            summary: { type: Type.STRING, description: "A concise summary of the financial impact in Arabic." },
                            impactPoints: {
                                type: Type.ARRAY,
                                description: "A list of specific, bulleted points detailing the effects on goals, debts, or savings in Arabic.",
                                items: { type: Type.STRING }
                            },
                            recommendations: {
                                type: Type.ARRAY,
                                description: "A list of encouraging recommendations or next steps for the user in Arabic.",
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["analysisTitle", "summary", "impactPoints", "recommendations"]
                    }
                }
            });

            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as FinancialPlanResponse;
        } catch (error) {
            console.error("Error getting financial plan:", error);
            return null;
        }
    },
    getEmergencyFundSuggestion: async (transactions: Transaction[]): Promise<EmergencyFundSuggestion | null> => {
        if (!navigator.onLine) return null;
        const ai = getAi();
        if (!ai) return null;
        
        const expenseTransactions = transactions.filter(t => t.type === 'expense' && new Date(t.date) > new Date(new Date().setMonth(new Date().getMonth() - 3)));
        if (expenseTransactions.length < 5) {
            return null;
        }

        try {
            const prompt = `
                Based on the following expense transactions from the last 3 months for a user in Morocco, identify the essential living expense categories (like rent, bills, food, groceries, transportation).
                Then, calculate the average monthly spending for ONLY these essential categories.
                Finally, provide a target for a 3-month emergency fund and a 6-month emergency fund based on that average.
                Transactions: ${JSON.stringify(expenseTransactions)}
            `;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            essentialCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
                            monthlyAverage: { type: Type.NUMBER },
                            threeMonthTarget: { type: Type.NUMBER },
                            sixMonthTarget: { type: Type.NUMBER }
                        },
                        required: ["essentialCategories", "monthlyAverage", "threeMonthTarget", "sixMonthTarget"]
                    }
                }
            });
            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as EmergencyFundSuggestion;
        } catch (error) {
            console.error("Error getting emergency fund suggestion:", error);
            return null;
        }
    },
    getFinancialHealthTips: async (score: FinancialHealthScore): Promise<FinancialHealthTips | null> => {
        if (!navigator.onLine) return null;
        const ai = getAi();
        if (!ai) return null;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analyze this financial health data for a user in Morocco: ${JSON.stringify(score)}. Provide a short, encouraging summary and one actionable tip in Arabic for each of the four categories (savingsRate, debtToIncome, emergencyFund, incomeDiversity).`,
                config: {
                    systemInstruction: `You are a friendly financial coach. Your response must be in JSON format. Provide concise, positive, and actionable advice in Arabic.`,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING, description: "A very short, encouraging summary of the overall score in Arabic." },
                            savingsRate: { type: Type.STRING, description: "A tip for the savings rate in Arabic." },
                            debtToIncome: { type: Type.STRING, description: "A tip for the debt-to-income ratio in Arabic." },
                            emergencyFund: { type: Type.STRING, description: "A tip for the emergency fund in Arabic." },
                            incomeDiversity: { type: Type.STRING, description: "A tip for income diversity in Arabic." },
                        },
                        required: ["summary", "savingsRate", "debtToIncome", "emergencyFund", "incomeDiversity"]
                    }
                }
            });
            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as FinancialHealthTips;
        } catch (error) {
            console.error("Error getting financial health tips:", error);
            return null;
        }
    },
    getSubscriptionSuggestions: async (transactions: Transaction[]): Promise<Omit<Subscription, 'id'>[]> => {
        if (!navigator.onLine) return [];
        const ai = getAi();
        if (!ai) return [];
        
        // Find recurring transactions from the last few months
        const recurringPattern = transactions.filter(t => {
            const txDate = new Date(t.date);
            return t.type === 'expense' && txDate > new Date(new Date().setMonth(new Date().getMonth() - 3));
        });
        
        if (recurringPattern.length < 3) return [];

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `From the list of transactions, identify potential monthly or yearly subscriptions. Look for repeated merchant names like 'Spotify', 'Netflix', 'Amazon Prime', 'Apple', etc. Transactions: ${JSON.stringify(recurringPattern)}`,
                config: {
                    systemInstruction: `You are an intelligent assistant that detects subscriptions from transaction data. Return a JSON array of objects. Each object should have 'name' (string), 'amount' (number), 'frequency' ('monthly' or 'yearly'), and 'nextPaymentDate' (YYYY-MM-DD string, assumed to be next month from the last transaction). Default frequency to 'monthly'.`,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                amount: { type: Type.NUMBER },
                                frequency: { type: Type.STRING, enum: ['monthly', 'yearly'] },
                                nextPaymentDate: { type: Type.STRING }
                            },
                             required: ["name", "amount", "frequency", "nextPaymentDate"]
                        }
                    }
                }
            });
            const jsonStr = response.text.trim();
            // Add a default category
            const suggestions = JSON.parse(jsonStr) as Omit<Subscription, 'id'|'category'>[];
            return suggestions.map(s => ({...s, category: 'فواتير وخدمات'}));
        } catch (error) {
            console.error("Error getting subscription suggestions:", error);
            return [];
        }
    },
    getInvoiceDetailsFromImage: async (base64Image: string): Promise<InvoiceDetails | null> => {
        if (!navigator.onLine) return null;
        const ai = getAi();
        if (!ai) return null;

        const base64Data = base64Image.split(',')[1];
        const mimeType = base64Image.match(/data:(.*);base64/)?.[1] || 'image/jpeg';
        
        const imagePart = {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };

        const textPart = {
          text: `Analyze this invoice/receipt image. Extract the merchant name, the total amount, the transaction date (in YYYY-MM-DD format), and suggest a suitable expense category from this list: ${EXPENSE_CATEGORIES.join(', ')}. If any field is not found, return an empty string or 0 for the amount.`
        };
        
        try {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            merchantName: { type: Type.STRING, description: "The name of the merchant or store." },
                            amount: { type: Type.NUMBER, description: "The final total amount of the transaction." },
                            transactionDate: { type: Type.STRING, description: "The date of the transaction in YYYY-MM-DD format." },
                            suggestedCategory: { type: Type.STRING, description: "The most appropriate expense category from the provided list." }
                        },
                        required: ["merchantName", "amount", "transactionDate", "suggestedCategory"]
                    }
                }
            });
            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as InvoiceDetails;

        } catch(error) {
            console.error("Error getting invoice details from image:", error);
            return null;
        }
    },
};

// Re-exporting all services for easy import
export const services = {
    initDB,
    auth: authService,
    db: dbService,
    gemini: geminiService,
    utils
};
