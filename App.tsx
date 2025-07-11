
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import type { AppContextType, Transaction, Goal, Budget, Debt, UserSettings, Category, Subscription, FinancialHealthScore, FinancialHealthTips } from './types';
import { TransactionType } from './types';
import { services } from './services';
import { 
    AuthPage, 
    DashboardPage, 
    TransactionsListPage, 
    CategoriesPage,
    GoalsListPage, 
    BudgetPage,
    ReportsPage,
    DebtsListPage,
    SettingsPage,
    FinancialPlannerPage,
    SubscriptionsPage,
    UserGuidePage,
    Spinner,
    Icon
} from './components';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './constants';
import { AppContext } from './context';

// Main Layout Component
const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { logout, toggleTheme, theme, settings } = useContext(AppContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const pageTitles: { [key: string]: string } = {
        '/': 'لوحة التحكم',
        '/transactions': 'المعاملات',
        '/categories': 'الفئات',
        '/goals': 'الأهداف',
        '/budget': 'الميزانية',
        '/subscriptions': 'الاشتراكات',
        '/reports': 'التقارير',
        '/debts': 'الديون',
        '/planner': 'المخطط المالي',
        '/guide': 'دليل الاستخدام',
        '/settings': 'الإعدادات',
    };

    const navLinks = [
        { path: '/', icon: 'dashboard', label: 'لوحة التحكم' },
        { path: '/transactions', icon: 'transactions', label: 'المعاملات' },
        { path: '/categories', icon: 'bookmark', label: 'الفئات' },
        { path: '/goals', icon: 'goals', label: 'الأهداف' },
        { path: '/budget', icon: 'budget', label: 'الميزانية' },
        { path: '/subscriptions', icon: 'subscriptions', label: 'الاشتراكات' },
        { path: '/reports', icon: 'reports', label: 'التقارير' },
        { path: '/debts', icon: 'debts', label: 'الديون' },
        { path: '/planner', icon: 'lightbulb', label: 'المخطط المالي' },
        { path: '/guide', icon: 'book-open', label: 'دليل الاستخدام' },
        { path: '/settings', icon: 'settings', label: 'الإعدادات' },
    ];
    
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    const Sidebar = () => (
         <aside className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-xl z-40 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 border-l border-gray-200 dark:border-gray-800`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">حسابنا</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">أهلاً بك، {settings.name}</p>
            </div>
            <nav className="mt-4 flex flex-col justify-between h-[calc(100%-95px)]">
                <div className="space-y-2 px-2">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-base transition-colors ${isActive ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}
                        >
                            <Icon name={link.icon} className="w-6 h-6" />
                            {link.label}
                        </NavLink>
                    ))}
                </div>
                <div className="p-2">
                     <button onClick={logout} className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-base text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800">
                        <Icon name="logout" className="w-6 h-6" />
                        تسجيل الخروج
                    </button>
                </div>
            </nav>
        </aside>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar />
             <div className="flex-1 lg:mr-64 transition-all duration-300">
                <header className="sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm z-30 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 dark:text-gray-300">
                        <Icon name="menu" className="w-6 h-6"/>
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl md:text-2xl font-bold hidden sm:block text-gray-800 dark:text-gray-200">{pageTitles[location.pathname] || 'حسابنا'}</h1>
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                           {theme === 'light' ? <Icon name="moon" className="w-5 h-5" /> : <Icon name="sun" className="w-5 h-5" />}
                        </button>
                    </div>
                </header>
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

// Main App Component
export const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isDbReady, setIsDbReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [settings, setSettings] = useState<UserSettings>({ name: '', email: '', monthlyIncome: 0, theme: 'light', autoLockMinutes: 15 });
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    // Theme Management
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        setSettings(s => ({...s, theme}));
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(t => t === 'light' ? 'dark' : 'light');
    };

    // Online/Offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const logout = useCallback(() => setIsAuthenticated(false), []);

    // Auto-lock timer logic
    useEffect(() => {
        let lockTimer: number;

        const resetTimer = () => {
            clearTimeout(lockTimer);
            if (isAuthenticated && settings.autoLockMinutes > 0) {
                lockTimer = window.setTimeout(() => {
                    logout();
                }, settings.autoLockMinutes * 60 * 1000);
            }
        };

        if (isAuthenticated && settings.autoLockMinutes > 0) {
            const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
            events.forEach(event => window.addEventListener(event, resetTimer));
            resetTimer(); // Start the timer initially
        
            return () => {
                clearTimeout(lockTimer);
                events.forEach(event => window.removeEventListener(event, resetTimer));
            };
        }
    }, [isAuthenticated, settings.autoLockMinutes, logout]);

    const loadAllData = useCallback(async (forceReload = false) => {
        setIsLoading(true);
        const [txns, loadedGoals, loadedBudgets, loadedDebts, loadedSettings, loadedCategoriesFromDb, loadedSubscriptions] = await Promise.all([
            services.db.getTransactions(),
            services.db.getGoals(),
            services.db.getBudgets(),
            services.db.getDebts(),
            services.db.getSettings(),
            services.db.getCategories(),
            services.db.getSubscriptions(),
        ]);

        let finalCategories = loadedCategoriesFromDb;

        if (finalCategories.length === 0 && !forceReload) {
            // First run, seed default categories
            const defaultExpenseCategories = EXPENSE_CATEGORIES.map((name, index) => ({ id: services.utils.uuid(), name, type: TransactionType.EXPENSE, isDefault: true, order: index }));
            const defaultIncomeCategories = INCOME_CATEGORIES.map((name, index) => ({ id: services.utils.uuid(), name, type: TransactionType.INCOME, isDefault: true, order: index }));
            const allDefaultCategories = [...defaultExpenseCategories, ...defaultIncomeCategories];
            
            await services.db.updateCategories(allDefaultCategories);
            // Recurse to load the newly seeded data.
            await loadAllData(true);
            return;
        }

        const migrationNeeded = finalCategories.some(cat => cat.order === undefined);
        if (migrationNeeded) {
            const expenseCats = finalCategories.filter(c => c.type === TransactionType.EXPENSE).sort((a, b) => a.name.localeCompare(b.name));
            const incomeCats = finalCategories.filter(c => c.type === TransactionType.INCOME).sort((a, b) => a.name.localeCompare(b.name));
            
            expenseCats.forEach((cat, index) => cat.order = index);
            incomeCats.forEach((cat, index) => cat.order = index);

            const migratedCategories = [...expenseCats, ...incomeCats];
            await services.db.updateCategories(migratedCategories);
            finalCategories = migratedCategories; // Use migrated data directly
        }

        setTransactions(txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setGoals(loadedGoals);
        setDebts(loadedDebts);
        setSettings(loadedSettings);
        setCategories(finalCategories.sort((a, b) => (a.order || 0) - (b.order || 0)));
        setSubscriptions(loadedSubscriptions);
        setTheme(loadedSettings.theme);

        // Ensure all expense categories have a budget entry
        const expenseCategories = finalCategories.filter(c => c.type === TransactionType.EXPENSE);
        const currentBudgets = [...loadedBudgets];
        expenseCategories.forEach(cat => {
            if(!currentBudgets.find(b => b.category === cat.name)) {
                currentBudgets.push({ category: cat.name, limit: 0 });
            }
        });
        setBudgets(currentBudgets);

        setIsLoading(false);
    }, []);

    useEffect(() => {
        services.initDB().then(() => {
            setIsDbReady(true);
            if(isAuthenticated) {
                loadAllData();
            }
        });
    }, [isAuthenticated, loadAllData]);
    
    // --- CONTEXT ACTIONS ---
    const login = async (password: string) => {
        const success = await services.auth.verifyPassword(password);
        if (success) {
            setIsAuthenticated(true);
        }
        return success;
    };
    const setPassword = async (password: string) => {
        await services.auth.setPassword(password);
        setIsAuthenticated(true);
    };
    const hasPassword = async () => services.auth.hasPassword();
    const changePassword = async (oldPassword: string, newPassword: string) => {
        return await services.auth.changePassword(oldPassword, newPassword);
    };

    // Data Actions
    const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
        const newTx = { ...tx, id: services.utils.uuid() };
        await services.db.addTransaction(newTx);
        await loadAllData();
    };
    
    const updateTransaction = async (tx: Transaction) => {
        const oldTx = transactions.find(t => t.id === tx.id);
        if (!oldTx) return;

        // Prevent changing amount of linked transactions directly.
        // Links should be managed through their respective pages (Goals, Debts, Subscriptions).
        const isLinked = oldTx.goalId || oldTx.debtId || oldTx.subscriptionId;
        const amountChanged = tx.amount !== oldTx.amount;
        if(isLinked && amountChanged) {
             alert('لا يمكن تغيير مبلغ معاملة مرتبطة مباشرةً. يرجى استخدام صفحة الأهداف أو الديون أو الاشتراكات.');
             return;
        }

        await services.db.updateTransaction(tx);
        await loadAllData();
    };
    
    const deleteTransaction = async (id: string) => {
        const txToDelete = transactions.find(t => t.id === id);
        if (!txToDelete) return;
        
        // Deleting a linked transaction should be done with care.
        // The current approach is to just delete the transaction without rolling back the parent state
        // to avoid unintended complexity. The user can manage the parent object (goal, debt, sub) manually if needed.
        if (txToDelete.goalId) {
            const goal = goals.find(g => g.id === txToDelete.goalId);
            if (goal) {
                const updatedGoal = { ...goal, currentAmount: Math.max(0, goal.currentAmount - txToDelete.amount) };
                await services.db.updateGoal(updatedGoal);
            }
        }
        if (txToDelete.debtId) {
             console.warn("Deleting a debt payment transaction. The debt's remaining amount is NOT automatically adjusted to prevent complexity.");
        }
        if (txToDelete.subscriptionId) {
             console.warn("Deleting a subscription payment transaction. The subscription's next payment date is NOT automatically adjusted.");
        }

        await services.db.deleteTransaction(id);
        await loadAllData();
    };

    // Category Actions
    const addCategory = async (category: Omit<Category, 'id' | 'isDefault' | 'order'>) => {
        const maxOrder = categories
            .filter(c => c.type === category.type)
            .reduce((max, c) => Math.max(max, c.order || -1), -1);
            
        const newCategory: Category = { ...category, id: services.utils.uuid(), isDefault: false, order: maxOrder + 1 };
        await services.db.addCategory(newCategory);
        await loadAllData();
    };
    const updateCategory = async (category: Category) => {
        const oldCategory = categories.find(c => c.id === category.id);
        if (!oldCategory || oldCategory.isDefault) return;

        // Update the category itself
        await services.db.updateCategory(category);
        
        // If name changed, update all transactions using it
        if (oldCategory.name !== category.name) {
            const allTransactions = await services.db.getTransactions();
            const transactionsToUpdate = allTransactions.filter(t => t.category === oldCategory.name && t.type === oldCategory.type);
            
            if (transactionsToUpdate.length > 0) {
                const db = await services.initDB();
                const tx = db.transaction('transactions', 'readwrite');
                await Promise.all(transactionsToUpdate.map(t => {
                    const updatedTx = { ...t, category: category.name };
                    return tx.store.put(updatedTx);
                }));
                await tx.done;
            }
        }
        await loadAllData();
    };

    const deleteCategory = async (id: string) => {
        const categoryToDelete = categories.find(c => c.id === id);
        if (!categoryToDelete || categoryToDelete.isDefault) return;

        const otherCategoryName = 'أخرى';
        const allTransactions = await services.db.getTransactions();
        const transactionsToUpdate = allTransactions.filter(t => t.category === categoryToDelete.name && t.type === categoryToDelete.type);

        if (transactionsToUpdate.length > 0) {
            const db = await services.initDB();
            const tx = db.transaction('transactions', 'readwrite');
            await Promise.all(transactionsToUpdate.map(t => {
                const updatedTx = { ...t, category: otherCategoryName };
                return tx.store.put(updatedTx);
            }));
            await tx.done;
        }
        
        await services.db.deleteCategory(id);
        await loadAllData();
    };

    const updateCategoryOrder = async (updatedCategories: Category[]) => {
        await services.db.updateCategories(updatedCategories);
        await loadAllData();
    };

    // Subscription Actions
    const addSubscription = async (sub: Omit<Subscription, 'id'>) => {
        const newSub = { ...sub, id: services.utils.uuid() };
        await services.db.addSubscription(newSub);
        await loadAllData();
    };
    const updateSubscription = async (sub: Subscription) => {
        await services.db.updateSubscription(sub);
        await loadAllData();
    };
    const deleteSubscription = async (id: string) => {
        await services.db.deleteSubscription(id);
        await loadAllData();
    };
    const recordSubscriptionPayment = async (subscriptionId: string) => {
        const sub = subscriptions.find(s => s.id === subscriptionId);
        if (!sub) return;

        // 1. Create a new transaction linked to the subscription
        const newTxPayload: Omit<Transaction, 'id'> = {
            type: TransactionType.EXPENSE,
            amount: sub.amount,
            category: sub.category,
            description: `دفعة اشتراك: ${sub.name}`,
            date: new Date().toISOString(),
            isRecurring: false,
            subscriptionId: sub.id,
        };
        await services.db.addTransaction({ ...newTxPayload, id: services.utils.uuid() });

        // 2. Update the subscription's next payment date
        const nextPaymentDate = new Date(sub.nextPaymentDate);
        if (sub.frequency === 'monthly') {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        } else { // yearly
            nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
        }
        const updatedSub = { ...sub, nextPaymentDate: nextPaymentDate.toISOString() };
        await services.db.updateSubscription(updatedSub);

        // 3. Reload all data to reflect changes
        await loadAllData();
    };


    const addGoal = async (goal: Omit<Goal, 'id' | 'currentAmount' | 'createdAt'>) => {
        const newGoal = { ...goal, id: services.utils.uuid(), currentAmount: 0, createdAt: new Date().toISOString() };
        await services.db.addGoal(newGoal);
        await loadAllData();
    }
    const updateGoal = async (goal: Goal) => {
        await services.db.updateGoal(goal);
        await loadAllData();
    }
    const deleteGoal = async (id: string) => {
        await services.db.deleteGoal(id);
        await loadAllData();
    }
    const addFundsToGoal = async (goalId: string, amount: number) => {
        const goal = goals.find(g => g.id === goalId);
        if(goal) {
            const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };
            await services.db.updateGoal(updatedGoal);
            await addTransaction({
                type: TransactionType.EXPENSE,
                amount,
                category: 'مدخرات واستثمار',
                description: `إضافة رصيد إلى هدف: ${goal.name}`,
                date: new Date().toISOString(),
                isRecurring: false,
                goalId: goalId
            });
            // No need to call loadAllData() here as addTransaction does it
        }
    }
    
    const saveBudgets = async (newBudgets: Budget[]) => {
        await services.db.saveBudgets(newBudgets);
        await loadAllData();
    };

    const addDebt = async (debt: Omit<Debt, 'id' | 'remainingAmount'>) => {
        const newDebt = { ...debt, id: services.utils.uuid(), remainingAmount: debt.totalAmount };
        await services.db.addDebt(newDebt);
        await loadAllData();
    }
    const updateDebt = async (debt: Debt) => {
        await services.db.updateDebt(debt);
        await loadAllData();
    }
    const deleteDebt = async (id: string) => {
        await services.db.deleteDebt(id);
        await loadAllData();
    }
    const recordDebtPayment = async (debtId: string, amount: number) => {
        const debt = debts.find(d => d.id === debtId);
        if(debt) {
            const nextPaymentDate = new Date(debt.nextPaymentDate);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            const updatedDebt = {
                ...debt,
                remainingAmount: debt.remainingAmount - amount,
                nextPaymentDate: nextPaymentDate.toISOString(),
            };
            await services.db.updateDebt(updatedDebt);
            await addTransaction({
                type: TransactionType.EXPENSE,
                amount,
                category: 'ديون وقروض',
                description: `سداد دفعة لدين: ${debt.name}`,
                date: new Date().toISOString(),
                isRecurring: false,
                debtId: debtId,
            });
        }
    }
    
    const confirmRecurringTransaction = async (transactionId: string) => {
        const recurringTx = transactions.find(t => t.id === transactionId);
        if (!recurringTx || !recurringTx.isRecurring) return;

        // 1. Create the new "paid" transaction
        const newPaidTx: Omit<Transaction, 'id'> = {
            type: recurringTx.type,
            amount: recurringTx.amount,
            category: recurringTx.category,
            description: recurringTx.description,
            date: new Date().toISOString(),
            isRecurring: false,
            invoiceImage: recurringTx.invoiceImage,
        };
        await services.db.addTransaction({ ...newPaidTx, id: services.utils.uuid() });
        
        // 2. Calculate next due date for the recurring transaction
        const currentDueDate = new Date(recurringTx.date);
        const recurrence = recurringTx.recurrence || 'monthly';
        switch (recurrence) {
            case 'daily':
                currentDueDate.setDate(currentDueDate.getDate() + 1);
                break;
            case 'weekly':
                currentDueDate.setDate(currentDueDate.getDate() + 7);
                break;
            case 'yearly':
                currentDueDate.setFullYear(currentDueDate.getFullYear() + 1);
                break;
            case 'monthly':
            default:
                currentDueDate.setMonth(currentDueDate.getMonth() + 1);
                break;
        }

        // 3. Update the original recurring transaction with the new date
        const updatedRecurringTx = { ...recurringTx, date: currentDueDate.toISOString() };
        await services.db.updateTransaction(updatedRecurringTx);

        // 4. Reload data
        await loadAllData();
    };
    
    const saveSettings = async (newSettings: UserSettings) => {
        await services.db.saveSettings(newSettings);
        setSettings(newSettings);
        setTheme(newSettings.theme);
    };

    // App Wide actions
    const exportData = () => services.db.exportData();
    
    const wipeData = async () => {
        await services.db.wipeData();
        setIsAuthenticated(false);
    };

    const archiveData = async (startDate: string, endDate: string): Promise<string> => {
        setIsLoading(true);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const allTransactions = await services.db.getTransactions();
        const transactionsToArchive = allTransactions.filter(t => {
            const txDate = new Date(t.date);
            return !t.isRecurring && txDate >= start && txDate <= end;
        });

        if (transactionsToArchive.length === 0) {
            setIsLoading(false);
            return "لا توجد معاملات للأرشفة في النطاق المحدد.";
        }

        const incomeSummary = new Map<string, number>();
        const expenseSummary = new Map<string, number>();

        transactionsToArchive.forEach(tx => {
            if (tx.type === TransactionType.INCOME) {
                incomeSummary.set(tx.category, (incomeSummary.get(tx.category) || 0) + tx.amount);
            } else {
                expenseSummary.set(tx.category, (expenseSummary.get(tx.category) || 0) + tx.amount);
            }
        });
        
        const summaryTxs: Omit<Transaction, 'id'>[] = [];
        const archiveDate = new Date(endDate).toISOString();
        
        incomeSummary.forEach((amount, category) => {
            summaryTxs.push({
                type: TransactionType.INCOME, amount, category,
                description: `ملخص دخل مؤرشف من ${startDate} إلى ${endDate}`,
                date: archiveDate, isRecurring: false,
            });
        });

        expenseSummary.forEach((amount, category) => {
            summaryTxs.push({
                type: TransactionType.EXPENSE, amount, category,
                description: `ملخص مصروف مؤرشف من ${startDate} إلى ${endDate}`,
                date: archiveDate, isRecurring: false,
            });
        });

        const db = await services.initDB();
        const txDB = db.transaction('transactions', 'readwrite');
        
        await Promise.all([
            ...summaryTxs.map(t => txDB.store.put({ ...t, id: services.utils.uuid() })),
            ...transactionsToArchive.map(t => txDB.store.delete(t.id))
        ]);
        await txDB.done;

        await loadAllData();
        setIsLoading(false);

        return `تم أرشفة ${transactionsToArchive.length} معاملة بنجاح.`;
    };

    // Gemini actions
    const getCategorySuggestion = (description: string) => services.gemini.getCategorySuggestion(description);
    const getBudgetSuggestion = () => services.gemini.getBudgetSuggestion(transactions);
    const getSpendingAnalysis = () => services.gemini.getSpendingAnalysis(transactions);
    const getFinancialPlan = (query: string) => services.gemini.getFinancialPlan(query, transactions, goals, debts, settings);
    const getEmergencyFundSuggestion = () => services.gemini.getEmergencyFundSuggestion(transactions);
    const getFinancialHealthTips = (score: FinancialHealthScore) => services.gemini.getFinancialHealthTips(score);
    const getSubscriptionSuggestions = () => services.gemini.getSubscriptionSuggestions(transactions);
    const getInvoiceDetailsFromImage = (base64Image: string) => services.gemini.getInvoiceDetailsFromImage(base64Image);

    const contextValue: AppContextType = useMemo(() => ({
        isAuthenticated, transactions, goals, budgets, debts, settings, categories, subscriptions, isLoading, isDbReady, isOnline,
        login, setPassword, logout, hasPassword, changePassword,
        addTransaction, updateTransaction, deleteTransaction,
        addGoal, updateGoal, deleteGoal, addFundsToGoal,
        saveBudgets,
        addDebt, updateDebt, deleteDebt, recordDebtPayment,
        confirmRecurringTransaction,
        saveSettings,
        addCategory, updateCategory, deleteCategory, updateCategoryOrder,
        addSubscription, updateSubscription, deleteSubscription, recordSubscriptionPayment,
        getCategorySuggestion, getBudgetSuggestion, getSpendingAnalysis, getFinancialPlan, getEmergencyFundSuggestion, getFinancialHealthTips, getSubscriptionSuggestions, getInvoiceDetailsFromImage,
        exportData, wipeData, archiveData,
        theme, toggleTheme
    }), [
        isAuthenticated, transactions, goals, budgets, debts, settings, categories, subscriptions, isLoading, isDbReady, isOnline, theme,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        loadAllData, logout
    ]);

    if (!isDbReady) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <Spinner />
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">جاري تجهيز التطبيق...</p>
            </div>
        );
    }
    
    return (
        <AppContext.Provider value={contextValue}>
            { !isAuthenticated ? (
                <AuthPage />
            ) : (
                <HashRouter>
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/transactions" element={<TransactionsListPage />} />
                            <Route path="/categories" element={<CategoriesPage />} />
                            <Route path="/goals" element={<GoalsListPage />} />
                            <Route path="/budget" element={<BudgetPage />} />
                            <Route path="/subscriptions" element={<SubscriptionsPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/debts" element={<DebtsListPage />} />
                            <Route path="/planner" element={<FinancialPlannerPage />} />
                            <Route path="/guide" element={<UserGuidePage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </MainLayout>
                </HashRouter>
            )}
        </AppContext.Provider>
    );
};
