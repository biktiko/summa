import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard, DollarSign, PieChart, TrendingUp, TrendingDown,
    CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownRight, Filter,
    Download, Settings, CheckSquare, Eye, EyeOff, Trash2, X, ChevronDown,
    Calendar, Calculator, Edit3, Save as SaveIcon, Maximize2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

// --- Helper Components ---

const CustomTooltip = ({ active, payload, label, selectedDate, getMonthLabel, formatMoney }) => {
    if (active && payload && payload.length) {
        const filteredPayload = payload.filter(p => Number(p.value) > 0);
        if (filteredPayload.length === 0) return null;
        
        return (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs text-white max-w-[280px]">
                <p className="font-bold mb-2 uppercase tracking-wider text-[10px] text-slate-400">
                    {getMonthLabel ? getMonthLabel(selectedDate) : ''} {label}
                </p>
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                    {filteredPayload.map((p, idx) => (
                        <div key={idx} className="flex justify-between gap-4 items-center">
                            <span className="flex items-center gap-1.5 font-semibold text-slate-300 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
                                {p.name}
                            </span>
                            <span className="font-mono font-bold">{formatMoney ? formatMoney(p.value) : p.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const StatCard = ({ title, amount, subtext, icon, color, isNegative, onClick, formatMoney }) => {
    const Icon = icon;
    return (
        <div onClick={onClick} className={`bg-white shadow-sm border border-slate-200/40 border border-slate-200 p-6 rounded-2xl flex items-start justify-between relative overflow-hidden group cursor-pointer hover:border-slate-300 transition-all`}>
            <div className={`absolute top-0 right-0 p-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20`} style={{ backgroundColor: color }} />
            <div className="relative z-10">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</h3>
                <div className="text-2xl font-black text-slate-800 mb-2">
                    {formatMoney ? formatMoney(amount) : `$${amount.toLocaleString()}`}
                </div>
                {subtext && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold opacity-70`}>
                        <span style={{ color: isNegative ? '#ef4444' : '#10b981' }}>{subtext}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl bg-white shadow-sm border border-slate-300 ${isNegative ? 'text-red-500' : 'text-slate-800'}`} style={{ color: color }}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
};

const BudgetRow = ({ item, isExpense, actualAmount = 0, onEdit, onDelete, currencySymbol = '$' }) => {
    // Calculations
    const amount = Number(item.amount) || 0;
    const period = Number(item.period) || 30; // Default to monthly if 0/undefined
    const activeMonths = item.activeMonths || Array.from({length:12},(_,i)=>i);
    
    // Normalized to Monthly (30 days)
    const plannedMonthly = (amount * 30) / period;
    
    let percent = plannedMonthly > 0 ? (actualAmount / plannedMonthly) * 100 : 0;
    
    // Status text
    let statusText = '';
    let statusColor = '';
    let progressColor = item.color || (isExpense ? '#ef4444' : '#10b981');
    
    if (plannedMonthly === 0) {
        statusText = 'Unplanned';
        statusColor = 'text-slate-400';
        percent = actualAmount > 0 ? 100 : 0;
        progressColor = item.color || '#94a3b8';
    } else if (isExpense) {
        if (percent > 100) {
            statusText = `Overbudget by ${currencySymbol}${(actualAmount - plannedMonthly).toLocaleString(undefined, {maximumFractionDigits:0})}`;
            statusColor = 'text-red-500';
            progressColor = '#ef4444'; // Red alert
        } else {
            statusText = `${(100 - percent).toFixed(0)}% Left`;
            statusColor = 'text-slate-500';
        }
    } else {
        if (percent >= 100) {
            statusText = 'Goal Reached!';
            statusColor = 'text-green-500';
            progressColor = '#10b981'; // Green success
        } else {
            statusText = `${percent.toFixed(0)}% Achieved`;
            statusColor = 'text-slate-500';
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-white/40 border border-slate-200 rounded-2xl hover:bg-white hover:shadow-md transition-all group text-xs relative overflow-hidden">
            <div className="md:col-span-3 flex items-center gap-3">
                <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                    style={{ backgroundColor: (item.color || '#666') + '20', color: item.color || '#666' }}
                >
                    {item.label?.[0]}
                </div>
                <div className="min-w-0">
                    <div className="font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis text-sm">{item.label}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{period === 30 ? 'Monthly' : period === 365 ? 'Yearly' : period === 7 ? 'Weekly' : `${period} Days`}</div>
                </div>
            </div>

            <div className="md:col-span-3 text-slate-800 font-bold hidden md:block pl-4 border-l border-slate-200/60">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Budget Limit</div>
                {plannedMonthly > 0 ? (
                    <div className="text-sm">{currencySymbol}{plannedMonthly.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-[10px] text-slate-400 font-normal">/ mo</span></div>
                ) : (
                    <div className="text-sm italic text-slate-400">Not set</div>
                )}
            </div>

            <div className="md:col-span-6 flex flex-col justify-center pr-8 md:pr-12">
                <div className="flex justify-between items-end mb-1.5 text-[10px] uppercase font-bold tracking-wider">
                    <div className="text-slate-500">
                        Actual: <span className="text-slate-800 text-xs">{currencySymbol}{actualAmount.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                    </div>
                    <div className={statusColor}>
                        {statusText}
                    </div>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: progressColor }} 
                    />
                </div>
            </div>

            {/* Actions overlay */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 shadow-sm">
                 <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                 <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

const CURRENCIES = {
    AMD: { symbol: '֏', label: 'AMD', rate: 1 },
    USD: { symbol: '$', label: 'USD', rate: 0.0025 }, // Dummy rates for display if needed, but we typically store in base currency
    EUR: { symbol: '€', label: 'EUR', rate: 0.0023 },
    RUB: { symbol: '₽', label: 'RUB', rate: 0.24 }
};

const FinanceModule = ({
    userData,
    updateUser,
    transactionsActions, categoriesActions, accountsActions,
    viewMode,
    activeView, setActiveView
}) => {


    // --- State ---
    const [dashboardTab, setDashboardTab] = useState('budget'); // overview | budget | history
    const [isAddingTransaction, setIsAddingTransaction] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [analyticsSource, setAnalyticsSource] = useState('actual'); // 'actual' | 'budget'

    // Currency Persistence
    const currentCurrencyCode = userData.gameplaySettings?.currency || 'AMD';
    const setCurrency = (code) => updateUser({ gameplaySettings: { ...userData.gameplaySettings, currency: code } });
    const currencySymbol = CURRENCIES[currentCurrencyCode]?.symbol || '֏';
    const formatMoney = (amount) => `${currencySymbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    // --- Helpers ---
    const getMonthLabel = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const adjustMonth = (delta) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedDate(newDate);
    };

    // Category Management State
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editingCategoryData, setEditingCategoryData] = useState(null);

    // Account Management State
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [editingAccountData, setEditingAccountData] = useState(null);
    const [selectedAnalyticAccounts, setSelectedAnalyticAccounts] = useState(null);

    // Category dropdown search state
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [categorySearchQuery, setCategorySearchQuery] = useState('');

    // Analytics Chart Expansion
    const [expandedChart, setExpandedChart] = useState(null);

    // History Filters
    const [historyFilter, setHistoryFilter] = useState({ categoryId: 'all', type: 'all' });

    // Daily Spending Chart Filters
    const [dailyChartCategoryFilter, setDailyChartCategoryFilter] = useState('all');

    // Transaction Management State
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'expense',
        categoryId: '',
        accountId: '',
        toAccountId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // --- Data Processing (Month-Aware) ---
    const transactions = useMemo(() => userData.transactions || [], [userData.transactions]);
    const categories = useMemo(() => userData.categories || [], [userData.categories]);
    const accounts = useMemo(() => userData.accounts || [], [userData.accounts]);

    const filterAccountsList = useMemo(() => {
        const list = [...accounts];
        const hasLegacy = transactions.some(t => !t.accountId);
        if (hasLegacy) {
            list.push({ id: 'legacy', label: 'Unallocated', color: '#64748b' });
        }
        return list;
    }, [accounts, transactions]);

    const activeAnalyticAccountIds = useMemo(() => {
        if (selectedAnalyticAccounts === null) {
            return filterAccountsList.map(a => a.id);
        }
        return selectedAnalyticAccounts;
    }, [filterAccountsList, selectedAnalyticAccounts]);
    
    const currentMonthKey = selectedDate.toISOString().slice(0, 7); // "YYYY-MM"

    // 1. Month Actuals
    const monthTransactions = useMemo(() => 
        transactions.filter(t => t.createdAt.startsWith(currentMonthKey)),
        [transactions, currentMonthKey]
    );

    const filteredMonthTransactions = useMemo(() => {
        const list = [];
        monthTransactions.forEach(t => {
            if (t.type === 'transfer') {
                const isSourceSelected = activeAnalyticAccountIds.includes(t.accountId);
                const isDestSelected = activeAnalyticAccountIds.includes(t.toAccountId);
                if (isSourceSelected && !isDestSelected) {
                    list.push({ ...t, type: 'expense', description: `${t.description || 'Transfer'} (Out)` });
                } else if (!isSourceSelected && isDestSelected) {
                    list.push({ ...t, type: 'income', description: `${t.description || 'Transfer'} (In)` });
                }
            } else {
                const accId = t.accountId || 'legacy';
                if (activeAnalyticAccountIds.includes(accId)) {
                    list.push(t);
                }
            }
        });
        return list;
    }, [monthTransactions, activeAnalyticAccountIds]);

    const monthActualIncome = filteredMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const monthActualExpense = filteredMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    // monthNetBalance removed (unused)

    // 2. Global Budget (Projected/Baseline)
    const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

    const calculateMonthlyProjection = (items) => items.reduce((acc, item) => {
        // Filter by Active Month
        const activeMonths = item.activeMonths || Array.from({length: 12}, (_, i) => i);
        if (!activeMonths.includes(selectedDate.getMonth())) return acc;

        const amount = Number(item.amount) || 0;
        const period = Number(item.period) || 30;
        return acc + ((amount * 30) / period);
    }, 0);

    const projectedMonthlyIncome = calculateMonthlyProjection(incomeCategories);
    const projectedMonthlyExpense = calculateMonthlyProjection(expenseCategories);
    const projectedFreeCashFlow = projectedMonthlyIncome - projectedMonthlyExpense;
    // burnRateDaily removed (unused)

    // 3. Analytics Data Source Switcher
    const activeIncome = analyticsSource === 'actual' ? monthActualIncome : projectedMonthlyIncome;
    const activeExpense = analyticsSource === 'actual' ? monthActualExpense : projectedMonthlyExpense;
    const activeBalance = activeIncome - activeExpense;

    // Calculate Account Balances
    const getAccountBalance = React.useCallback((accountId) => {
        const account = accounts.find(a => a.id === accountId);
        if (!account) return 0;
        let balance = Number(account.initialBalance) || 0;
        transactions.forEach(t => {
            if (t.accountId === accountId) {
                if (t.type === 'income') balance += Number(t.amount);
                else if (t.type === 'expense') balance -= Number(t.amount);
                else if (t.type === 'transfer') balance -= Number(t.amount);
            }
            if (t.toAccountId === accountId && t.type === 'transfer') {
                balance += Number(t.amount);
            }
        });
        return balance;
    }, [accounts, transactions]);

    const totalCurrentLiquidity = useMemo(() => {
        let balance = 0;
        activeAnalyticAccountIds.forEach(accId => {
            if (accId === 'legacy') {
                balance += transactions.filter(t => !t.accountId).reduce((acc, t) => acc + (t.type === 'income' ? 1 : -1) * Number(t.amount), 0);
            } else {
                balance += getAccountBalance(accId);
            }
        });
        return balance;
    }, [activeAnalyticAccountIds, getAccountBalance, transactions]);

    // 4. Pie Chart Data (Dynamic)
    const categoryBreakdown = useMemo(() => {
        if (analyticsSource === 'actual') {
            const map = {};
            filteredMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
                const catId = t.categoryId || 'uncategorized';
                map[catId] = (map[catId] || 0) + Number(t.amount);
            });
            return Object.keys(map).map(id => {
                const cat = categories.find(c => c.id === id);
                return { id, name: cat ? cat.label : 'Other', value: map[id], color: cat ? cat.color : '#555' };
            }).filter(i => i.value > 0);
        } else {
            // Budget Source
            return expenseCategories.map(c => ({
                id: c.id,
                name: c.label,
                value: (Number(c.amount) * 30) / (Number(c.period) || 30),
                color: c.color
            })).filter(i => i.value > 0);
        }
    }, [analyticsSource, monthTransactions, categories, expenseCategories]);

    // 5. Daily Bar Chart (Month View)
    const dailyActivity = useMemo(() => {
        if (analyticsSource === 'budget') return []; // Budget has no daily distribution
        
        const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        const days = [];
        for(let i=1; i<=daysInMonth; i++) {
            const dayStr = `${currentMonthKey}-${String(i).padStart(2, '0')}`;
            const dayData = { day: String(i), income: 0, expense: 0, fullDate: dayStr };
            
            // Filter transactions for this day
            const dayTransactions = filteredMonthTransactions.filter(t => 
                t.createdAt.startsWith(dayStr) && 
                (dailyChartCategoryFilter === 'all' || t.categoryId === dailyChartCategoryFilter)
            );
            
            dayTransactions.forEach(t => {
                const amount = Number(t.amount) || 0;
                const cat = categories.find(c => c.id === t.categoryId);
                const categoryLabel = cat ? cat.label : 'Other';
                
                if (t.type === 'income') {
                    dayData.income += amount;
                    dayData[`IN_${categoryLabel}`] = (dayData[`IN_${categoryLabel}`] || 0) + amount;
                } else if (t.type === 'expense') {
                    dayData.expense += amount;
                    dayData[`OUT_${categoryLabel}`] = (dayData[`OUT_${categoryLabel}`] || 0) + amount;
                }
            });
            
            days.push(dayData);
        }
        return days;
    }, [analyticsSource, filteredMonthTransactions, currentMonthKey, selectedDate, dailyChartCategoryFilter, categories]);


    // --- Actions ---

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        if (!editingAccountData.label) return;

        const payload = {
            ...editingAccountData,
            initialBalance: parseFloat(editingAccountData.initialBalance) || 0
        };

        if (payload.id) {
            await accountsActions.update(payload.id, payload);
        } else {
            await accountsActions.add(payload);
        }
        setIsEditingAccount(false);
        setEditingAccountData(null);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!editingCategoryData.label) return;

        const payload = {
            ...editingCategoryData,
            amount: parseFloat(editingCategoryData.amount) || 0,
            period: parseInt(editingCategoryData.period) || 30,
            dayOfTransfer: parseInt(editingCategoryData.dayOfTransfer) || 1
        };

        if (payload.id) {
            await categoriesActions.update(payload.id, payload);
        } else {
            await categoriesActions.add(payload);
        }
        setIsEditingCategory(false);
        setEditingCategoryData(null);
    };
    
    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!newTransaction.amount) return;

        if (newTransaction.type === 'transfer' && newTransaction.accountId === newTransaction.toAccountId) {
            alert("Source and Destination accounts must be different.");
            return;
        }

        let description = newTransaction.description;
        if (!description || !description.trim()) {
            if (newTransaction.type === 'transfer') {
                const fromAcc = accounts.find(a => a.id === newTransaction.accountId);
                const toAcc = accounts.find(a => a.id === newTransaction.toAccountId);
                description = `Transfer ${fromAcc?.label || ''} ➔ ${toAcc?.label || ''}`;
            } else {
                const cat = categories.find(c => c.id === newTransaction.categoryId);
                description = cat ? cat.label : 'Transaction';
            }
        }

        const payload = {
            ...newTransaction,
            description,
            amount: parseFloat(newTransaction.amount),
            createdAt: new Date(newTransaction.date).toISOString()
        };

        if (newTransaction.id) {
            await transactionsActions.update(newTransaction.id, payload);
        } else {
            await transactionsActions.add(payload);
        }

        setIsAddingTransaction(false);
        setNewTransaction({ ...newTransaction, id: undefined, amount: '', description: '', toAccountId: '' });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-2 md:pb-6 mb-4 md:mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-4">
                        {/* No Title Here */}
                        
                        {/* Currency Selector */}
                        <div className="relative group">
                            <button className="text-xl font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                {CURRENCIES[currentCurrencyCode].symbol} <span className="text-[10px] uppercase align-top">{currentCurrencyCode}</span>
                            </button>
                            <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl overflow-hidden hidden group-hover:block w-32 z-50 shadow-xl">
                                {Object.entries(CURRENCIES).map(([code, info]) => (
                                    <button 
                                        key={code}
                                        onClick={() => setCurrency(code)}
                                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-200 ${currentCurrencyCode === code ? 'text-green-500' : 'text-slate-500'}`}
                                    >
                                        {info.symbol} {code}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Month Selector */}
                    <div className="flex items-center gap-4 mt-2">
                        <button onClick={() => adjustMonth(-1)} className="text-slate-500 hover:text-blue-600 transition-colors"><ArrowDownRight className="w-4 h-4 rotate-45" /></button>
                        <span className="text-sm font-mono font-bold text-green-500 uppercase tracking-widest min-w-[140px] text-center">
                            {getMonthLabel(selectedDate)}
                        </span>
                        <button onClick={() => adjustMonth(1)} className="text-slate-500 hover:text-blue-600 transition-colors"><ArrowUpRight className="w-4 h-4 rotate-45" /></button>
                    </div>
                </div>

                {/* Navigation Tabs - Match Task/Portfolio Style */}
                 <div className="flex bg-white shadow-sm border border-slate-200/50 p-1 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar w-full md:w-auto self-start md:self-end">
                    {[
                        { id: 'history', label: 'History', color: 'bg-blue-600 text-slate-800 shadow-lg' },
                        { id: 'overview', label: 'Analytics', color: 'bg-green-600 text-slate-800 shadow-lg' },
                        { id: 'budget', label: 'Planning', color: 'bg-amber-600 text-slate-800 shadow-lg' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setDashboardTab(t.id)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${dashboardTab === t.id ? t.color : 'text-slate-500 hover:text-blue-600'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 flex flex-col">
                    {/* Dashboard Nav - Replaced by Top Header Nav */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 mb-8 gap-4">
                        <div className="hidden md:flex items-center gap-8 overflow-x-auto w-full md:w-auto">
                            {/* Hidden on desktop too as they are now in header? Or keep as sub-nav? 
                                User asked for "same style as Portfolio", which has them in header. 
                                So we should probably remove this secondary nav or make it just for the toggle if any.
                                Actually, in the previous code, this was the primary way to switch tabs. 
                                Now we have the buttons in the header (lines 294-308).
                                So we can remove this block or hide it. 
                                Let's remove the duplicate tabs and keep the analytics source toggle.
                            */}
                        </div>
                        
                        {/* Source Toggle for Analytics */}
                        {dashboardTab === 'overview' && (
                            <div className="flex bg-white shadow-sm border border-slate-200 rounded-lg p-1 border border-slate-200 mb-1 self-start md:self-auto w-full md:w-auto">
                                <button onClick={() => setAnalyticsSource('actual')} className={`flex-1 md:flex-none px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'actual' ? 'bg-green-600 text-slate-800' : 'text-slate-500'}`}>Actuals</button>
                                <button onClick={() => setAnalyticsSource('budget')} className={`flex-1 md:flex-none px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'budget' ? 'bg-amber-600 text-slate-800' : 'text-slate-500'}`}>Budget Plan</button>
                            </div>
                        )}
                    </div>

                    {/* --- BUDGET VIEW (Planning) --- */}
                    {dashboardTab === 'budget' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in">
                            {/* Projections based on PLAN */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <StatCard title="Projected Income" amount={projectedMonthlyIncome} subtext="Baseline Configuration" icon={TrendingUp} color="#3b82f6" formatMoney={formatMoney} />
                                <StatCard title="Projected Expense" amount={projectedMonthlyExpense} subtext="Baseline Configuration" icon={TrendingDown} color="#ef4444" isNegative formatMoney={formatMoney} />
                                <StatCard title="Projected Cash Flow" amount={projectedFreeCashFlow} subtext="Potential Saving" icon={Wallet} color="#10b981" formatMoney={formatMoney} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Income Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-500/20">
                                        <h3 className="text-sm font-black text-green-500 uppercase tracking-widest">Recurring Income Sources</h3>
                                        <button 
                                            onClick={() => { setEditingCategoryData({ type: 'income', label: '', amount: '', period: 30, color: '#10b981' }); setIsEditingCategory(true); }}
                                            className="p-2 bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-blue-600 rounded-lg transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-4">
                                        <div className="col-span-3">Source</div>
                                        <div className="col-span-3 pl-2">Budget Plan</div>
                                        <div className="col-span-6">Actual vs Planned Progress</div>
                                    </div>
                                    <div className="space-y-3">
                                        {incomeCategories.map(cat => (
                                            <BudgetRow 
                                                key={cat.id} item={cat} isExpense={false} 
                                                onEdit={(item) => { setEditingCategoryData(item); setIsEditingCategory(true); }}
                                                onDelete={categoriesActions.delete}
                                                currencySymbol={currencySymbol}
                                                actualAmount={filteredMonthTransactions.filter(t => t.type === 'income' && t.categoryId === cat.id).reduce((sum, t) => sum + Number(t.amount), 0)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Expense Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-red-900/10 p-4 rounded-xl border border-red-500/20">
                                        <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Recurring Expenses</h3>
                                        <button 
                                            onClick={() => { setEditingCategoryData({ type: 'expense', label: '', amount: '', period: 30, color: '#ef4444' }); setIsEditingCategory(true); }}
                                            className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-blue-600 rounded-lg transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-4">
                                        <div className="col-span-3">Category</div>
                                        <div className="col-span-3 pl-2">Budget Limit</div>
                                        <div className="col-span-6">Actual vs Planned Progress</div>
                                    </div>
                                    <div className="space-y-3">
                                        {expenseCategories.map(cat => (
                                            <BudgetRow 
                                                key={cat.id} item={cat} isExpense={true} 
                                                onEdit={(item) => { setEditingCategoryData(item); setIsEditingCategory(true); }}
                                                onDelete={categoriesActions.delete}
                                                currencySymbol={currencySymbol}
                                                actualAmount={filteredMonthTransactions.filter(t => t.type === 'expense' && t.categoryId === cat.id).reduce((sum, t) => sum + Number(t.amount), 0)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- HISTORY VIEW --- */}
                    {dashboardTab === 'history' && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                            {/* Accounts Section */}
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {accounts.map(acc => (
                                    <div key={acc.id} onClick={() => { setEditingAccountData(acc); setIsEditingAccount(true); }} className="min-w-[150px] bg-white shadow-sm border border-slate-200 p-4 rounded-xl cursor-pointer hover:border-slate-300 transition-all flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-12 rounded-full blur-2xl opacity-10" style={{ backgroundColor: acc.color || '#555' }} />
                                        <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color || '#555' }}></div>
                                            {acc.label}
                                        </div>
                                        <div className="text-xl font-black text-slate-800 relative z-10">
                                            {formatMoney(getAccountBalance(acc.id))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => { setEditingAccountData({ label: '', initialBalance: 0, color: '#3b82f6' }); setIsEditingAccount(true); }} className="min-w-[150px] bg-slate-50 border border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all">
                                    <Plus className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">New Account</span>
                                </button>
                            </div>

                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm border border-slate-200/40 p-4 rounded-xl border border-slate-200 gap-4">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shrink-0">Transactions • {getMonthLabel(selectedDate)}</h3>
                                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1"><Filter className="w-3 h-3"/></span>
                                    <select 
                                        value={historyFilter.type}
                                        onChange={e => setHistoryFilter({...historyFilter, type: e.target.value, categoryId: 'all'})}
                                        className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                        <option value="transfer">Transfers</option>
                                    </select>
                                    {historyFilter.type !== 'transfer' && (
                                        <select 
                                            value={historyFilter.categoryId}
                                            onChange={e => setHistoryFilter({...historyFilter, categoryId: e.target.value})}
                                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 max-w-[150px] md:max-w-[200px] truncate"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.filter(c => historyFilter.type === 'all' || c.type === historyFilter.type).map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>
                                    )}
                                    {(historyFilter.type !== 'all' || historyFilter.categoryId !== 'all') && (
                                        <button onClick={() => setHistoryFilter({type:'all', categoryId:'all'})} className="text-[10px] text-blue-500 hover:underline font-bold px-2 shrink-0">Clear</button>
                                    )}
                                    <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>
                                    <button 
                                        onClick={() => setIsAddingTransaction(true)}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ml-auto md:ml-0"
                                    >
                                        <Plus className="w-4 h-4" /> Log
                                    </button>
                                </div>
                            </div>
                            {(() => {
                                const filteredList = monthTransactions.filter(t => {
                                    if (historyFilter.type !== 'all' && t.type !== historyFilter.type) return false;
                                    if (historyFilter.categoryId !== 'all' && t.categoryId !== historyFilter.categoryId) return false;
                                    return true;
                                }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

                                const filteredIncome = filteredList.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                                const filteredExpense = filteredList.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
                                const filteredNet = filteredIncome - filteredExpense;

                                return (
                                    <>
                                        {/* Summary Stats for Current Filter/Slice */}
                                        <div className="grid grid-cols-3 gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-center">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Income</div>
                                                <div className="text-base font-black text-green-600 mt-1">+{formatMoney(filteredIncome)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Expenses</div>
                                                <div className="text-base font-black text-red-600 mt-1">-{formatMoney(filteredExpense)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Net</div>
                                                <div className={`text-base font-black mt-1 ${filteredNet >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {filteredNet >= 0 ? '+' : ''}{formatMoney(filteredNet)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mt-4">
                                            {filteredList.length === 0 ? (
                                                <div className="text-center py-20 text-slate-500 italic border border-dashed border-slate-300 rounded-xl">
                                                    No transactions found matching filters
                                                </div>
                                            ) : (
                                                (() => {
                                                    // Group by date
                                                    const groups = {};
                                                    filteredList.forEach(t => {
                                                        const dateStr = new Date(t.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                                        if (!groups[dateStr]) {
                                                            groups[dateStr] = {
                                                                dateLabel: dateStr,
                                                                rawDate: new Date(t.createdAt),
                                                                income: 0,
                                                                expense: 0,
                                                                transactions: []
                                                            };
                                                        }
                                                        if (t.type === 'income') {
                                                            groups[dateStr].income += Number(t.amount);
                                                        } else if (t.type === 'expense') {
                                                            groups[dateStr].expense += Number(t.amount);
                                                        }
                                                        groups[dateStr].transactions.push(t);
                                                    });

                                                    const sortedGroups = Object.values(groups).sort((a, b) => b.rawDate - a.rawDate);

                                                    return sortedGroups.map((group, groupIdx) => {
                                                        const dailyNet = group.income - group.expense;
                                                        return (
                                                            <div key={groupIdx} className="space-y-2">
                                                                {/* Day Header with Daily Sums */}
                                                                <div className="bg-slate-100/80 backdrop-blur px-4 py-2 rounded-xl border border-slate-200/50 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                                                                    <span>{group.dateLabel}</span>
                                                                    <div className="flex gap-3 font-mono">
                                                                        <span className={dailyNet >= 0 ? 'text-green-700' : 'text-red-600'}>
                                                                            SUM: {dailyNet >= 0 ? '+' : ''}{formatMoney(dailyNet)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Day's Transactions */}
                                                                <div className="space-y-2 pl-2 md:pl-4 border-l-2 border-slate-200/70">
                                                                    {group.transactions.map(t => {
                                                                        const cat = categories.find(c => c.id === t.categoryId);
                                                                        const fromAcc = accounts.find(a => a.id === t.accountId);
                                                                        const toAcc = accounts.find(a => a.id === t.toAccountId);

                                                                        return (
                                                                            <div key={t.id} className="group relative flex justify-between items-center p-4 bg-white/20 border border-slate-200 rounded-xl text-sm hover:bg-slate-100 transition-all">
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.type === 'transfer' ? '#3b82f6' : (cat?.color || '#555') }} />
                                                                                    <div>
                                                                                        <div className="font-bold text-slate-800">{t.description || (t.type === 'transfer' ? 'Transfer' : 'Unknown')}</div>
                                                                                        <div className="text-[10px] text-slate-500 uppercase">
                                                                                            {new Date(t.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                                                            {t.type === 'transfer' ? (
                                                                                                ` • Transfer ${fromAcc?.label || 'Unknown'} ➔ ${toAcc?.label || 'Unknown'}`
                                                                                            ) : (
                                                                                                ` • ${cat?.label || 'Uncategorized'} • ${fromAcc?.label || 'Cash'}`
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className={`font-mono font-bold ${t.type === 'income' ? 'text-green-500' : t.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                                                                                    {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '⇄ '}{formatMoney(Math.abs(t.amount))}
                                                                                </div>
                                                                                
                                                                                {/* Edit/Delete Overlay */}
                                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg border border-slate-300 shadow-xl">
                                                                                     <button onClick={() => { setNewTransaction({...t, date: t.createdAt.split('T')[0]}); setIsAddingTransaction(true); }} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600"><Edit3 className="w-3 h-3" /></button>
                                                                                     <button onClick={() => transactionsActions.delete(t.id)} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                     {/* --- ANALYTICS VIEW --- */}
                     {dashboardTab === 'overview' && (
                         <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                             
                             {/* Account Filter */}
                             <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">Filter Accounts:</span>
                                 {filterAccountsList.map(acc => {
                                     const isSelected = activeAnalyticAccountIds.includes(acc.id);
                                     return (
                                         <button
                                             key={acc.id}
                                             onClick={() => {
                                                 if (isSelected) {
                                                     setSelectedAnalyticAccounts(activeAnalyticAccountIds.filter(id => id !== acc.id));
                                                 } else {
                                                     setSelectedAnalyticAccounts([...activeAnalyticAccountIds, acc.id]);
                                                 }
                                             }}
                                             className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                                 isSelected 
                                                 ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                                                 : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                             }`}
                                         >
                                             <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: acc.color }} />
                                             {acc.label}
                                         </button>
                                     );
                                 })}
                                 <button 
                                     onClick={() => setSelectedAnalyticAccounts(null)}
                                     className="text-[10px] font-bold text-blue-600 hover:underline ml-auto px-2"
                                 >
                                     Reset
                                 </button>
                             </div>

                             {/* Stats based on Toggle */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <StatCard 
                                    title={analyticsSource === 'actual' ? "Actual Income" : "Planned Income"} 
                                    amount={activeIncome} 
                                    subtext={getMonthLabel(selectedDate)} 
                                    icon={TrendingUp} color="#3b82f6" formatMoney={formatMoney} 
                                />
                                <StatCard 
                                    title={analyticsSource === 'actual' ? "Actual Expense" : "Planned Expense"} 
                                    amount={activeExpense} 
                                    subtext={analyticsSource === 'actual' ? "Real Spending" : "Projected Burn"} 
                                    icon={TrendingDown} color="#ef4444" isNegative formatMoney={formatMoney} 
                                />
                                <StatCard 
                                    title="Monthly Net Flow" 
                                    amount={activeBalance} 
                                    subtext={activeBalance > 0 ? "Surplus" : "Deficit"} 
                                    icon={Wallet} color={activeBalance >= 0 ? "#10b981" : "#ef4444"} formatMoney={formatMoney} 
                                />
                                <StatCard 
                                    title="Current Balance" 
                                    amount={totalCurrentLiquidity} 
                                    subtext="All Time" 
                                    icon={PieChart} color="#8b5cf6" formatMoney={formatMoney} 
                                />
                            </div>

                             <div className="grid md:grid-cols-2 gap-6">
                                {/* Pie Chart */}
                                <div className="bg-white shadow-sm border border-slate-200/40 p-6 rounded-2xl border border-slate-200 h-[400px] min-h-[400px] flex flex-col relative group">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <PieChart className="w-4 h-4 text-purple-500"/> {analyticsSource === 'actual' ? 'Spending Breakdown (Actual)' : 'Budget Allocation (Planned)'}
                                        </h3>
                                        <button onClick={() => setExpandedChart('pie')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex-1 w-full h-full min-h-0">
                                    {categoryBreakdown.length > 0 ? (
                                        <ResponsiveContainer width="99%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={categoryBreakdown}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {categoryBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || '#555'} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(val) => formatMoney(val)} />
                                                <Legend />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <span className="text-xs">No data for this view in {getMonthLabel(selectedDate)}</span>
                                        </div>
                                    )}
                                    </div>
                                </div>

                                {/* Daily Spending Bar Chart */}
                                <div className="bg-white shadow-sm border border-slate-200/40 p-6 rounded-2xl border border-slate-200 h-[400px] min-h-[400px] flex flex-col relative group">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500"/> {analyticsSource === 'actual' ? 'Daily Spending Flow' : 'Daily Projection (Not Available)'}
                                        </h3>
                                        {analyticsSource !== 'budget' && dailyActivity.length > 0 && (
                                            <button onClick={() => setExpandedChart('bar')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full h-full min-h-0">
                                    {analyticsSource === 'budget' ? (
                                        <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                                            Budget is averaged daily. Switch to 'Actuals' to see daily transactions.
                                        </div>
                                    ) : dailyActivity.length > 0 ? (
                                        <ResponsiveContainer width="99%" height="100%">
                                            <BarChart data={dailyActivity}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                                <XAxis dataKey="day" stroke="#666" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `${currencySymbol}${val}`} />
                                                <RechartsTooltip content={<CustomTooltip selectedDate={selectedDate} getMonthLabel={getMonthLabel} formatMoney={formatMoney} />} />
                                                {incomeCategories.map(c => (
                                                    <Bar key={c.id} dataKey={`IN_${c.label}`} name={c.label} stackId="income" fill={c.color || '#10b981'} radius={[0, 0, 0, 0]} />
                                                ))}
                                                <Bar dataKey="IN_Other" name="Other Income" stackId="income" fill="#64748b" radius={[0, 0, 0, 0]} />
                                                
                                                {expenseCategories.map(c => (
                                                    <Bar key={c.id} dataKey={`OUT_${c.label}`} name={c.label} stackId="expense" fill={c.color || '#ef4444'} radius={[0, 0, 0, 0]} />
                                                ))}
                                                <Bar dataKey="OUT_Other" name="Other Expense" stackId="expense" fill="#475569" radius={[0, 0, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <span className="text-xs">No transactions found for {getMonthLabel(selectedDate)}</span>
                                        </div>
                                    )}
                                    </div>
                                </div>
                             </div>
                         </div>
                     )}
            </div>


            {/* --- MODALS --- */}

            {/* Category/Budget Modal */}
            {isEditingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="w-full max-w-md bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800 uppercase">
                                {editingCategoryData?.id ? 'Edit Item' : 'New Budget Item'}
                            </h3>
                            <button onClick={() => setIsEditingCategory(false)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:border-blue-500 outline-none"
                                    value={editingCategoryData.label}
                                    onChange={e => setEditingCategoryData({ ...editingCategoryData, label: e.target.value })}
                                    required autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-mono focus:border-blue-500 outline-none"
                                        value={editingCategoryData.amount}
                                        onChange={e => setEditingCategoryData({ ...editingCategoryData, amount: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Period (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-mono focus:border-blue-500 outline-none"
                                        value={editingCategoryData.period}
                                        onChange={e => setEditingCategoryData({ ...editingCategoryData, period: e.target.value })}
                                        placeholder="30"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Active Months</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => (
                                             <button
                                                 key={i}
                                                 type="button"
                                                 onClick={() => {
                                                     const months = editingCategoryData.activeMonths || Array.from({length:12},(_,x)=>x);
                                                     if (months.includes(i)) {
                                                         setEditingCategoryData({...editingCategoryData, activeMonths: months.filter(x=>x!==i)});
                                                     } else {
                                                         setEditingCategoryData({...editingCategoryData, activeMonths: [...months, i]});
                                                     }
                                                 }}
                                                 className={`h-8 rounded text-xs font-bold transition-all border border-slate-200 ${
                                                     (editingCategoryData.activeMonths || Array.from({length:12},(_,x)=>x)).includes(i)
                                                     ? 'bg-white text-black' 
                                                     : 'bg-white text-slate-500 hover:bg-slate-200'
                                                 }`}
                                             >{m}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Day of Transfer</label>
                                    <input
                                        type="number"
                                        max="31" min="1"
                                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-mono focus:border-blue-500 outline-none"
                                        value={editingCategoryData.dayOfTransfer || ''}
                                        onChange={e => setEditingCategoryData({ ...editingCategoryData, dayOfTransfer: e.target.value })}
                                        placeholder="e.g. 15"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Color</label>
                                    <input
                                        type="color"
                                        className="w-full h-[50px] bg-white border border-slate-300 rounded-xl p-1 cursor-pointer"
                                        value={editingCategoryData.color}
                                        onChange={e => setEditingCategoryData({ ...editingCategoryData, color: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-white text-black font-bold uppercase rounded-xl hover:bg-neutral-200 transition-colors mt-4">
                                Save Item
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Account Modal */}
            {isEditingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="w-full max-w-md bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800 uppercase">
                                {editingAccountData?.id ? 'Edit Account' : 'New Account'}
                            </h3>
                            <button type="button" onClick={() => setIsEditingAccount(false)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSaveAccount} className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Account Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 focus:border-blue-500 outline-none"
                                    value={editingAccountData.label}
                                    onChange={e => setEditingAccountData({ ...editingAccountData, label: e.target.value })}
                                    required autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Initial Balance</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 font-mono focus:border-blue-500 outline-none"
                                    value={editingAccountData.initialBalance}
                                    onChange={e => setEditingAccountData({ ...editingAccountData, initialBalance: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Color</label>
                                <input
                                    type="color"
                                    className="w-full h-[50px] bg-white border border-slate-300 rounded-xl p-1 cursor-pointer"
                                    value={editingAccountData.color}
                                    onChange={e => setEditingAccountData({ ...editingAccountData, color: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 mt-4">
                                {editingAccountData?.id && (
                                    <button type="button" onClick={() => { accountsActions.delete(editingAccountData.id); setIsEditingAccount(false); }} className="w-1/3 py-3 bg-red-100 text-red-600 font-bold uppercase rounded-xl hover:bg-red-200 transition-colors">
                                        Delete
                                    </button>
                                )}
                                <button type="submit" className="flex-1 py-3 bg-black text-white font-bold uppercase rounded-xl hover:bg-neutral-800 transition-colors">
                                    Save Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
             
            {/* Transaction Modal */}
            {isAddingTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4 animate-in fade-in">
                     <div className="w-full max-w-md bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800 uppercase">Log Transaction</h3>
                            <button onClick={() => setIsAddingTransaction(false)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div className="flex bg-white shadow-sm border border-slate-200 rounded-xl p-1 border border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTransaction.type === 'expense' ? 'bg-red-500/20 text-red-500' : 'text-slate-500'}`}
                                >Expense</button>
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTransaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'text-slate-500'}`}
                                >Income</button>
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'transfer' })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTransaction.type === 'transfer' ? 'bg-blue-500/20 text-blue-500' : 'text-slate-500'}`}
                                >Transfer</button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 text-lg font-mono focus:border-green-500 outline-none"
                                    value={newTransaction.amount}
                                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grocery"
                                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:border-green-500 outline-none"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                            </div>

                            {newTransaction.type !== 'transfer' ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Account</label>
                                        <select
                                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-green-500"
                                            value={newTransaction.accountId}
                                            onChange={e => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map(a => (
                                                <option key={a.id} value={a.id}>{a.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 col-span-2 relative">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-left text-slate-800 outline-none focus:border-green-500 flex justify-between items-center"
                                                    >
                                                        <span>
                                                            {categories.find(c => c.id === newTransaction.categoryId)?.label || 'Select Category'}
                                                        </span>
                                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                                    </button>
                                                    
                                                    {isCategoryDropdownOpen && (
                                                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 max-h-[200px] overflow-y-auto space-y-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Search category..."
                                                                value={categorySearchQuery}
                                                                onChange={e => setCategorySearchQuery(e.target.value)}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-green-500 mb-1"
                                                                autoFocus
                                                            />
                                                            {categories
                                                                .filter(c => c.type === newTransaction.type)
                                                                .filter(c => c.label.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                                                                .length === 0 ? (
                                                                    <div className="text-[10px] text-slate-500 italic p-2 text-center">No categories found</div>
                                                                ) : (
                                                                    categories
                                                                        .filter(c => c.type === newTransaction.type)
                                                                        .filter(c => c.label.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                                                                        .map(c => (
                                                                            <button
                                                                                key={c.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setNewTransaction({ ...newTransaction, categoryId: c.id });
                                                                                    setIsCategoryDropdownOpen(false);
                                                                                    setCategorySearchQuery('');
                                                                                }}
                                                                                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                                                                            >
                                                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                                                                                {c.label}
                                                                            </button>
                                                                        ))
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    title="Create Category"
                                                    onClick={() => { setIsAddingTransaction(false); setEditingCategoryData({ type: newTransaction.type, label: '', amount: '', period: 30, color: '#10b981' }); setIsEditingCategory(true); }}
                                                    className="p-3 bg-slate-100 border border-slate-200 rounded-xl hover:bg-white/20 text-slate-800 flex items-center justify-center"
                                                >
                                                    <Plus className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">From Account</label>
                                        <select
                                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                                            value={newTransaction.accountId}
                                            onChange={e => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map(a => (
                                                <option key={a.id} value={a.id}>{a.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">To Account</label>
                                        <select
                                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                                            value={newTransaction.toAccountId}
                                            onChange={e => setNewTransaction({ ...newTransaction, toAccountId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map(a => (
                                                <option key={a.id} value={a.id}>{a.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:border-green-500 outline-none"
                                        value={newTransaction.date}
                                        onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 bg-white text-black font-bold uppercase rounded-xl hover:bg-neutral-200 transition-colors mt-4">
                                Log Transaction
                            </button>
                        </form>
                     </div>
                </div>
            )}
            {/* Expanded Chart Modal */}
            {expandedChart && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 animate-in fade-in zoom-in-95 p-4 md:p-8 overflow-hidden">
                    <div className="flex justify-between items-center mb-6 shrink-0 gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                                {expandedChart === 'pie' ? <PieChart className="w-6 h-6 md:w-8 md:h-8 text-purple-500" /> : <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />}
                                {expandedChart === 'pie' ? (analyticsSource === 'actual' ? 'Spending Breakdown (Actual)' : 'Budget Allocation (Planned)') : 'Daily Spending Flow'}
                            </h2>
                            {expandedChart === 'bar' && (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm ml-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category:</span>
                                    <select
                                        value={dailyChartCategoryFilter}
                                        onChange={e => setDailyChartCategoryFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-1 outline-none focus:border-blue-500 max-w-[180px] truncate"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setExpandedChart(null)} className="p-3 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center shrink-0">
                            <X className="w-6 h-6 text-slate-800" />
                        </button>
                    </div>

                    <div className="flex-1 w-full h-full min-h-0 bg-white border border-slate-200 rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden">
                        
                        {expandedChart === 'pie' && categoryBreakdown.length > 0 && (
                            <>
                                {/* Chart Section */}
                                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0 h-[40vh] md:h-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={categoryBreakdown}
                                                cx="50%" cy="50%"
                                                innerRadius="50%" outerRadius="80%"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {categoryBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#555'} stroke="none" />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px' }} itemStyle={{ color: '#fff' }} formatter={(val) => formatMoney(val)} />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Details List Section */}
                                <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto bg-slate-50/50">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 sticky top-0 bg-slate-50/90 backdrop-blur pb-2 z-10">Detailed Breakdown</h3>
                                    <div className="space-y-3">
                                        {categoryBreakdown.slice().sort((a,b) => b.value - a.value).map((item, idx) => {
                                            const total = categoryBreakdown.reduce((sum, i) => sum + i.value, 0);
                                            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                                            const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
                                            const dailyAvg = item.value / daysInMonth;

                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => {
                                                        if (item.id) {
                                                            setHistoryFilter({ categoryId: item.id, type: analyticsSource === 'budget' ? 'expense' : 'all' });
                                                            setDashboardTab('history');
                                                            setExpandedChart(null);
                                                        }
                                                    }}
                                                    className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-purple-300 hover:bg-slate-50 transition-colors group ${item.id ? 'cursor-pointer' : ''}`}
                                                >
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                                        <PieChart className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-bold text-slate-800 truncate pr-2">{item.name}</div>
                                                            <div className="font-black text-slate-800 whitespace-nowrap">{formatMoney(item.value)}</div>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 mb-2">
                                                            <span>{percent}% of total</span>
                                                            <span>~{formatMoney(dailyAvg)} / day</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {expandedChart === 'bar' && dailyActivity.length > 0 && (
                            <div className="flex flex-col w-full h-full">
                                {/* Chart Section */}
                                <div className="w-full h-[40vh] md:h-3/5 p-6 md:p-8 border-b border-slate-200 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dailyActivity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `${currencySymbol}${val}`} tickMargin={8} />
                                            <RechartsTooltip content={<CustomTooltip selectedDate={selectedDate} getMonthLabel={getMonthLabel} formatMoney={formatMoney} />} />
                                            {incomeCategories.map(c => (
                                                <Bar key={c.id} dataKey={`IN_${c.label}`} name={c.label} stackId="income" fill={c.color || '#10b981'} radius={[0, 0, 0, 0]} maxBarSize={40} />
                                            ))}
                                            <Bar dataKey="IN_Other" name="Other Income" stackId="income" fill="#64748b" radius={[0, 0, 0, 0]} maxBarSize={40} />
                                            
                                            {expenseCategories.map(c => (
                                                <Bar key={c.id} dataKey={`OUT_${c.label}`} name={c.label} stackId="expense" fill={c.color || '#ef4444'} radius={[0, 0, 0, 0]} maxBarSize={40} />
                                            ))}
                                            <Bar dataKey="OUT_Other" name="Other Expense" stackId="expense" fill="#475569" radius={[0, 0, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Details List Section */}
                                <div className="w-full h-auto flex-1 p-6 md:p-8 bg-slate-50/50 overflow-y-auto">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 sticky top-0 bg-slate-50/90 backdrop-blur pb-2 z-10">Daily Ledger</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-8">
                                        {dailyActivity.filter(d => d.income > 0 || d.expense > 0).sort((a,b) => parseInt(b.day) - parseInt(a.day)).map((day, idx) => {
                                            const net = day.income - day.expense;
                                            const dayTx = filteredMonthTransactions.filter(t => 
                                                t.createdAt.startsWith(day.fullDate) && 
                                                (dailyChartCategoryFilter === 'all' || t.categoryId === dailyChartCategoryFilter)
                                            );
                                            return (
                                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="text-xs font-black text-slate-800 uppercase bg-slate-100 px-3 py-1 rounded-lg">
                                                            {getMonthLabel(selectedDate)} {day.day}
                                                        </div>
                                                        <div className={`text-xs font-black ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {net >= 0 ? '+' : ''}{formatMoney(net)} Net
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] font-bold bg-slate-50 p-2 rounded-lg">
                                                        <div className="text-green-600 flex flex-col">
                                                            <span className="text-[9px] text-slate-400">IN</span>
                                                            {formatMoney(day.income)}
                                                        </div>
                                                        <div className="text-red-600 flex flex-col text-right">
                                                            <span className="text-[9px] text-slate-400">OUT</span>
                                                            {formatMoney(day.expense)}
                                                        </div>
                                                    </div>
                                                    {dayTx.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
                                                            {dayTx.map(t => {
                                                                const cat = categories.find(c => c.id === t.categoryId);
                                                                return (
                                                                    <div key={t.id} className="flex justify-between items-center text-[10px]">
                                                                        <span className="truncate text-slate-600 flex items-center gap-1.5 max-w-[70%]">
                                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.type === 'transfer' ? '#3b82f6' : (cat?.color || '#94a3b8') }} />
                                                                            <span className="font-medium truncate">{t.description || (t.type === 'transfer' ? 'Transfer' : 'Uncategorized')}</span>
                                                                        </span>
                                                                        <span className={`font-mono font-bold shrink-0 ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                                                                            {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{formatMoney(t.amount)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {dailyActivity.filter(d => d.income > 0 || d.expense > 0).length === 0 && (
                                            <div className="col-span-full text-center p-8 text-slate-400 italic text-sm border border-dashed border-slate-300 rounded-xl">
                                                No activity recorded this month.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceModule;
