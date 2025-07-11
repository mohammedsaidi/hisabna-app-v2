
import React, { useState, useEffect, useContext, useRef, useMemo, useCallback, ChangeEvent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppContext } from './context';
import { TransactionType, type Transaction, type Budget, type Goal, type Debt, type Category, type FinancialPlanResponse, type EmergencyFundSuggestion, type FinancialHealthScore, type FinancialHealthTips, type Subscription } from './types';
import { services } from './services';


// ===================================================================================
// I. ICONS
// ===================================================================================

export const Icon = ({ name, className }: { name: string, className?: string }) => {
  const icons: { [key: string]: React.ReactNode } = {
    dashboard: <><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>,
    transactions: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    goals: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    budget: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    reports: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    debts: <><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></>,
    subscriptions: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    settings: <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 010 2l-.15.08a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l-.22-.38a2 2 0 00-.73-2.73l-.15-.08a2 2 0 010 2l.15.08a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" /><circle cx="12" cy="12" r="3" />,
    logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />,
    sun: <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m4.93 17.66 1.41-1.41" /><path d="m17.66 4.93 1.41 1.41" />,
    moon: <path d="M12 3a6 6 0 009 9 9 9 0 11-9-9z" />,
    plus: <path d="M5 12h14" /><path d="M12 5v14" />,
    edit: <path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />,
    trash: <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />,
    x: <path d="M18 6L6 18" /><path d="M6 6l12 12" />,
    income: <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />,
    expense: <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />,
    chevronUp: <path d="m18 15-6-6-6-6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    calendar: <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />,
    alert: <path d="m21.73 18-8-14a2 2 0 00-3.46 0l-8 14A2 2 0 004 21h16a2 2 0 001.73-3z" /><path d="M12 9v4" /><path d="M12 17h.01" />,
    check: <path d="M20 6L9 17l-5-5" />,
    info: <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />,
    ai: <path d="M9.5 3A2.5 2.5 0 0112 5.5V7" /><path d="M14.5 3A2.5 2.5 0 0012 5.5V7" /><path d="M12 7v3.52a2.5 2.5 0 01-2.5 2.5h-1A2.5 2.5 0 016 10.52V9" /><path d="M18 9v1.52A2.5 2.5 0 0115.5 13h-1a2.5 2.5 0 01-2.5-2.5V7" /><path d="M12 7h.01" /><path d="M17.5 13A2.5 2.5 0 0115 15.5V17" /><path d="M6.5 13A2.5 2.5 0 009 15.5V17" /><path d="M12 17v3.52a2.5 2.5 0 01-2.5 2.5h-1A2.5 2.5 0 016 20.52V19" /><path d="M18 19v1.52A2.5 2.5 0 0115.5 24h-1a2.5 2.5 0 01-2.5-2.5V17" /><path d="M12 17h.01" />,
    camera: <path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />,
    print: <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><path d="M6 9V3a1 1 0 011-1h10a1 1 0 011 1v6" /><rect x="6" y="14" width="12" height="8" rx="1" />,
    archive: <path d="M21 8v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8" /><path d="M10 12h4" /><path d="M21 3H3v5h18z" />,
    file: <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z" /><path d="M14 2v4a2 2 0 002 2h4" />,
    bookmark: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></>,
    'book-open': <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    menu: <><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></>,
    lightbulb: <><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 009 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    refresh: <><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></>,
    wallet: <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4Z"/></>,
    'trending-up': <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
    'trending-down': <><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};


// ===================================================================================
// II. COMMON UI COMPONENTS
// ===================================================================================

export const Spinner = () => (
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
);

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-800 p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);

type ButtonProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
} & React.ComponentPropsWithoutRef<'button'>;

export const Button = ({ children, variant = 'primary', size = 'md', type = 'button', className = '', ...rest }: ButtonProps) => {
    const baseClasses = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950';
    const sizeClasses = {
        sm: 'px-3 py-1.5 rounded-lg text-sm',
        md: 'px-4 py-2 rounded-xl text-base',
        lg: 'px-6 py-3 rounded-2xl text-lg',
    };
    const variantClasses = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus-visible:ring-gray-400',
        danger: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500',
        ghost: 'bg-transparent text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-gray-800 focus-visible:ring-primary-500',
    };
    return (
        <button type={type} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...rest}>
            {children}
        </button>
    );
};

export const Input = ({ id, name, type = 'text', value, onChange, placeholder, label, required = false, disabled = false }: { id: string, name?: string, type?: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, label?: string, required?: boolean, disabled?: boolean }) => (
    <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
        />
    </div>
);

export const Select = ({ id, name, value, onChange, children, label, disabled = false, required = false }: { id: string, name?: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, label?: string, disabled?: boolean, required?: boolean }) => (
    <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
        >
            {children}
        </select>
    </div>
);


export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icon name="x" className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "تأكيد", cancelText = "إلغاء", confirmVariant = 'primary', showCancelButton = true }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: React.ReactNode, confirmText?: string, cancelText?: string, confirmVariant?: 'primary' | 'danger' | 'success', showCancelButton?: boolean }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative" onClick={e => e.stopPropagation()}>
                <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${confirmVariant === 'danger' ? 'bg-danger-100 dark:bg-danger-900/50' : confirmVariant === 'success' ? 'bg-success-100 dark:bg-success-900/50' : 'bg-primary-100 dark:bg-primary-900/50'} sm:mx-0 sm:h-10 sm:w-10`}>
                        <Icon name={confirmVariant === 'danger' ? 'alert' : confirmVariant === 'success' ? 'check' : 'info'} className={confirmVariant === 'danger' ? 'h-6 w-6 text-danger-600 dark:text-danger-400' : confirmVariant === 'success' ? 'h-6 w-6 text-success-600 dark:text-success-400' : 'h-6 w-6 text-primary-600 dark:text-primary-400'} />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right flex-grow">
                        <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {message}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <Button onClick={onConfirm} variant={confirmVariant} className="w-full sm:w-auto">
                        {confirmText}
                    </Button>
                    {showCancelButton &&
                        <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto mt-3 sm:mt-0">
                            {cancelText}
                        </Button>
                    }
                </div>
            </div>
        </div>
    );
};

export const ProgressBar = ({ value, max, colorClass }: { value: number, max: number, colorClass: string }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
                className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

export const GaugeChart = ({ value, label, size = 150, strokeWidth = 15 }: { value: number, label: string, size?: number, strokeWidth?: number }) => {
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const scoreColor = value >= 70 ? 'text-success-500' : value >= 40 ? 'text-warning-500' : 'text-danger-500';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={center}
                    cy={center}
                />
                <circle
                    className={`${scoreColor} transition-all duration-1000 ease-out`}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={center}
                    cy={center}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${scoreColor}`}>
                <span className="text-4xl font-bold">{Math.round(value)}</span>
                <span className="text-sm font-semibold">{label}</span>
            </div>
        </div>
    );
};


// ===================================================================================
// III. PAGE COMPONENTS
// ===================================================================================

// -----------------------------------------------------------------------------------
// 1. Auth Page
// -----------------------------------------------------------------------------------
export const AuthPage = () => {
    const { login, setPassword, hasPassword, isDbReady } = useContext(AppContext);
    const [password, setPasswordValue] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if(isDbReady) {
            hasPassword().then(exists => {
                setIsNewUser(!exists);
                setIsLoading(false);
            });
        }
    }, [isDbReady, hasPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isNewUser) {
            if (password.length < 8) {
                setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل.');
                setIsLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('كلمتا المرور غير متطابقتين.');
                setIsLoading(false);
                return;
            }
            await setPassword(password);
        } else {
            const success = await login(password);
            if (!success) {
                setError('كلمة المرور غير صحيحة.');
            }
        }
        setIsLoading(false);
    };
    
    if (isLoading && !isDbReady) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <Spinner />
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">جاري تجهيز التطبيق...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 text-center mb-4">حسابنا</h1>
                    <Card className="w-full">
                        <h2 className="text-2xl font-bold text-center mb-2">
                            {isNewUser ? 'إنشاء كلمة مرور' : 'تسجيل الدخول'}
                        </h2>
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                            {isNewUser ? 'بياناتك تُخزن محلياً على جهازك بأمان.' : 'أدخل كلمة المرور للوصول إلى بياناتك.'}
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                id="password"
                                type="password"
                                label="كلمة المرور"
                                value={password}
                                onChange={(e) => setPasswordValue(e.target.value)}
                                required
                            />
                            {isNewUser && (
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    label="تأكيد كلمة المرور"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            )}
                            {error && <p className="text-danger-500 text-sm">{error}</p>}
                            <Button type="submit" variant="primary" disabled={isLoading} className="w-full !py-3">
                                {isLoading ? <Spinner /> : (isNewUser ? 'إنشاء وبدء الاستخدام' : 'دخول')}
                            </Button>
                        </form>
                    </Card>
                </div>
            </main>
            <footer className="text-center text-sm text-gray-500 dark:text-gray-400 pb-4">
                by mohammedsaidi@gmail.com
            </footer>
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 2. Dashboard Page
// -----------------------------------------------------------------------------------
const FinancialHealthDetailsModal = ({ score, tips, onRefresh, isLoading, isOpen, onClose }: { score: FinancialHealthScore, tips: FinancialHealthTips | null, onRefresh: () => void, isLoading: boolean, isOpen: boolean, onClose: () => void }) => {
    
    const metricDetails = [
        { key: 'savingsRate', title: 'معدل الادخار', score: score.savingsRate.score, tip: tips?.savingsRate },
        { key: 'debtToIncome', title: 'نسبة الديون للدخل', score: score.debtToIncome.score, tip: tips?.debtToIncome },
        { key: 'emergencyFund', title: 'صندوق الطوارئ', score: score.emergencyFund.score, tip: tips?.emergencyFund },
        { key: 'incomeDiversity', title: 'تنوع الدخل', score: score.incomeDiversity.score, tip: tips?.incomeDiversity },
    ];
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تفاصيل الصحة المالية">
            <div className="space-y-4">
                <div className="p-3 bg-primary-50 dark:bg-gray-800 rounded-lg text-center">
                    <h3 className="font-bold text-lg text-primary-800 dark:text-primary-200">ملخص سريع</h3>
                    {tips?.summary ? <p>{tips.summary}</p> : <p>جاري تحليل وضعك...</p>}
                </div>

                {metricDetails.map(metric => (
                     <div key={metric.key}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold">{metric.title}</span>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{metric.score} / 25</span>
                        </div>
                        <ProgressBar value={metric.score} max={25} colorClass={metric.score > 15 ? 'bg-success-500' : metric.score > 8 ? 'bg-warning-500' : 'bg-danger-500'} />
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-md text-sm">
                            {isLoading ? <div className="flex items-center gap-2"><Spinner/> <span>جاري إنشاء نصيحة...</span></div> : metric.tip}
                        </div>
                    </div>
                ))}
                
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>إغلاق</Button>
                    <Button onClick={onRefresh} disabled={isLoading}>
                        {isLoading ? <Spinner /> : <Icon name="refresh" />}
                        تحديث النصائح
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


export const DashboardPage = () => {
  const { transactions, goals, budgets, debts, subscriptions, getSpendingAnalysis, confirmRecurringTransaction, recordSubscriptionPayment, isLoading, isOnline, settings, getFinancialHealthTips, getEmergencyFundSuggestion } = useContext(AppContext);
  const [analysis, setAnalysis] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [confirmTxPaymentModal, setConfirmTxPaymentModal] = useState<{isOpen: boolean, tx: Transaction | null}>({ isOpen: false, tx: null });
  const [confirmSubPaymentModal, setConfirmSubPaymentModal] = useState<{isOpen: boolean, sub: Subscription | null}>({ isOpen: false, sub: null });
  
  // Financial Health Score state
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [healthTips, setHealthTips] = useState<FinancialHealthTips | null>(null);
  const [isHealthTipsLoading, setIsHealthTipsLoading] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);


  const calculateHealthScore = useCallback(async () => {
    const now = new Date();
    const currentMonthTx = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
    });

    const monthlyIncomeSetting = settings.monthlyIncome || 0;
    const actualIncome = currentMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const incomeForCalc = Math.max(monthlyIncomeSetting, actualIncome);
    const expenseForCalc = currentMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // 1. Savings Rate
    let savingsRateScore = 0;
    const savings = incomeForCalc - expenseForCalc;
    const savingsRate = incomeForCalc > 0 ? savings / incomeForCalc : 0;
    if (savingsRate > 0.2) savingsRateScore = 25;
    else if (savingsRate > 0.1) savingsRateScore = 15;
    else if (savingsRate > 0.05) savingsRateScore = 10;
    else if (savingsRate > 0) savingsRateScore = 5;

    // 2. Debt-to-Income Ratio
    let dtiScore = 0;
    const monthlyDebtPayment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
    const dtiRatio = incomeForCalc > 0 ? monthlyDebtPayment / incomeForCalc : 1; // if no income, ratio is bad
    if (dtiRatio === 0) dtiScore = 25;
    else if (dtiRatio <= 0.15) dtiScore = 20;
    else if (dtiRatio <= 0.30) dtiScore = 10;
    else if (dtiRatio <= 0.40) dtiScore = 5;

    // 3. Emergency Fund
    let emergencyFundScore = 0;
    let emergencyFundMonths = 0;
    const emergencyFundGoal = goals.find(g => g.isEmergencyFund);
    if (emergencyFundGoal) {
        const suggestion = await getEmergencyFundSuggestion();
        if (suggestion && suggestion.monthlyAverage > 0) {
            emergencyFundMonths = emergencyFundGoal.currentAmount / suggestion.monthlyAverage;
            if (emergencyFundMonths >= 3) emergencyFundScore = 25;
            else if (emergencyFundMonths >= 1) emergencyFundScore = 15;
            else emergencyFundScore = 5;
        } else {
             emergencyFundScore = emergencyFundGoal.currentAmount > 0 ? 2 : 0; // Give some points for starting
        }
    }
    
    // 4. Income Diversity
    let incomeDiversityScore = 0;
    const incomeSources = new Set(currentMonthTx.filter(t => t.type === 'income').map(t => t.category)).size;
    if (incomeSources >= 3) incomeDiversityScore = 25;
    else if (incomeSources === 2) incomeDiversityScore = 15;
    else if (incomeSources === 1) incomeDiversityScore = 5;

    const score: FinancialHealthScore = {
        totalScore: savingsRateScore + dtiScore + emergencyFundScore + incomeDiversityScore,
        savingsRate: { score: savingsRateScore, value: savingsRate },
        debtToIncome: { score: dtiScore, value: dtiRatio },
        emergencyFund: { score: emergencyFundScore, value: emergencyFundMonths },
        incomeDiversity: { score: incomeDiversityScore, value: incomeSources },
    };
    setHealthScore(score);
    return score;
  }, [transactions, debts, goals, settings, getEmergencyFundSuggestion]);
  
  const fetchHealthTips = async (forceRefresh = false) => {
    if ((healthTips && !forceRefresh) || !isOnline) return;
    
    let currentScore = healthScore;
    if (!currentScore) {
        currentScore = await calculateHealthScore();
    }
    
    if (currentScore) {
        setIsHealthTipsLoading(true);
        const tips = await getFinancialHealthTips(currentScore);
        setHealthTips(tips);
        setIsHealthTipsLoading(false);
    }
  };

  useEffect(() => {
    if(transactions.length > 0) {
        calculateHealthScore();
    }
  }, [transactions, debts, goals, settings]); // Recalculate score when data changes

  useEffect(() => {
    if(healthScore && !healthTips) {
        fetchHealthTips();
    }
  }, [healthScore, healthTips]); // Fetch tips when score is calculated


  const thisMonthTx = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
    });
  }, [transactions]);
  
  const monthlySummary = useMemo(() => {
    const income = thisMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = thisMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expense;
    return { income, expense, savings };
  }, [thisMonthTx]);

  const last7DaysData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayKey = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('ar-MA', { weekday: 'short' });

        const dayTx = transactions.filter(t => t.date.startsWith(dayKey));
        const income = dayTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = dayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        
        data.push({ name: dayName, 'دخل': income, 'مصروف': expense });
    }
    return data;
  }, [transactions]);

  const budgetAlerts = useMemo(() => {
    return budgets.map(budget => {
      const spent = thisMonthTx
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      if (percentage >= 80) {
        return { ...budget, spent, percentage };
      }
      return null;
    }).filter(Boolean) as ({ category: string, limit: number, spent: number, percentage: number })[];
  }, [budgets, thisMonthTx]);

  const paymentReminders = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const overdue = [];
    
    debts.forEach(debt => {
        const paymentDate = new Date(debt.nextPaymentDate);
        if (paymentDate <= now) {
            overdue.push(debt);
        } else if ((paymentDate.getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30) {
            upcoming.push(debt);
        }
    });

    return { overdue, upcoming };
  }, [debts]);
  
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Set to end of today to include all of today's due dates

  const dueRecurringTransactions = useMemo(() => {
    return transactions
        .filter(t => t.isRecurring && new Date(t.date) <= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, now]);
  
  const dueSubscriptions = useMemo(() => {
      return subscriptions
          .filter(s => new Date(s.nextPaymentDate) <= now)
          .sort((a,b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());
  }, [subscriptions, now]);

  const handleGetAnalysis = useCallback(async () => {
    setIsAnalysisLoading(true);
    const result = await getSpendingAnalysis();
    setAnalysis(result);
    setIsAnalysisLoading(false);
  }, [getSpendingAnalysis]);

  const handleConfirmTxPaymentClick = (tx: Transaction) => {
    setConfirmTxPaymentModal({ isOpen: true, tx });
  };

  const handleConfirmTxPayment = () => {
      if (confirmTxPaymentModal.tx) {
          confirmRecurringTransaction(confirmTxPaymentModal.tx.id);
      }
      setConfirmTxPaymentModal({ isOpen: false, tx: null });
  };

  const handleConfirmSubPaymentClick = (sub: Subscription) => {
    setConfirmSubPaymentModal({ isOpen: true, sub });
  };
  
  const handleConfirmSubPayment = () => {
      if (confirmSubPaymentModal.sub) {
          recordSubscriptionPayment(confirmSubPaymentModal.sub.id);
      }
      setConfirmSubPaymentModal({ isOpen: false, sub: null });
  };


  if (isLoading) return <div className="flex justify-center items-center h-full p-6"><Spinner /></div>;
  
  const healthStatusLabel = (score: number) => {
    if (score >= 70) return 'جيد جدًا';
    if (score >= 40) return 'يحتاج لتحسين';
    return 'ضعيف';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Financial Health Score */}
        {healthScore && (
            <Card>
                <h3 className="text-xl font-bold mb-4">مؤشر الصحة المالية</h3>
                <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
                    <GaugeChart value={healthScore.totalScore} label="/ 100" />
                    <div className="flex-grow text-center md:text-right">
                        <p className="text-2xl font-bold">{healthStatusLabel(healthScore.totalScore)}</p>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{healthTips?.summary || 'تحليلك المالي جاهز...'}</p>
                        <Button onClick={() => setIsHealthModalOpen(true)}>
                            عرض التفاصيل والنصائح
                        </Button>
                    </div>
                </div>
            </Card>
        )}

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success-100 dark:bg-success-900/50">
                    <Icon name="trending-up" className="w-6 h-6 text-success-600" />
                </div>
                <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">الدخل الشهري</h3>
                    <p className="text-xl font-bold text-success-600">{services.utils.formatCurrency(monthlySummary.income)}</p>
                </div>
            </Card>
            <Card className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-danger-100 dark:bg-danger-900/50">
                    <Icon name="trending-down" className="w-6 h-6 text-danger-600" />
                </div>
                <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">المصروف الشهري</h3>
                    <p className="text-xl font-bold text-danger-600">{services.utils.formatCurrency(monthlySummary.expense)}</p>
                </div>
            </Card>
            <Card className="flex items-center gap-4">
                 <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/50">
                    <Icon name="wallet" className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400">الصافي</h3>
                    <p className={`text-xl font-bold ${monthlySummary.savings >= 0 ? 'text-primary-600' : 'text-warning-500'}`}>{services.utils.formatCurrency(monthlySummary.savings)}</p>
                </div>
            </Card>
        </div>
        
        {/* Due Recurring Transactions */}
        {dueRecurringTransactions.length > 0 && (
            <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="calendar" className="text-secondary-500"/> معاملات متكررة مستحقة
                </h3>
                <div className="space-y-3">
                    {dueRecurringTransactions.map(tx => (
                        <div key={tx.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 gap-2">
                            <div className="flex-grow">
                                <p className="font-semibold">{tx.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    مستحقة في: {services.utils.formatDate(tx.date)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <p className={`font-bold ${tx.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>{services.utils.formatCurrency(tx.amount)}</p>
                                <Button onClick={() => handleConfirmTxPaymentClick(tx)} variant={tx.type === 'income' ? 'success' : 'danger'} className="px-3 py-1.5" title="تأكيد الدفع">
                                    <Icon name="check" className="w-5 h-5" />
                                    <span className="hidden sm:inline">تأكيد</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )}

         {/* Due Subscriptions */}
        {dueSubscriptions.length > 0 && (
            <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="subscriptions" className="text-secondary-500"/> اشتراكات مستحقة الدفع
                </h3>
                <div className="space-y-3">
                    {dueSubscriptions.map(sub => (
                        <div key={sub.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 gap-2">
                            <div className="flex-grow">
                                <p className="font-semibold">{sub.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    مستحقة في: {services.utils.formatDate(sub.nextPaymentDate)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <p className="font-bold text-danger-500">{services.utils.formatCurrency(sub.amount)}</p>
                                <Button onClick={() => handleConfirmSubPaymentClick(sub)} variant="danger" className="px-3 py-1.5" title="تسجيل الدفعة">
                                    <Icon name="check" className="w-5 h-5" />
                                    <span className="hidden sm:inline">دفع</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        )}


        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <Card>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Icon name="alert" className="text-warning-500"/> تنبيهات الميزانية</h3>
            <div className="space-y-3">
              {budgetAlerts.map(alert => (
                <div key={alert.category}>
                  <p>لقد استهلكت {Math.round(alert.percentage)}% من ميزانية {alert.category}.</p>
                  <ProgressBar value={alert.spent} max={alert.limit} colorClass={alert.percentage >= 95 ? 'bg-danger-500' : 'bg-warning-500'}/>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI Assistant */}
        <Card>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Icon name="ai" className="text-primary-500"/> مساعد الذكاء الاصطناعي</h3>
          <div className="space-y-4">
             <Button onClick={handleGetAnalysis} disabled={isAnalysisLoading || !isOnline} title={!isOnline ? 'هذه الميزة تتطلب اتصالاً بالإنترنت' : 'الحصول على تحليل ونصائح'}>
                {isAnalysisLoading ? <Spinner/> : 'تحليل إنفاقي وتقديم نصائح'}
            </Button>
            {analysis && <p className="text-gray-700 dark:text-gray-300 bg-primary-50 dark:bg-gray-800 p-3 rounded-lg">{analysis}</p>}
          </div>
        </Card>

        {/* Financial Activity Chart */}
        <Card>
          <h3 className="text-xl font-bold mb-4">النشاط المالي - آخر 7 أيام</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => services.utils.formatCurrency(value as number).replace('د.م.‏', '')} />
              <Tooltip formatter={(value) => services.utils.formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="دخل" fill="#22c55e" radius={[4, 4, 0, 0]}/>
              <Bar dataKey="مصروف" fill="#ef4444" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Side Column */}
      <div className="lg:col-span-1 space-y-6">
        {/* Payment Reminders */}
        {(paymentReminders.overdue.length > 0 || paymentReminders.upcoming.length > 0) && (
            <Card>
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Icon name="calendar" className="text-gray-500"/> تذكيرات الدفع (الديون)</h3>
                 {paymentReminders.overdue.length > 0 && <div className="mb-4">
                     <h4 className="font-semibold text-danger-500">مستحقة ومتأخرة</h4>
                     {paymentReminders.overdue.map(d => <p key={d.id} className="text-sm">{d.name} - {services.utils.formatCurrency(d.monthlyPayment)}</p>)}
                 </div>}
                 {paymentReminders.upcoming.length > 0 && <div>
                     <h4 className="font-semibold text-gray-500">قادمة (30 يوم)</h4>
                     {paymentReminders.upcoming.map(d => <p key={d.id} className="text-sm">{d.name} - {services.utils.formatDate(d.nextPaymentDate)}</p>)}
                 </div>}
            </Card>
        )}
        
        {/* Latest Transactions */}
        <Card>
          <h3 className="text-xl font-bold mb-4">أحدث المعاملات</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-success-100 dark:bg-success-900/50' : 'bg-danger-100 dark:bg-danger-900/50'}`}>
                    <Icon name={tx.type === 'income' ? 'income' : 'expense'} className={tx.type === 'income' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}/>
                </div>
                <div className="flex-grow">
                    <p className="font-semibold">{tx.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.category}</p>
                </div>
                <p className={`font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>{services.utils.formatCurrency(tx.amount)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Goal Tracking */}
        {goals.length > 0 && (
          <Card>
            <h3 className="text-xl font-bold mb-4">تتبع الأهداف</h3>
            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => (
                <div key={goal.id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{goal.name}</span>
                    <span>{Math.round((goal.currentAmount/goal.targetAmount)*100)}%</span>
                  </div>
                  <ProgressBar value={goal.currentAmount} max={goal.targetAmount} colorClass="bg-primary-500" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      
      <ConfirmationDialog 
          isOpen={confirmTxPaymentModal.isOpen}
          onClose={() => setConfirmTxPaymentModal({ isOpen: false, tx: null })}
          onConfirm={handleConfirmTxPayment}
          title="تأكيد الدفع"
          message={<>
              <p>هل تريد تأكيد دفع هذه المعاملة المتكررة؟</p>
              <p className="font-semibold mt-2">{confirmTxPaymentModal.tx?.description}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                  سيتم إنشاء معاملة جديدة بتاريخ اليوم وتحديث تاريخ الاستحقاق القادم.
              </p>
          </>}
          confirmText="نعم، تأكيد الدفع"
          confirmVariant={confirmTxPaymentModal.tx?.type === 'income' ? 'success' : 'danger'}
      />

       <ConfirmationDialog 
          isOpen={confirmSubPaymentModal.isOpen}
          onClose={() => setConfirmSubPaymentModal({ isOpen: false, sub: null })}
          onConfirm={handleConfirmSubPayment}
          title="تأكيد دفع الاشتراك"
          message={<>
              <p>هل تريد تسجيل دفعة لهذا الاشتراك؟</p>
              <p className="font-semibold mt-2">{confirmSubPaymentModal.sub?.name}</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                  سيتم إنشاء معاملة مصروف جديدة بتاريخ اليوم وتحديث تاريخ التجديد القادم.
              </p>
          </>}
          confirmText="نعم، سجل الدفعة"
          confirmVariant="danger"
      />

      {healthScore && <FinancialHealthDetailsModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        score={healthScore}
        tips={healthTips}
        isLoading={isHealthTipsLoading}
        onRefresh={() => fetchHealthTips(true)}
      />}
    </div>
  );
};


// -----------------------------------------------------------------------------------
// 3. Transactions Page
// -----------------------------------------------------------------------------------
const TransactionForm = ({ transaction, onClose }: { transaction?: Transaction, onClose: () => void }) => {
    const { addTransaction, updateTransaction, getCategorySuggestion, getInvoiceDetailsFromImage, categories, isOnline } = useContext(AppContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [type, setType] = useState(transaction?.type || TransactionType.EXPENSE);
    const [amount, setAmount] = useState(transaction?.amount || '');
    const [category, setCategory] = useState(transaction?.category || '');
    const [description, setDescription] = useState(transaction?.description || '');
    const [date, setDate] = useState(transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false);
    const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(transaction?.recurrence || 'monthly');
    const [invoiceImage, setInvoiceImage] = useState<string | undefined>(transaction?.invoiceImage);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
    
    const isLinkedTransaction = useMemo(() => !!(transaction?.goalId || transaction?.debtId || transaction?.subscriptionId), [transaction]);
    
    const availableCategories = useMemo(() => {
        return categories.filter(c => c.type === type);
    }, [categories, type]);

    useEffect(() => {
        // If the current category is not in the available list for the selected type, reset it.
        if (category && !availableCategories.find(c => c.name === category)) {
            setCategory('');
        }
    }, [type, category, availableCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const txData = {
            type,
            amount: Number(amount),
            category,
            description,
            date: new Date(date).toISOString(),
            isRecurring,
            recurrence: isRecurring ? recurrence : undefined,
            invoiceImage,
            goalId: transaction?.goalId, // Preserve link
            debtId: transaction?.debtId, // Preserve link
            subscriptionId: transaction?.subscriptionId, // Preserve link
        };

        if (transaction) {
            await updateTransaction({ ...txData, id: transaction.id });
        } else {
            await addTransaction(txData);
        }
        setIsSubmitting(false);
        onClose();
    };
    
    const handleImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageDataUrl = reader.result as string;
                setInvoiceImage(imageDataUrl);
                
                if (isOnline) {
                    setIsAnalyzingImage(true);
                    const details = await getInvoiceDetailsFromImage(imageDataUrl);
                    if (details) {
                        setType(TransactionType.EXPENSE);
                        if (details.amount) setAmount(details.amount.toString());
                        if (details.merchantName) setDescription(details.merchantName);
                        if (details.transactionDate && /^\d{4}-\d{2}-\d{2}$/.test(details.transactionDate)) {
                             setDate(details.transactionDate);
                        }
                        const expenseCategories = categories.filter(c => c.type === TransactionType.EXPENSE);
                        if (details.suggestedCategory && expenseCategories.find(c => c.name === details.suggestedCategory)) {
                             setCategory(details.suggestedCategory);
                        }
                    }
                    setIsAnalyzingImage(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSuggestCategory = async () => {
        if (!description) return;
        setIsSuggesting(true);
        const suggested = await getCategorySuggestion(description);
        if (suggested && categories.find(c => c.name === suggested)) {
            setCategory(suggested);
        }
        setIsSuggesting(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             {isLinkedTransaction && (
                <div className="text-sm text-yellow-700 dark:text-yellow-400 p-3 bg-yellow-50 dark:bg-gray-800 rounded-md flex items-center gap-2">
                    <Icon name="info" className="w-5 h-5 flex-shrink-0" /> 
                    <span>هذه معاملة مرتبطة، لذا لا يمكن تغيير بعض تفاصيلها.</span>
                </div>
             )}
             <div className="flex gap-4">
                <Button type="button" onClick={() => setType(TransactionType.EXPENSE)} variant={type === TransactionType.EXPENSE ? 'danger' : 'secondary'} className="w-full" disabled={isLinkedTransaction || isAnalyzingImage}>مصروف</Button>
                <Button type="button" onClick={() => setType(TransactionType.INCOME)} variant={type === TransactionType.INCOME ? 'success' : 'secondary'} className="w-full" disabled={isLinkedTransaction || isAnalyzingImage}>دخل</Button>
            </div>
            <Input id="amount" type="number" label="المبلغ" value={amount} onChange={e => setAmount(e.target.value)} required disabled={isAnalyzingImage} />
            <Input id="description" label="الوصف" value={description} onChange={e => setDescription(e.target.value)} required disabled={isAnalyzingImage}/>
            <div className="flex items-end gap-2">
                <Select id="category" label="الفئة" value={category} onChange={e => setCategory(e.target.value)} disabled={isLinkedTransaction || isAnalyzingImage}>
                    <option value="">اختر فئة</option>
                    {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </Select>
                <Button type="button" onClick={handleSuggestCategory} disabled={isSuggesting || !description || isLinkedTransaction || !isOnline || isAnalyzingImage} title={!isOnline ? 'هذه الميزة تتطلب اتصالاً بالإنترنت' : 'اقتراح فئة بالذكاء الاصطناعي'}>
                    {isSuggesting ? <Spinner /> : <Icon name="ai" />}
                </Button>
            </div>
            <Input id="date" type="date" label="التاريخ" value={date} onChange={e => setDate(e.target.value)} required disabled={isAnalyzingImage} />
            <div className="flex items-center gap-2">
                <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" disabled={isAnalyzingImage}/>
                <label htmlFor="isRecurring">معاملة متكررة</label>
            </div>
            {isRecurring && (
                <Select id="recurrence" label="فترة التكرار" value={recurrence} onChange={e => setRecurrence(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')} disabled={isAnalyzingImage}>
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                </Select>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إرفاق فاتورة</label>
                <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" disabled={isAnalyzingImage}/>
                    <Button type="button" variant="ghost" onClick={() => {
                        const cameraInput = document.createElement('input');
                        cameraInput.type = 'file';
                        cameraInput.accept = 'image/*';
                        cameraInput.capture = 'environment';
                        cameraInput.onchange = handleImageUpload;
                        cameraInput.click();
                    }} disabled={isAnalyzingImage}><Icon name="camera" /></Button>
                </div>
                 {isAnalyzingImage && <div className="flex items-center gap-2 mt-2 text-primary-600 dark:text-primary-400"><Spinner /><span>جاري تحليل الفاتورة...</span></div>}
                 {invoiceImage && <img src={invoiceImage} alt="Invoice preview" className="mt-2 rounded-lg max-h-40"/>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant={type === TransactionType.INCOME ? 'success' : 'danger'} disabled={isSubmitting || isAnalyzingImage}>{isSubmitting ? <Spinner /> : 'حفظ'}</Button>
            </div>
        </form>
    );
};

export const TransactionsListPage = () => {
    const { transactions, categories, deleteTransaction, confirmRecurringTransaction, isLoading } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | undefined>(undefined);
    const [tab, setTab] = useState<'normal' | 'recurring'>('normal');
    const [filters, setFilters] = useState({ query: '', category: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<{isOpen: boolean, tx: Transaction | null}>({ isOpen: false, tx: null });
    const [confirmPaymentModal, setConfirmPaymentModal] = useState<{isOpen: boolean, tx: Transaction | null}>({ isOpen: false, tx: null });
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const handleDeleteClick = (tx: Transaction) => {
        setConfirmDeleteModal({ isOpen: true, tx });
    };

    const handleConfirmDelete = () => {
        if (confirmDeleteModal.tx) {
            deleteTransaction(confirmDeleteModal.tx.id);
        }
        setConfirmDeleteModal({ isOpen: false, tx: null });
    };

    const handleConfirmPaymentClick = (tx: Transaction) => {
        setConfirmPaymentModal({ isOpen: true, tx });
    };

    const handleConfirmPayment = () => {
        if (confirmPaymentModal.tx) {
            confirmRecurringTransaction(confirmPaymentModal.tx.id);
        }
        setConfirmPaymentModal({ isOpen: false, tx: null });
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => tx.isRecurring === (tab === 'recurring'))
            .filter(tx => tx.description.toLowerCase().includes(filters.query.toLowerCase()))
            .filter(tx => filters.category ? tx.category === filters.category : true)
            .filter(tx => filters.startDate ? tx.date >= new Date(filters.startDate).toISOString() : true)
            .filter(tx => filters.endDate ? tx.date <= new Date(filters.endDate).toISOString() : true)
            .filter(tx => filters.minAmount ? tx.amount >= Number(filters.minAmount) : true)
            .filter(tx => filters.maxAmount ? tx.amount <= Number(filters.maxAmount) : true)
            .sort((a, b) => new Date(b.date).getTime() - new Date(b.date).getTime());
    }, [transactions, tab, filters]);
    
    const summary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions]);
    
    const openAddModal = () => {
        setEditingTx(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (tx: Transaction) => {
        setEditingTx(tx);
        setIsModalOpen(true);
    };
    
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold">المعاملات</h1>
                <Button onClick={openAddModal}><Icon name="plus" /> إضافة معاملة</Button>
            </div>

            <Card>
                 <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsFilterVisible(v => !v)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsFilterVisible(v => !v); }}
                    aria-expanded={isFilterVisible}
                    aria-controls="filter-section"
                >
                    <h3 className="text-lg font-semibold">تصفية وبحث</h3>
                    <Icon name={isFilterVisible ? 'chevronUp' : 'chevronDown'} className="w-6 h-6 text-gray-500" />
                </div>
                <div
                    id="filter-section"
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isFilterVisible ? 'max-h-[500px] mt-4' : 'max-h-0'}`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                        <Input id="query" name="query" placeholder="بحث بالوصف..." value={filters.query} onChange={handleFilterChange} />
                        <Select id="category" name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">كل الفئات</option>
                            <optgroup label="مصروفات">
                                {categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </optgroup>
                            <optgroup label="دخل">
                                {categories.filter(c => c.type === 'income').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </optgroup>
                        </Select>
                        <div className="flex gap-2">
                            <Input id="startDate" name="startDate" type="date" label="من" value={filters.startDate} onChange={handleFilterChange} />
                            <Input id="endDate" name="endDate" type="date" label="إلى" value={filters.endDate} onChange={handleFilterChange} />
                        </div>
                        <div className="flex gap-2">
                            <Input id="minAmount" name="minAmount" type="number" placeholder="أقل مبلغ" value={filters.minAmount} onChange={handleFilterChange} />
                            <Input id="maxAmount" name="maxAmount" type="number" placeholder="أعلى مبلغ" value={filters.maxAmount} onChange={handleFilterChange} />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-reverse space-x-4">
                    <button onClick={() => setTab('normal')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${tab === 'normal' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        عادية
                    </button>
                    <button onClick={() => setTab('recurring')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${tab === 'recurring' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        متكررة
                    </button>
                </nav>
            </div>

            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div><p className="text-gray-500">إجمالي الدخل</p><p className="font-bold text-success-500 text-lg">{services.utils.formatCurrency(summary.income)}</p></div>
                    <div><p className="text-gray-500">إجمالي المصروف</p><p className="font-bold text-danger-500 text-lg">{services.utils.formatCurrency(summary.expense)}</p></div>
                    <div><p className="text-gray-500">الصافي</p><p className={`font-bold text-lg ${summary.net >= 0 ? 'text-primary-500' : 'text-warning-500'}`}>{services.utils.formatCurrency(summary.net)}</p></div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="p-3">التاريخ</th>
                                <th className="p-3">الوصف</th>
                                <th className="p-3">الفئة</th>
                                <th className="p-3">المبلغ</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-8"><Spinner /></td></tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-gray-500">لا توجد معاملات تطابق البحث.</td></tr>
                            ) : (
                                filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="p-3">{services.utils.formatDate(tx.date)}</td>
                                        <td className="p-3 font-semibold">{tx.description}</td>
                                        <td className="p-3">{tx.category}</td>
                                        <td className={`p-3 font-bold ${tx.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>{services.utils.formatCurrency(tx.amount)}</td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                {tab === 'recurring' && (
                                                    <Button variant={tx.type === 'income' ? 'success' : 'danger'} className="!p-2" onClick={() => handleConfirmPaymentClick(tx)} title="تسجيل الدفعة وتمريرها للدورة التالية">
                                                        <Icon name="check" className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" className="!p-2" onClick={() => openEditModal(tx)}><Icon name="edit" className="w-4 h-4" /></Button>
                                                <Button variant="ghost" className="!p-2" onClick={() => handleDeleteClick(tx)}><Icon name="trash" className="w-4 h-4 text-danger-500" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                     {isLoading ? (
                        <div className="flex justify-center p-8"><Spinner /></div>
                    ) : filteredTransactions.length === 0 ? (
                        <p className="text-center p-8 text-gray-500">لا توجد معاملات تطابق البحث.</p>
                    ) : (
                        filteredTransactions.map(tx => (
                            <div key={tx.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-success-100 dark:bg-success-900/50' : 'bg-danger-100 dark:bg-danger-900/50'}`}>
                                        <Icon name={tx.type === 'income' ? 'income' : 'expense'} className={tx.type === 'income' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold">{tx.description}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{tx.category}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-bold text-base whitespace-nowrap ${tx.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>{services.utils.formatCurrency(tx.amount)}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{services.utils.formatDate(tx.date)}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center mt-2">
                                    <div className="flex gap-1">
                                        {tab === 'recurring' && (
                                            <Button variant={tx.type === 'income' ? 'success' : 'danger'} className="!p-2" onClick={() => handleConfirmPaymentClick(tx)} title="تسجيل الدفعة وتمريرها للدورة التالية">
                                                <Icon name="check" className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" className="!p-2" onClick={() => openEditModal(tx)}><Icon name="edit" className="w-4 h-4" /></Button>
                                        <Button variant="ghost" className="!p-2" onClick={() => handleDeleteClick(tx)}><Icon name="trash" className="w-4 h-4 text-danger-500" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTx ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}>
                <TransactionForm transaction={editingTx} onClose={() => setIsModalOpen(false)} />
            </Modal>
            
            <ConfirmationDialog 
                isOpen={confirmDeleteModal.isOpen}
                onClose={() => setConfirmDeleteModal({ isOpen: false, tx: null })}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={<>
                    <p>هل أنت متأكد من حذف هذه المعاملة؟</p>
                    <p className="font-semibold mt-2">{confirmDeleteModal.tx?.description}</p>
                    <p className="text-danger-500 mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
                </>}
                confirmText="نعم، احذف"
                confirmVariant="danger"
            />

            <ConfirmationDialog 
                isOpen={confirmPaymentModal.isOpen}
                onClose={() => setConfirmPaymentModal({ isOpen: false, tx: null })}
                onConfirm={handleConfirmPayment}
                title="تأكيد الدفع"
                message={<>
                    <p>هل أنت متأكد من تسجيل دفعة لهذه المعاملة المتكررة؟</p>
                    <p className="font-semibold mt-2">{confirmPaymentModal.tx?.description}</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">سيتم إنشاء معاملة عادية جديدة بتاريخ اليوم، وسيتم تحديث تاريخ استحقاق هذه المعاملة إلى الفترة التالية.</p>
                </>}
                confirmText="نعم، سجل الدفعة"
                confirmVariant={confirmPaymentModal.tx?.type === 'income' ? 'success' : 'danger'}
            />
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 4. Categories Page
// -----------------------------------------------------------------------------------
const CategoryForm = ({ category, onClose }: { category?: Category, onClose: () => void }) => {
    const { addCategory, updateCategory } = useContext(AppContext);
    const [name, setName] = useState(category?.name || '');
    const [type, setType] = useState<TransactionType>(category?.type || TransactionType.EXPENSE);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        if (category) {
            updateCategory({ ...category, name });
        } else {
            addCategory({ name, type });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="اسم الفئة" value={name} onChange={e => setName(e.target.value)} required />
            <Select id="type" label="نوع الفئة" value={type} onChange={e => setType(e.target.value as TransactionType)} disabled={!!category}>
                <option value={TransactionType.EXPENSE}>مصروف</option>
                <option value={TransactionType.INCOME}>دخل</option>
            </Select>
            {!!category && <p className="text-sm text-gray-500">لا يمكن تغيير نوع الفئة بعد إنشائها.</p>}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ</Button>
            </div>
        </form>
    );
};

const DraggableCategoryList = ({ 
    title,
    icon,
    iconClass,
    categories,
    onEdit,
    onDelete,
    onReorder
} : {
    title: string,
    icon: string,
    iconClass: string,
    categories: Category[],
    onEdit: (category: Category) => void,
    onDelete: (category: Category) => void,
    onReorder: (reorderedCategories: Category[]) => void
}) => {
    const [localCategories, setLocalCategories] = useState(categories);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
        dragOverItem.current = index;
        const reordered = [...localCategories];
        const [draggedItem] = reordered.splice(dragItem.current!, 1);
        reordered.splice(dragOverItem.current!, 0, draggedItem);
        dragItem.current = index;
        setLocalCategories(reordered);
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const finalReordered = localCategories.map((cat, index) => ({ ...cat, order: index }));
            onReorder(finalReordered);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault(); 
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Icon name={icon} className={iconClass}/>{title}</h2>
            <ul className="space-y-2">
                {localCategories.map((cat, index) => (
                    <li 
                        key={cat.id} 
                        className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                    >
                        <span className="font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="!p-2" onClick={() => onEdit(cat)} disabled={cat.isDefault} title={cat.isDefault ? "لا يمكن تعديل الفئات الافتراضية" : "تعديل"}>
                                <Icon name="edit" className="w-5 h-5"/>
                            </Button>
                            <Button variant="ghost" className="!p-2" onClick={() => onDelete(cat)} disabled={cat.isDefault} title={cat.isDefault ? "لا يمكن حذف الفئات الافتراضية" : "حذف"}>
                                <Icon name="trash" className="w-5 h-5 text-danger-500"/>
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};


export const CategoriesPage = () => {
    const { categories, updateCategory, deleteCategory, addCategory, updateCategoryOrder, isLoading } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            deleteCategory(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const expenseCategories = useMemo(() => categories.filter(c => c.type === TransactionType.EXPENSE), [categories]);
    const incomeCategories = useMemo(() => categories.filter(c => c.type === TransactionType.INCOME), [categories]);
    
    const handleReorder = (reorderedCategories: Category[]) => {
        const otherType = reorderedCategories[0].type === TransactionType.EXPENSE ? TransactionType.INCOME : TransactionType.EXPENSE;
        const unchangedCategories = categories.filter(c => c.type === otherType);
        updateCategoryOrder([...reorderedCategories, ...unchangedCategories]);
    };


    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold">إدارة الفئات</h1>
                <Button onClick={openAddModal}><Icon name="plus" /> إضافة فئة جديدة</Button>
            </div>
            
             <div className="text-sm text-primary-700 dark:text-primary-300 p-3 bg-primary-50 dark:bg-gray-800 rounded-md flex items-center gap-2">
                <Icon name="info" className="w-5 h-5 flex-shrink-0" />
                <span>يمكنك سحب وإفلات الفئات لإعادة ترتيبها حسب تفضيلك.</span>
            </div>

            {isLoading ? <div className="flex justify-center"><Spinner /></div> : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DraggableCategoryList 
                        title="فئات المصروفات"
                        icon="expense"
                        iconClass="text-danger-500"
                        categories={expenseCategories}
                        onEdit={openEditModal}
                        onDelete={setDeleteConfirm}
                        onReorder={handleReorder}
                    />
                    <DraggableCategoryList 
                        title="فئات الدخل"
                        icon="income"
                        iconClass="text-success-500"
                        categories={incomeCategories}
                        onEdit={openEditModal}
                        onDelete={setDeleteConfirm}
                        onReorder={handleReorder}
                    />
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}>
                <CategoryForm category={editingCategory} onClose={() => setIsModalOpen(false)} />
            </Modal>
            
            <ConfirmationDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد حذف الفئة"
                message={<>
                    <p>هل أنت متأكد من حذف فئة "{deleteConfirm?.name}"؟</p>
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">سيتم تحويل جميع المعاملات الحالية في هذه الفئة إلى فئة "أخرى". لا يمكن التراجع عن هذا الإجراء.</p>
                </>}
                confirmText="نعم، احذف"
                confirmVariant="danger"
            />
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 5. Goals Page
// -----------------------------------------------------------------------------------
const EmergencyFundModal = ({ onClose }: { onClose: () => void }) => {
    const { getEmergencyFundSuggestion, addGoal, isOnline } = useContext(AppContext);
    const [suggestion, setSuggestion] = useState<EmergencyFundSuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [targetAmount, setTargetAmount] = useState('');

    useEffect(() => {
        const fetchSuggestion = async () => {
            if (!isOnline) {
                setError('يجب أن تكون متصلاً بالإنترنت للحصول على اقتراح ذكي.');
                setIsLoading(false);
                return;
            }
            const result = await getEmergencyFundSuggestion();
            if (result) {
                setSuggestion(result);
                setTargetAmount(result.threeMonthTarget.toString());
            } else {
                setError('لم نتمكن من حساب اقتراح تلقائي. قد لا يكون لديك بيانات كافية. يمكنك إدخال الهدف يدوياً.');
            }
            setIsLoading(false);
        };
        fetchSuggestion();
    }, [getEmergencyFundSuggestion, isOnline]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addGoal({
            name: 'صندوق الطوارئ',
            targetAmount: Number(targetAmount),
            isEmergencyFund: true,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {isLoading && <div className="flex flex-col items-center justify-center p-8"><Spinner /><p className="mt-2">جاري تحليل نفقاتك...</p></div>}
            
            {error && !isLoading && (
                 <div className="text-sm text-yellow-600 dark:text-yellow-400 p-3 bg-yellow-50 dark:bg-gray-800 rounded-md flex items-center gap-2">
                    <Icon name="alert" className="w-5 h-5 flex-shrink-0" /> 
                    <span>{error}</span>
                </div>
            )}

            {suggestion && (
                <Card className="bg-primary-50 dark:bg-gray-800">
                    <h4 className="font-bold text-lg text-primary-700 dark:text-primary-300">اقتراح ذكي!</h4>
                    <p className="text-sm">بناءً على متوسط نفقاتك الأساسية البالغ حوالي <span className="font-bold">{services.utils.formatCurrency(suggestion.monthlyAverage)}</span> شهرياً، نقترح:</p>
                    <div className="flex gap-2 mt-2">
                        <Button type="button" variant="secondary" onClick={() => setTargetAmount(suggestion.threeMonthTarget.toString())} className="flex-1">
                            هدف 3 أشهر <span className="font-semibold">{services.utils.formatCurrency(suggestion.threeMonthTarget)}</span>
                        </Button>
                         <Button type="button" variant="secondary" onClick={() => setTargetAmount(suggestion.sixMonthTarget.toString())} className="flex-1">
                            هدف 6 أشهر <span className="font-semibold">{services.utils.formatCurrency(suggestion.sixMonthTarget)}</span>
                        </Button>
                    </div>
                </Card>
            )}

            {!isLoading && (
                 <>
                    <Input id="targetAmount" type="number" label="المبلغ المستهدف لصندوق الطوارئ" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                        <Button type="submit" variant="primary">إنشاء الصندوق</Button>
                    </div>
                </>
            )}
        </form>
    )
}

const GoalForm = ({ goal, onClose }: { goal?: Goal | null, onClose: () => void }) => {
    const { addGoal, updateGoal } = useContext(AppContext);
    const [name, setName] = useState(goal?.name || '');
    const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (goal) {
            updateGoal({ ...goal, name, targetAmount: Number(targetAmount) });
        } else {
            addGoal({ name, targetAmount: Number(targetAmount), isEmergencyFund: false });
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="اسم الهدف" value={name} onChange={e => setName(e.target.value)} required disabled={!!goal?.isEmergencyFund} />
            <Input id="targetAmount" type="number" label="المبلغ المستهدف" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required />
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">{goal ? 'حفظ التغييرات' : 'حفظ الهدف'}</Button>
            </div>
        </form>
    );
};

export const GoalsListPage = () => {
    const { goals, deleteGoal, addFundsToGoal, isLoading } = useContext(AppContext);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Goal | null>(null);

    const emergencyFundGoal = useMemo(() => goals.find(g => g.isEmergencyFund), [goals]);
    const regularGoals = useMemo(() => goals.filter(g => !g.isEmergencyFund), [goals]);
    
    const openAddModal = () => {
        setEditingGoal(null);
        setIsGoalModalOpen(true);
    };

    const openEditModal = (goal: Goal) => {
        setEditingGoal(goal);
        setIsGoalModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            deleteGoal(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const AddFundsForm = ({ goal, onClose }: { goal: Goal, onClose: () => void }) => {
        const [amount, setAmount] = useState('');
        
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            addFundsToGoal(goal.id, Number(amount));
            onClose();
        };

        return (
             <form onSubmit={handleSubmit} className="space-y-4">
                <p>إضافة رصيد إلى هدف: <span className="font-bold">{goal.name}</span></p>
                <Input id="fundAmount" type="number" label="المبلغ" value={amount} onChange={e => setAmount(e.target.value)} required />
                <div className="text-sm text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                   سيتم تلقائياً إنشاء معاملة مصروف في فئة "مدخرات واستثمار".
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" variant="success">إضافة رصيد</Button>
                </div>
            </form>
        );
    };

    const handleOpenFundsModal = (goal: Goal) => {
        setSelectedGoal(goal);
        setIsFundsModalOpen(true);
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold">الأهداف المالية</h1>
                <Button onClick={openAddModal}><Icon name="plus" /> إضافة هدف جديد</Button>
            </div>
            
            {isLoading && <div className="flex justify-center"><Spinner/></div>}

            {!isLoading && !emergencyFundGoal && (
                 <Card className="bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
                        <Icon name="shield" className="w-16 h-16 text-primary-500 flex-shrink-0"/>
                        <div>
                            <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200">ابدأ ببناء أمانك المالي</h2>
                            <p className="text-primary-600 dark:text-primary-300 mt-1 mb-4">صندوق الطوارئ هو أساس الاستقرار المالي. دعنا نساعدك في إنشاء واحد بناءً على نفقاتك.</p>
                             <Button onClick={() => setIsEmergencyModalOpen(true)}>
                                <Icon name="ai"/> إنشاء صندوق الطوارئ باقتراح ذكي
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {emergencyFundGoal && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Icon name="shield" className="text-primary-500"/> صندوق الطوارئ</h2>
                     <Card key={emergencyFundGoal.id} className="flex flex-col border-2 border-primary-500">
                        <div className="flex justify-between items-start">
                           <h3 className="text-xl font-bold mb-2">{emergencyFundGoal.name}</h3>
                           <div className="flex items-center gap-1">
                               <Button variant="ghost" className="!p-2" onClick={() => openEditModal(emergencyFundGoal)}><Icon name="edit" className="w-5 h-5" /></Button>
                               <Button variant="ghost" className="!p-2" onClick={() => setDeleteConfirm(emergencyFundGoal)}><Icon name="trash" className="w-5 h-5 text-danger-500" /></Button>
                           </div>
                        </div>
                        <div className="flex-grow space-y-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">التقدم</p>
                            <ProgressBar value={emergencyFundGoal.currentAmount} max={emergencyFundGoal.targetAmount} colorClass="bg-primary-500" />
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-primary-600 dark:text-primary-400">{services.utils.formatCurrency(emergencyFundGoal.currentAmount)}</span>
                                <span className="text-gray-500 dark:text-gray-400">{services.utils.formatCurrency(emergencyFundGoal.targetAmount)}</span>
                            </div>
                        </div>
                         <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                             <Button className="w-full" variant="primary" onClick={() => handleOpenFundsModal(emergencyFundGoal)}>إضافة رصيد</Button>
                         </div>
                    </Card>
                </div>
            )}
            
            {!isLoading && regularGoals.length === 0 && !emergencyFundGoal && (
                <Card className="text-center py-12">
                    <Icon name="goals" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-xl font-medium">لا توجد أهداف بعد</h3>
                    <p className="mt-1 text-sm text-gray-500">ابدأ بتحديد أهدافك المالية للادخار.</p>
                </Card>
            )}

            {regularGoals.length > 0 && (
                 <div>
                     <h2 className="text-2xl font-bold mb-4">أهدافك الأخرى</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularGoals.map(goal => (
                            <Card key={goal.id} className="flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold mb-2">{goal.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" className="!p-2" onClick={() => openEditModal(goal)}><Icon name="edit" className="w-5 h-5" /></Button>
                                        <Button variant="ghost" className="!p-2" onClick={() => setDeleteConfirm(goal)}><Icon name="trash" className="w-5 h-5 text-danger-500" /></Button>
                                    </div>
                                </div>
                                <div className="flex-grow space-y-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">التقدم</p>
                                    <ProgressBar value={goal.currentAmount} max={goal.targetAmount} colorClass="bg-primary-500" />
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-primary-600 dark:text-primary-400">{services.utils.formatCurrency(goal.currentAmount)}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{services.utils.formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <Button className="w-full" variant="primary" onClick={() => handleOpenFundsModal(goal)}>إضافة رصيد</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title={editingGoal ? 'تعديل الهدف' : 'إضافة هدف جديد'}>
                <GoalForm goal={editingGoal} onClose={() => setIsGoalModalOpen(false)} />
            </Modal>

            <Modal isOpen={isFundsModalOpen} onClose={() => setIsFundsModalOpen(false)} title="إضافة رصيد للهدف">
                {selectedGoal && <AddFundsForm goal={selectedGoal} onClose={() => setIsFundsModalOpen(false)} />}
            </Modal>

            <Modal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} title="إنشاء صندوق الطوارئ">
                <EmergencyFundModal onClose={() => setIsEmergencyModalOpen(false)} />
            </Modal>

            <ConfirmationDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد حذف الهدف"
                message={<>
                    <p>هل أنت متأكد من حذف هدف "{deleteConfirm?.name}"؟</p>
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">سيتم حذف الهدف وجميع الأرصدة المرتبطة به. المعاملات التي أنشئت لإضافة رصيد لن يتم حذفها.</p>
                </>}
                confirmText="نعم، احذف"
                confirmVariant="danger"
            />
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 6. Budget Page
// -----------------------------------------------------------------------------------
export const BudgetPage = () => {
    const { budgets, transactions, saveBudgets, getBudgetSuggestion, isOnline } = useContext(AppContext);
    const [localBudgets, setLocalBudgets] = useState<Budget[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        setLocalBudgets(budgets);
    }, [budgets]);

    const thisMonthSpending = useMemo(() => {
        const now = new Date();
        const spendingMap = new Map<string, number>();
        transactions
            .filter(t => {
                const txDate = new Date(t.date);
                return t.type === 'expense' && txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
            })
            .forEach(t => {
                spendingMap.set(t.category, (spendingMap.get(t.category) || 0) + t.amount);
            });
        return spendingMap;
    }, [transactions]);
    
    const handleBudgetChange = (category: string, limit: string) => {
        setLocalBudgets(current => current.map(b => b.category === category ? { ...b, limit: Number(limit) || 0 } : b));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await saveBudgets(localBudgets);
        setIsSaving(false);
    };

    const handleSuggestBudgets = async () => {
        setIsSuggesting(true);
        const suggestions = await getBudgetSuggestion();
        if (suggestions.length > 0) {
            setLocalBudgets(current => {
                const newBudgets = [...current];
                suggestions.forEach(suggestion => {
                    const index = newBudgets.findIndex(b => b.category === suggestion.category);
                    if (index > -1) {
                        newBudgets[index].limit = suggestion.limit;
                    }
                });
                return newBudgets;
            });
        }
        setIsSuggesting(false);
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">الميزانية الشهرية</h1>
                <div className="flex gap-2">
                    <Button onClick={handleSuggestBudgets} disabled={isSuggesting || !isOnline} title={!isOnline ? "هذه الميزة تتطلب اتصالاً بالإنترنت" : "اقتراح ميزانية بالذكاء الاصطناعي"}>
                        {isSuggesting ? <Spinner /> : <><Icon name="ai" /> اقتراح ذكي</>}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Spinner /> : 'حفظ الميزانية'}
                    </Button>
                </div>
            </div>

            <Card>
                <div className="space-y-6">
                    {localBudgets.map(budget => {
                        const spent = thisMonthSpending.get(budget.category) || 0;
                        const remaining = budget.limit - spent;
                        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                        const progressBarColor = percentage > 100 ? 'bg-danger-500' : percentage > 80 ? 'bg-warning-500' : 'bg-success-500';
                        
                        return (
                             <div key={budget.category}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                    <h3 className="text-xl font-semibold">{budget.category}</h3>
                                    <div className="w-full sm:w-48">
                                        <Input
                                            id={`budget-${budget.category}`}
                                            type="number"
                                            value={budget.limit}
                                            onChange={(e) => handleBudgetChange(budget.category, e.target.value)}
                                            label="الحد الشهري"
                                        />
                                    </div>
                                </div>
                                <ProgressBar value={spent} max={budget.limit} colorClass={progressBarColor} />
                                <div className="flex justify-between text-sm mt-1">
                                    <span>المصروف: {services.utils.formatCurrency(spent)}</span>
                                    <span className={remaining < 0 ? 'text-danger-500' : ''}>المتبقي: {services.utils.formatCurrency(remaining)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};


// -----------------------------------------------------------------------------------
// 7. Reports Page
// -----------------------------------------------------------------------------------
export const ReportsPage = () => {
    const { transactions, categories } = useContext(AppContext);
    const [period, setPeriod] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
    const [customRange, setCustomRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
    
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'];

    const filteredTransactions = useMemo(() => {
        const now = new Date();
        if (period === 'monthly') {
             return transactions.filter(t => {
                const txDate = new Date(t.date);
                return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
             });
        }
        if (period === 'yearly') {
            return transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
        }
        // Custom period
        const start = new Date(customRange.start);
        start.setHours(0,0,0,0);
        const end = new Date(customRange.end);
        end.setHours(23,59,59,999);
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= start && txDate <= end;
        });
    }, [transactions, period, customRange]);

    const expenseData = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                dataMap.set(t.category, (dataMap.get(t.category) || 0) + t.amount);
            });
        return Array.from(dataMap, ([name, value]) => ({ name, value, fill: colors[Math.floor(Math.random()*colors.length)] })).sort((a,b) => b.value - a.value);
    }, [filteredTransactions]);
    
     const incomeData = useMemo(() => {
        const dataMap = new Map<string, number>();
        filteredTransactions
            .filter(t => t.type === 'income')
            .forEach(t => {
                dataMap.set(t.category, (dataMap.get(t.category) || 0) + t.amount);
            });
        return Array.from(dataMap, ([name, value]) => ({ name, value, fill: colors[Math.floor(Math.random()*colors.length)] })).sort((a,b) => b.value - a.value);
    }, [filteredTransactions]);

    const handleCustomRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const totals = useMemo(() => {
        const income = incomeData.reduce((acc, item) => acc + item.value, 0);
        const expense = expenseData.reduce((acc, item) => acc + item.value, 0);
        return { income, expense, net: income - expense };
    }, [incomeData, expenseData]);

    const ChartComponent = ({ data, title }: { data: {name: string, value: number, fill: string}[], title: string}) => {
        if(data.length === 0) {
            return <div className="text-center p-8 text-gray-500">لا توجد بيانات لعرضها في هذه الفترة.</div>
        }
        if (chartType === 'bar') {
            return (
                 <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => services.utils.formatCurrency(value as number).replace('د.م.‏', '')} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => services.utils.formatCurrency(value as number)}/>
                        <Bar dataKey="value" name={title} radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )
        }
        return (
             <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        );
                    }}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(value) => services.utils.formatCurrency(value as number)}/>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        )
    };
    
    return (
         <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">التقارير المالية</h1>
            
            <Card>
                <div className="flex flex-wrap gap-4 items-end">
                    <Select id="period" label="الفترة" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                        <option value="monthly">هذا الشهر</option>
                        <option value="yearly">هذه السنة</option>
                        <option value="custom">فترة مخصصة</option>
                    </Select>
                     {period === 'custom' && (
                        <>
                            <Input id="start" name="start" type="date" label="من" value={customRange.start} onChange={handleCustomRangeChange} />
                            <Input id="end" name="end" type="date" label="إلى" value={customRange.end} onChange={handleCustomRangeChange} />
                        </>
                     )}
                     <Select id="chartType" label="نوع الرسم البياني" value={chartType} onChange={(e) => setChartType(e.target.value as any)}>
                        <option value="bar">أعمدة</option>
                        <option value="pie">دائري</option>
                    </Select>
                </div>
            </Card>

            <Card>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div><p className="text-gray-500">إجمالي الدخل</p><p className="font-bold text-success-500 text-lg">{services.utils.formatCurrency(totals.income)}</p></div>
                    <div><p className="text-gray-500">إجمالي المصروف</p><p className="font-bold text-danger-500 text-lg">{services.utils.formatCurrency(totals.expense)}</p></div>
                    <div><p className="text-gray-500">الصافي</p><p className={`font-bold text-lg ${totals.net >= 0 ? 'text-primary-500' : 'text-warning-500'}`}>{services.utils.formatCurrency(totals.net)}</p></div>
                </div>
            </Card>

             <Card>
                <h2 className="text-xl font-bold mb-4">تحليل المصروفات</h2>
                <ChartComponent data={expenseData} title="مصروفات" />
            </Card>

             <Card>
                <h2 className="text-xl font-bold mb-4">تحليل الدخل</h2>
                <ChartComponent data={incomeData} title="دخل" />
            </Card>
        </div>
    );
};


// -----------------------------------------------------------------------------------
// 8. Debts Page
// -----------------------------------------------------------------------------------
const DebtForm = ({ debt, onClose }: { debt?: Debt, onClose: () => void }) => {
    const { addDebt, updateDebt } = useContext(AppContext);
    const [name, setName] = useState(debt?.name || '');
    const [totalAmount, setTotalAmount] = useState(debt?.totalAmount || '');
    const [remainingAmount, setRemainingAmount] = useState(debt?.remainingAmount || '');
    const [monthlyPayment, setMonthlyPayment] = useState(debt?.monthlyPayment || '');
    const [nextPaymentDate, setNextPaymentDate] = useState(debt?.nextPaymentDate ? debt.nextPaymentDate.split('T')[0] : new Date().toISOString().split('T')[0]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const debtData = {
            name,
            totalAmount: Number(totalAmount),
            remainingAmount: Number(remainingAmount),
            monthlyPayment: Number(monthlyPayment),
            nextPaymentDate: new Date(nextPaymentDate).toISOString(),
        };
        if (debt) {
            await updateDebt({ ...debtData, id: debt.id });
        } else {
            await addDebt(debtData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="اسم الدين" value={name} onChange={e => setName(e.target.value)} required />
            <Input id="totalAmount" type="number" label="المبلغ الإجمالي" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required disabled={!!debt} />
            {debt && <Input id="remainingAmount" type="number" label="المبلغ المتبقي" value={remainingAmount} onChange={e => setRemainingAmount(e.target.value)} required />}
            <Input id="monthlyPayment" type="number" label="الدفعة الشهرية" value={monthlyPayment} onChange={e => setMonthlyPayment(e.target.value)} required />
            <Input id="nextPaymentDate" type="date" label="تاريخ الدفعة القادمة" value={nextPaymentDate} onChange={e => setNextPaymentDate(e.target.value)} required />
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ</Button>
            </div>
        </form>
    );
};

export const DebtsListPage = () => {
    const { debts, deleteDebt, recordDebtPayment, isLoading } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<Debt | undefined>(undefined);
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Debt | null>(null);

    const openAddModal = () => {
        setEditingDebt(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (debt: Debt) => {
        setEditingDebt(debt);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            deleteDebt(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const handleOpenPaymentModal = (debt: Debt) => {
        setSelectedDebt(debt);
        setIsPaymentModalOpen(true);
    };

    const RecordPaymentForm = ({ debt, onClose }: { debt: Debt, onClose: () => void }) => {
        const [amount, setAmount] = useState(debt.monthlyPayment.toString());
        
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            recordDebtPayment(debt.id, Number(amount));
            onClose();
        };

        return (
             <form onSubmit={handleSubmit} className="space-y-4">
                <p>تسجيل دفعة لدين: <span className="font-bold">{debt.name}</span></p>
                <Input id="paymentAmount" type="number" label="مبلغ الدفعة" value={amount} onChange={e => setAmount(e.target.value)} required />
                <div className="text-sm text-gray-500 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                   سيتم تلقائياً إنشاء معاملة مصروف في فئة "ديون وقروض".
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" variant="success">تسجيل الدفعة</Button>
                </div>
            </form>
        );
    };

    const totalRemaining = useMemo(() => debts.reduce((sum, d) => sum + d.remainingAmount, 0), [debts]);
    const totalMonthlyPayments = useMemo(() => debts.reduce((sum, d) => sum + d.monthlyPayment, 0), [debts]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold">إدارة الديون</h1>
                <Button onClick={openAddModal}><Icon name="plus" /> إضافة دين جديد</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <h3 className="text-gray-500 dark:text-gray-400">إجمالي الديون المتبقية</h3>
                    <p className="text-2xl font-bold text-danger-500">{services.utils.formatCurrency(totalRemaining)}</p>
                </Card>
                <Card>
                    <h3 className="text-gray-500 dark:text-gray-400">إجمالي الدفعات الشهرية</h3>
                    <p className="text-2xl font-bold text-warning-500">{services.utils.formatCurrency(totalMonthlyPayments)}</p>
                </Card>
            </div>

            {isLoading && <div className="flex justify-center"><Spinner /></div>}
            
            {!isLoading && debts.length === 0 ? (
                <Card className="text-center py-12">
                    <Icon name="debts" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-xl font-medium">لا توجد ديون مسجلة</h3>
                    <p className="mt-1 text-sm text-gray-500">تهانينا! أو يمكنك إضافة دين لتتبعه.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {debts.map(debt => {
                        const progress = debt.totalAmount > 0 ? ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100 : 0;
                        return (
                            <Card key={debt.id} className="flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold mb-2">{debt.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" className="!p-2" onClick={() => openEditModal(debt)}><Icon name="edit" className="w-5 h-5" /></Button>
                                        <Button variant="ghost" className="!p-2" onClick={() => setDeleteConfirm(debt)}><Icon name="trash" className="w-5 h-5 text-danger-500" /></Button>
                                    </div>
                                </div>
                                <div className="flex-grow space-y-2">
                                    <ProgressBar value={debt.totalAmount - debt.remainingAmount} max={debt.totalAmount} colorClass="bg-success-500" />
                                    <div className="flex justify-between text-sm">
                                        <span>{services.utils.formatCurrency(debt.remainingAmount)} متبقي</span>
                                        <span>{Math.round(progress)}% مكتمل</span>
                                    </div>
                                    <p className="text-sm">الدفعة القادمة: <span className="font-semibold">{services.utils.formatDate(debt.nextPaymentDate)}</span></p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <Button className="w-full" variant="success" onClick={() => handleOpenPaymentModal(debt)}>تسجيل دفعة</Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDebt ? 'تعديل الدين' : 'إضافة دين جديد'}>
                <DebtForm debt={editingDebt} onClose={() => setIsModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="تسجيل دفعة">
                {selectedDebt && <RecordPaymentForm debt={selectedDebt} onClose={() => setIsPaymentModalOpen(false)} />}
            </Modal>
            
            <ConfirmationDialog
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد حذف الدين"
                message={<>
                    <p>هل أنت متأكد من حذف دين "{deleteConfirm?.name}"؟</p>
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">المعاملات المرتبطة بهذا الدين لن يتم حذفها.</p>
                </>}
                confirmText="نعم، احذف"
                confirmVariant="danger"
            />
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 9. Subscriptions Page
// -----------------------------------------------------------------------------------
const SubscriptionForm = ({ subscription, onClose }: { subscription?: Subscription, onClose: () => void }) => {
    const { addSubscription, updateSubscription, categories } = useContext(AppContext);
    const [name, setName] = useState(subscription?.name || '');
    const [amount, setAmount] = useState(subscription?.amount || '');
    const [frequency, setFrequency] = useState<'monthly' | 'yearly'>(subscription?.frequency || 'monthly');
    const [nextPaymentDate, setNextPaymentDate] = useState(subscription?.nextPaymentDate ? subscription.nextPaymentDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(subscription?.category || 'فواتير وخدمات');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const subData = {
            name,
            amount: Number(amount),
            frequency,
            nextPaymentDate: new Date(nextPaymentDate).toISOString(),
            category
        };
        if (subscription) {
            await updateSubscription({ ...subData, id: subscription.id });
        } else {
            await addSubscription(subData);
        }
        onClose();
    };
    
    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="اسم الاشتراك" value={name} onChange={e => setName(e.target.value)} required />
            <Input id="amount" type="number" label="المبلغ" value={amount} onChange={e => setAmount(e.target.value)} required />
             <Select id="category" label="الفئة" value={category} onChange={e => setCategory(e.target.value)} required>
                {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
            <Select id="frequency" label="التكرار" value={frequency} onChange={e => setFrequency(e.target.value as 'monthly' | 'yearly')}>
                <option value="monthly">شهري</option>
                <option value="yearly">سنوي</option>
            </Select>
            <Input id="nextPaymentDate" type="date" label="تاريخ الدفعة القادمة" value={nextPaymentDate} onChange={e => setNextPaymentDate(e.target.value)} required />
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                <Button type="submit" variant="primary">حفظ</Button>
            </div>
        </form>
    );
};


export const SubscriptionsPage = () => {
    const { subscriptions, deleteSubscription, recordSubscriptionPayment, getSubscriptionSuggestions, addSubscription, isLoading, isOnline } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | undefined>(undefined);
    const [deleteConfirm, setDeleteConfirm] = useState<Subscription | null>(null);
    const [paymentConfirm, setPaymentConfirm] = useState<Subscription | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestedSubs, setSuggestedSubs] = useState<Omit<Subscription, 'id'>[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const openAddModal = () => {
        setEditingSub(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (sub: Subscription) => {
        setEditingSub(sub);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            deleteSubscription(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };
    
    const handleConfirmPayment = () => {
        if (paymentConfirm) {
            recordSubscriptionPayment(paymentConfirm.id);
            setPaymentConfirm(null);
        }
    };
    
    const handleFindSubscriptions = async () => {
        setIsSuggesting(true);
        const suggestions = await getSubscriptionSuggestions();
        setSuggestedSubs(suggestions);
        setShowSuggestions(true);
        setIsSuggesting(false);
    };

    const handleAddSuggested = (sub: Omit<Subscription, 'id'>) => {
        addSubscription(sub);
        setSuggestedSubs(current => current.filter(s => s.name !== sub.name));
    };

    const totalMonthlyCost = useMemo(() => {
        return subscriptions.reduce((sum, sub) => {
            return sum + (sub.frequency === 'monthly' ? sub.amount : sub.amount / 12);
        }, 0);
    }, [subscriptions]);
    
    const sortedSubscriptions = useMemo(() => {
        return [...subscriptions].sort((a,b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());
    }, [subscriptions]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold">الاشتراكات المتكررة</h1>
                <Button onClick={openAddModal}><Icon name="plus" /> إضافة اشتراك</Button>
            </div>
            
            <Card>
                <h3 className="text-gray-500 dark:text-gray-400">التكلفة الشهرية الإجمالية</h3>
                <p className="text-2xl font-bold text-danger-500">{services.utils.formatCurrency(totalMonthlyCost)}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">هذا هو تقدير متوسط تكلفة اشتراكاتك شهرياً.</p>
            </Card>

            <Card className="bg-primary-50 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-primary-800 dark:text-primary-200 mb-2">العثور على الاشتراكات المنسية</h2>
                <p className="mb-4">دع الذكاء الاصطناعي يفحص معاملاتك الأخيرة للعثور على دفعات متكررة قد تكون اشتراكات.</p>
                <Button onClick={handleFindSubscriptions} disabled={isSuggesting || !isOnline} title={!isOnline ? "هذه الميزة تتطلب اتصالاً بالإنترنت" : ""}>
                    {isSuggesting ? <Spinner /> : <><Icon name="ai" /> البحث عن الاشتراكات</>}
                </Button>
            </Card>

            {showSuggestions && (
                <Modal isOpen={showSuggestions} onClose={() => setShowSuggestions(false)} title="اقتراحات الاشتراكات">
                    {suggestedSubs.length > 0 ? (
                        <div className="space-y-3">
                            {suggestedSubs.map((sub, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <div>
                                        <p className="font-bold">{sub.name}</p>
                                        <p className="text-sm">{services.utils.formatCurrency(sub.amount)} / {sub.frequency === 'monthly' ? 'شهر' : 'سنة'}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleAddSuggested(sub)}>إضافة</Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 p-4">لم يتم العثور على اشتراكات محتملة جديدة.</p>
                    )}
                </Modal>
            )}

            {isLoading && <div className="flex justify-center"><Spinner /></div>}

             {!isLoading && sortedSubscriptions.length === 0 ? (
                <Card className="text-center py-12">
                    <Icon name="subscriptions" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-xl font-medium">لا توجد اشتراكات مسجلة</h3>
                    <p className="mt-1 text-sm text-gray-500">أضف اشتراكاتك مثل Netflix أو Spotify لتتبعها.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sortedSubscriptions.map(sub => (
                         <Card key={sub.id} className="flex flex-col sm:flex-row justify-between items-center gap-4">
                             <div className="flex-grow">
                                <p className="font-bold text-lg">{sub.name}</p>
                                <p><span className="font-semibold text-danger-500">{services.utils.formatCurrency(sub.amount)}</span> / {sub.frequency === 'monthly' ? 'شهر' : 'سنة'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">التجديد القادم: {services.utils.formatDate(sub.nextPaymentDate)}</p>
                             </div>
                             <div className="flex gap-2">
                                <Button variant="success" onClick={() => setPaymentConfirm(sub)}>تسجيل دفعة</Button>
                                <Button variant="ghost" onClick={() => openEditModal(sub)}><Icon name="edit" className="w-5 h-5"/></Button>
                                <Button variant="ghost" onClick={() => setDeleteConfirm(sub)}><Icon name="trash" className="w-5 h-5 text-danger-500"/></Button>
                             </div>
                         </Card>
                    ))}
                </div>
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSub ? 'تعديل الاشتراك' : 'إضافة اشتراك جديد'}>
                <SubscriptionForm subscription={editingSub} onClose={() => setIsModalOpen(false)} />
            </Modal>

            <ConfirmationDialog 
                isOpen={!!paymentConfirm}
                onClose={() => setPaymentConfirm(null)}
                onConfirm={handleConfirmPayment}
                title="تأكيد الدفع"
                message={<>
                    <p>هل أنت متأكد من تسجيل دفعة لاشتراك "{paymentConfirm?.name}"؟</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">سيتم إنشاء معاملة جديدة وتحديث تاريخ التجديد.</p>
                </>}
                confirmText="نعم، سجل الدفعة"
                confirmVariant="success"
            />
             <ConfirmationDialog 
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={<>
                    <p>هل أنت متأكد من حذف اشتراك "{deleteConfirm?.name}"؟</p>
                    <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">المعاملات المرتبطة بهذا الاشتراك لن يتم حذفها.</p>
                </>}
                confirmText="نعم، احذف"
                confirmVariant="danger"
            />
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 10. Financial Planner Page
// -----------------------------------------------------------------------------------
export const FinancialPlannerPage = () => {
    const { getFinancialPlan, isOnline } = useContext(AppContext);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<FinancialPlanResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        setIsLoading(true);
        setError('');
        setResponse(null);
        
        const result = await getFinancialPlan(query);
        if (result) {
            setResponse(result);
        } else {
            setError('حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.');
        }

        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">المخطط المالي الذكي</h1>

            <Card className="bg-primary-50 dark:bg-gray-800">
                <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
                    <Icon name="lightbulb" className="w-16 h-16 text-primary-500 flex-shrink-0" />
                    <div>
                        <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200">جرّب سيناريوهات "ماذا لو؟"</h2>
                        <p className="text-primary-600 dark:text-primary-300 mt-1">اطرح أسئلة حول مستقبلك المالي وسيقوم "حسابنا الذكي" بتحليل بياناتك لتقديم رؤى مخصصة.</p>
                        <p className="text-sm text-primary-500 dark:text-primary-400 mt-2">مثال: "ماذا لو قمت بزيادة راتبي بـ 1000 درهم؟" أو "هل يمكنني شراء سيارة بقيمة 80,000 درهم؟"</p>
                    </div>
                </div>
            </Card>

            <form onSubmit={handleSubmit}>
                <Card className="flex flex-col sm:flex-row gap-4">
                    <Input
                        id="financial-query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="اطرح سؤالك المالي هنا..."
                        label="سؤالك:"
                    />
                    <Button type="submit" className="self-end !py-3" disabled={isLoading || !isOnline} title={!isOnline ? "هذه الميزة تتطلب اتصالاً بالإنترنت" : ""}>
                        {isLoading ? <Spinner /> : 'تحليل'}
                    </Button>
                </Card>
            </form>

            {isLoading && (
                <Card className="text-center py-12">
                    <Spinner />
                    <p className="mt-4">جاري تحليل السيناريو باستخدام بياناتك المالية...</p>
                </Card>
            )}

            {error && (
                <Card className="border-danger-500 bg-danger-50 dark:bg-danger-900/40 text-danger-700 dark:text-danger-300">
                    <p>{error}</p>
                </Card>
            )}

            {response && (
                <Card className="border-primary-500 animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4">{response.analysisTitle}</h2>
                    <p className="text-lg mb-6">{response.summary}</p>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2">النقاط الرئيسية للتأثير:</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {response.impactPoints.map((point, index) => <li key={index}>{point}</li>)}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-2">توصيات واقتراحات:</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {response.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                        </ul>
                    </div>
                </Card>
            )}
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 11. User Guide Page
// -----------------------------------------------------------------------------------
export const UserGuidePage = () => {
    const sections = [
        {
            title: "لوحة التحكم",
            content: "هي نقطة البداية. توفر لك نظرة شاملة على وضعك المالي، بما في ذلك ملخص شهري للدخل والمصروفات، تنبيهات الميزانية، تذكيرات الدفع، وأحدث معاملاتك. يمكنك أيضاً الحصول على تحليل ذكي لإنفاقك."
        },
        {
            title: "المعاملات",
            content: "سجل جميع معاملاتك المالية هنا، سواء كانت دخلاً أو مصروفاً. يمكنك تعديلها، حذفها، أو البحث وتصفية معاملاتك حسب التاريخ، الفئة، أو المبلغ. يمكنك أيضاً تسجيل المعاملات المتكررة لتسهيل تتبع الفواتير."
        },
        {
            title: "الفئات",
            content: "قم بتنظيم معاملاتك عن طريق إنشاء فئات مخصصة للدخل والمصروفات (مثل 'طعام'، 'مواصلات'، 'راتب'). هذا يساعد في تحليل إنفاقك بدقة في صفحة التقارير."
        },
        {
            title: "الأهداف",
            content: "حدد أهدافك المالية، مثل الادخار لشراء سيارة أو دفعة أولى لمنزل. تتبع تقدمك نحو كل هدف عن طريق إضافة أرصدة إليه، مما يساعدك على البقاء متحمساً."
        },
        {
            title: "الميزانية",
            content: "ضع حدوداً شهرية للإنفاق لكل فئة من فئات المصروفات. سيساعدك التطبيق على تتبع التزامك بالميزانية وسينبهك عند اقترابك من الحد الذي وضعته."
        },
        {
            title: "الديون",
            content: "تتبع ديونك وقروضك. سجل المبلغ الإجمالي، المبلغ المتبقي، والدفعة الشهرية. يمكنك تسجيل دفعاتك بسهولة، وسيقوم التطبيق بتحديث المبلغ المتبقي تلقائياً."
        },
        {
            title: "التقارير",
            content: "احصل على رؤى تفصيلية حول أموالك. تعرض التقارير رسوم بيانية لتحليل دخلك ومصروفاتك حسب الفئة خلال فترات زمنية مختلفة، مما يساعدك على فهم أين تذهب أموالك."
        },
         {
            title: "المخطط المالي الذكي",
            content: "استخدم قوة الذكاء الاصطناعي لتخطيط مستقبلك. اطرح أسئلة مثل 'ماذا لو حصلت على زيادة في الراتب؟' وسيقوم التطبيق بتحليل بياناتك ليعطيك إجابة مخصصة."
        },
        {
            title: "الأمان والخصوصية",
            content: "بياناتك المالية آمنة ومحمية بكلمة مرور. جميع بياناتك يتم تخزينها محلياً على جهازك فقط ولا يتم رفعها إلى أي خوادم خارجية، مما يضمن خصوصيتك الكاملة."
        }
    ];

    const [openSection, setOpenSection] = useState<number | null>(0);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">دليل استخدام التطبيق</h1>
            <div className="space-y-4">
                {sections.map((section, index) => (
                    <Card key={index}>
                        <button
                            className="w-full flex justify-between items-center text-right"
                            onClick={() => setOpenSection(openSection === index ? null : index)}
                        >
                            <h2 className="text-xl font-bold">{section.title}</h2>
                            <Icon name={openSection === index ? "chevronUp" : "chevronDown"} className="w-6 h-6" />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === index ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                             <p className="text-gray-600 dark:text-gray-300">{section.content}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------------
// 12. Settings Page
// -----------------------------------------------------------------------------------
const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
    const { changePassword } = useContext(AppContext);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if(newPassword.length < 8) {
            setError('يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('كلمتا المرور الجديدتان غير متطابقتين.');
            return;
        }

        setIsSubmitting(true);
        const result = await changePassword(oldPassword, newPassword);
        setIsSubmitting(false);

        if (result.success) {
            setSuccess(result.message);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(onClose, 2000); // Close modal after 2 seconds on success
        } else {
            setError(result.message);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="تغيير كلمة المرور">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="oldPassword" type="password" label="كلمة المرور الحالية" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                <Input id="newPassword" type="password" label="كلمة المرور الجديدة" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <Input id="confirmNewPassword" type="password" label="تأكيد كلمة المرور الجديدة" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
                
                {error && <p className="text-danger-500 text-sm">{error}</p>}
                {success && <p className="text-success-500 text-sm">{success}</p>}

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>إلغاء</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner /> : 'تغيير كلمة المرور'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export const SettingsPage = () => {
    const { settings, saveSettings, exportData, archiveData, wipeData, logout } = useContext(AppContext);
    const [localSettings, setLocalSettings] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showWipeModal, setShowWipeModal] = useState(false);
    const [wipeConfirmationText, setWipeConfirmationText] = useState("");
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const isNumberInput = type === 'number';
        setLocalSettings(prev => ({
            ...prev,
            [name]: isNumberInput ? Number(value) : value
        }));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        await saveSettings(localSettings);
        setIsSaving(false);
        alert('تم حفظ الإعدادات بنجاح!');
    };
    
    const ArchiveModal = () => {
        const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');
        const [isArchiving, setIsArchiving] = useState(false);

        const handleArchive = async () => {
            if (!startDate || !endDate) {
                alert('يرجى تحديد تاريخ البدء والانتهاء.');
                return;
            }
            setIsArchiving(true);
            const message = await archiveData(startDate, endDate);
            setIsArchiving(false);
            alert(message);
            setShowArchiveModal(false);
        };
        
        return (
            <Modal isOpen={showArchiveModal} onClose={() => setShowArchiveModal(false)} title="أرشفة البيانات القديمة">
                <div className="space-y-4">
                    <p>سيتم تجميع المعاملات (غير المتكررة) ضمن النطاق الزمني المحدد في معاملات ملخصة لكل فئة، وسيتم حذف المعاملات الأصلية لتخفيف حجم البيانات.</p>
                     <div className="flex gap-4">
                        <Input id="startDate" type="date" label="من تاريخ" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <Input id="endDate" type="date" label="إلى تاريخ" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowArchiveModal(false)}>إلغاء</Button>
                        <Button variant="primary" onClick={handleArchive} disabled={isArchiving}>
                            {isArchiving ? <Spinner /> : "بدء الأرشفة"}
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    };

    const handleWipeData = async () => {
        if (wipeConfirmationText === "حذف كل شيء") {
            await wipeData();
            alert("تم حذف جميع البيانات بنجاح. سيتم الآن تسجيل خروجك.");
            // After wiping, the auth state is gone, so logging out will take user to setup screen.
            logout();
        } else {
            alert("النص غير متطابق. لم يتم حذف البيانات.");
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold">الإعدادات</h1>

            <Card>
                <h2 className="text-xl font-bold mb-4">المعلومات الشخصية</h2>
                <div className="space-y-4">
                    <Input id="name" name="name" label="الاسم" value={localSettings.name} onChange={handleChange} />
                    <Input id="email" name="email" type="email" label="البريد الإلكتروني (اختياري)" value={localSettings.email} onChange={handleChange} />
                    <Input id="monthlyIncome" name="monthlyIncome" type="number" label="الدخل الشهري التقريبي (د.م)" value={localSettings.monthlyIncome} onChange={handleChange} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        يستخدم الدخل الشهري في حسابات مؤشر الصحة المالية.
                    </p>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">الأمان</h2>
                <div className="space-y-4">
                    <Input 
                        id="autoLockMinutes" 
                        name="autoLockMinutes" 
                        type="number" 
                        label="قفل تلقائي بعد (دقائق)" 
                        value={localSettings.autoLockMinutes} 
                        onChange={handleChange} 
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        سيتم قفل التطبيق تلقائيًا بعد فترة من عدم النشاط. أدخل 0 لتعطيل هذه الميزة.
                    </p>
                    <div className="pt-2">
                        <Button variant="secondary" onClick={() => setShowChangePasswordModal(true)}>
                            <Icon name="shield"/> تغيير كلمة المرور
                        </Button>
                    </div>
                </div>
            </Card>
            
            <Card>
                <h2 className="text-xl font-bold mb-4">إدارة البيانات</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="secondary" onClick={exportData}>
                        <Icon name="file"/> تصدير البيانات (CSV)
                    </Button>
                     <Button variant="secondary" onClick={() => setShowArchiveModal(true)}>
                        <Icon name="archive"/> أرشفة البيانات القديمة
                    </Button>
                     <Button variant="danger" onClick={() => setShowWipeModal(true)}>
                        <Icon name="trash"/> مسح جميع البيانات
                    </Button>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                     {isSaving ? <Spinner/> : 'حفظ الإعدادات'}
                </Button>
            </div>
            
            {showChangePasswordModal && <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />}
            {showArchiveModal && <ArchiveModal />}

            <ConfirmationDialog 
                isOpen={showWipeModal}
                onClose={() => setShowWipeModal(false)}
                onConfirm={handleWipeData}
                title="تحذير: مسح جميع البيانات"
                confirmText="نعم، متأكد وأريد الحذف"
                confirmVariant="danger"
                message={
                    <div className="space-y-3">
                        <p>أنت على وشك حذف جميع بياناتك نهائياً من هذا الجهاز، بما في ذلك المعاملات، الأهداف، الميزانيات، وكل شيء آخر.</p>
                        <p className="font-bold">لا يمكن التراجع عن هذا الإجراء إطلاقاً.</p>
                        <p>للتأكيد، يرجى كتابة "حذف كل شيء" في المربع أدناه:</p>
                        <Input
                            id="wipe-confirm"
                            value={wipeConfirmationText}
                            onChange={(e) => setWipeConfirmationText(e.target.value)}
                            placeholder="حذف كل شيء"
                         />
                    </div>
                }
            />
        </div>
    );
};
