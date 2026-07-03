import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard, DollarSign, PieChart, TrendingUp, TrendingDown,
    CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownRight, Filter,
    Download, Settings, CheckSquare, Eye, EyeOff, Trash2, X, ChevronDown,
    Calendar, Calculator, Edit3, Save as SaveIcon, Maximize2, Target, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar, ReferenceLine
} from 'recharts';
import { 
    exportTransactionsToExcel, 
    exportAnalyticsToExcel, 
    exportBudgetToExcel, 
    exportProjectsToExcel 
} from './utils/financeExport';

const DateRangePicker = ({ label, range, setRange, presets }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCustom, setIsCustom] = useState(false);

    let activePreset = presets.find(p => !p.isCustom && p.getRange().start === range.start && p.getRange().end === range.end)?.label;
    if (!activePreset) activePreset = isCustom ? 'Custom Range' : `${new Date(range.start).toLocaleDateString()} - ${new Date(range.end).toLocaleDateString()}`;

    return (
        <div className="flex-[1.5] space-y-1 w-full relative z-40">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold cursor-pointer flex justify-between items-center h-[38px] transition-all ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
            >
                <span className="truncate flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {activePreset}
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
            </div>
            {isOpen && (
                <div className="absolute top-[60px] left-0 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden w-72 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1">Quick Select</div>
                        <div className="grid grid-cols-2 gap-1">
                            {presets.filter(p => !p.isCustom).map(p => (
                                <button
                                    key={p.label}
                                    onClick={() => { setRange(p.getRange()); setIsCustom(false); setIsOpen(false); }}
                                    className={`text-[10px] p-2 rounded-lg font-bold transition-colors text-left ${activePreset === p.label ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200 text-slate-600'}`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex justify-between items-center">
                            <span>Custom Range</span>
                            <button onClick={() => setIsCustom(true)} className="text-blue-500 hover:text-blue-700">Select</button>
                        </div>
                        {isCustom && (
                            <div className="flex flex-col gap-2">
                                <input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-bold" />
                                <div className="text-center text-slate-300 font-black text-xs">TO</div>
                                <input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-bold" />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {isOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
};

// --- Helper Components ---

const CustomTooltip = ({ active, payload, label, selectedDate, getMonthLabel, formatMoney, categories = [] }) => {
    if (active && payload && payload.length) {
        const rawData = payload[0].payload;
        if (!rawData) return null;

        const items = [];
        Object.keys(rawData).forEach(key => {
            if (key.startsWith('IN_') || key.startsWith('OUT_')) {
                const val = Number(rawData[key]);
                if (Math.abs(val) > 0) {
                    const isIncome = key.startsWith('IN_');
                    const name = key.slice(3);
                    const cat = categories.find(c => c.label === name);
                    const fill = cat?.color || (isIncome ? '#10b981' : '#ef4444');
                    items.push({ name, value: val, fill });
                }
            }
        });

        items.sort((a, b) => b.value - a.value);
        const netVal = Number(rawData.net) || 0;

        const fullDateVal = rawData.fullDate;
        let headerLabel = label;
        if (fullDateVal) {
            const dateObj = new Date(fullDateVal);
            if (!isNaN(dateObj.getTime())) {
                if (fullDateVal.length === 7) {
                    headerLabel = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
                } else {
                    headerLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                }
            }
        } else {
            headerLabel = (getMonthLabel && selectedDate) ? `${getMonthLabel(selectedDate)} ${label}` : label;
        }

        return (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs text-white max-w-[280px]">
                <p className="font-bold mb-1 uppercase tracking-wider text-[10px] text-slate-400">
                    {headerLabel}
                </p>
                <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-slate-800">
                    <span className="font-bold text-slate-300">Net Flow</span>
                    <span className={`font-mono font-black ${netVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {netVal >= 0 ? '+' : ''}{formatMoney(netVal)}
                    </span>
                </div>
                {items.length > 0 ? (
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                        {items.map((p, idx) => (
                            <div key={idx} className="flex justify-between gap-4 items-center">
                                <span className="flex items-center gap-1.5 font-semibold text-slate-400 font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
                                    {p.name}
                                </span>
                                <span className="font-mono font-bold text-slate-200">{formatMoney(p.value)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-500 italic">No transactions</p>
                )}
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
    const space = currencySymbol === '֏' ? '\u00a0' : '';
    
    if (plannedMonthly === 0) {
        statusText = 'Unplanned';
        statusColor = 'text-slate-400';
        percent = actualAmount > 0 ? 100 : 0;
        progressColor = item.color || '#94a3b8';
    } else if (isExpense) {
        if (percent > 100) {
            statusText = `Overbudget by ${currencySymbol}${space}${(actualAmount - plannedMonthly).toLocaleString(undefined, {maximumFractionDigits:0})}`;
            statusColor = 'text-red-500';
            progressColor = '#ef4444'; // Red alert
        } else {
            const remaining = Math.max(0, plannedMonthly - actualAmount);
            statusText = `${(100 - percent).toFixed(0)}% Left (${currencySymbol}${space}${remaining.toLocaleString(undefined, {maximumFractionDigits:0})} remaining)`;
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
                    <div className="text-sm">{currencySymbol}{space}{plannedMonthly.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-[10px] text-slate-400 font-normal">/ mo</span></div>
                ) : (
                    <div className="text-sm italic text-slate-400">Not set</div>
                )}
            </div>

            <div className="md:col-span-6 flex flex-col justify-center pr-8 md:pr-12">
                <div className="flex justify-between items-end mb-1.5 text-[10px] uppercase font-bold tracking-wider">
                    <div className="text-slate-500">
                        Actual: <span className="text-slate-800 text-xs">{currencySymbol}{space}{actualAmount.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
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
    const [dashboardTab, setDashboardTab] = useState('history'); // overview | budget | history
    const [isAddingTransaction, setIsAddingTransaction] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [analyticsSource, setAnalyticsSource] = useState('actual'); // 'actual' | 'budget'
    const [dateFilterType, setDateFilterType] = useState('month'); // 'month' | 'all' | 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [recurringExpensesSort, setRecurringExpensesSort] = useState('actual');

    // Currency Persistence
    const currentCurrencyCode = userData.gameplaySettings?.currency || 'AMD';
    const setCurrency = (code) => updateUser({ gameplaySettings: { ...userData.gameplaySettings, currency: code } });
    const currencySymbol = CURRENCIES[currentCurrencyCode]?.symbol || '֏';
    
    const getLocalYYYYMMDD = (dateOrStr) => {
        const d = dateOrStr ? new Date(dateOrStr) : new Date();
        if (isNaN(d.getTime())) return '';
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    const formatMoney = (amount) => {
        const val = Number(amount);
        const absVal = Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const space = currencySymbol === '֏' ? '\u00a0' : '';
        if (val < 0) {
            return `-${currencySymbol}${space}${absVal}`;
        }
        return `${currencySymbol}${space}${absVal}`;
    };

    const getMonthLabel = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const getDateRangeLabel = () => {
        if (dateFilterType === 'month') {
            return getMonthLabel(selectedDate);
        }
        if (dateFilterType === 'all') {
            return 'All Time';
        }
        if (dateFilterType === 'custom') {
            const formatD = (dStr) => {
                if (!dStr) return '?';
                const d = new Date(dStr);
                return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            };
            return `${formatD(customStartDate)} - ${formatD(customEndDate)}`;
        }
        return '';
    };
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
    const [historyFilter, setHistoryFilter] = useState({ categoryId: 'all', type: 'all', accountId: 'all', minAmount: '', maxAmount: '' });

    // Daily Spending Chart Filters
    const [dailyChartCategoryFilter, setDailyChartCategoryFilter] = useState('all');

    // New state for Analytics improvements
    const [showDailyAvgBreakdown, setShowDailyAvgBreakdown] = useState(false);
    const [balanceGrouping, setBalanceGrouping] = useState('day'); // 'day' | 'week' | 'month'
    const [spendingGrouping, setSpendingGrouping] = useState('day'); // 'day' | 'week' | 'month'
    const [balanceChartMode, setBalanceChartMode] = useState('net_worth'); // 'net_worth' | 'net_flow'

    // Transaction Management State
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'expense',
        categoryId: '',
        accountId: '',
        toAccountId: '',
        projectId: '',
        projectStageId: '',
        description: '',
        date: getLocalYYYYMMDD()
    });

    // Projects Analytics State
    const [projectClientFilter, setProjectClientFilter] = useState('all');
    const [projectStatusFilter, setProjectStatusFilter] = useState('all');

    // Planning/Coming Analytics State
    const [planningMode, setPlanningMode] = useState('project'); // 'history' | 'project'
    
    // Default prediction target: 30 days from now
    const defaultTarget = new Date();
    defaultTarget.setDate(defaultTarget.getDate() + 30);
    const [predictionDateRange, setPredictionDateRange] = useState({ start: new Date().toISOString().slice(0, 10), end: defaultTarget.toISOString().slice(0, 10) });
    
    // Default lookback start: 15 days ago
    const defaultLookback = new Date();
    defaultLookback.setDate(defaultLookback.getDate() - 15);
    const [lookbackDateRange, setLookbackDateRange] = useState({ start: defaultLookback.toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) });
    
    const [selectedPredictionCategories, setSelectedPredictionCategories] = useState([]); // array of category IDs, empty means all
    const [planningAccountId, setPlanningAccountId] = useState('all');
    const [isAddingExpected, setIsAddingExpected] = useState(false);
    const [isEditingExpectedId, setIsEditingExpectedId] = useState(null);
    const [expectedForm, setExpectedForm] = useState({ date: defaultTarget.toISOString().slice(0, 10), description: '', amount: '', type: 'expense', categoryId: '' });

    // --- Data Processing (Month-Aware) ---
    const transactions = useMemo(() => userData.transactions || [], [userData.transactions]);
    const projects = useMemo(() => userData.projects || [], [userData.projects]);
    const categories = useMemo(() => userData.categories || [], [userData.categories]);
    const accounts = useMemo(() => userData.accounts || [], [userData.accounts]);
    const expectedTransactions = useMemo(() => userData.expectedTransactions || [], [userData.expectedTransactions]);

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
    
    const resolvedDateRange = useMemo(() => {
        let start = new Date();
        let end = new Date();
        
        if (dateFilterType === 'month') {
            start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        } else if (dateFilterType === 'all') {
            const dates = transactions.map(t => new Date(t.createdAt)).filter(d => !isNaN(d.getTime()));
            if (dates.length > 0) {
                start = new Date(Math.min(...dates));
                end = new Date(); // Calculate up to today
            } else {
                start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            }
        } else if (dateFilterType === 'custom') {
            if (customStartDate) start = new Date(customStartDate);
            else start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            
            if (customEndDate) end = new Date(customEndDate);
            else end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        }
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }, [dateFilterType, selectedDate, customStartDate, customEndDate, transactions]);

    // 1. Month Actuals (Range-aware)
    const monthTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.createdAt);
            return tDate >= resolvedDateRange.start && tDate <= resolvedDateRange.end;
        });
    }, [transactions, resolvedDateRange]);

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

    // Transactions filtered strictly for the selected month (used in Planning/Budget tab)
    const planningMonthTransactions = useMemo(() => {
        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        
        const list = [];
        transactions.forEach(t => {
            const tDate = new Date(t.createdAt);
            if (tDate >= start && tDate <= end) {
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
            }
        });
        return list;
    }, [transactions, selectedDate, activeAnalyticAccountIds]);

    const monthActualIncome = filteredMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const monthActualExpense = filteredMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    
    const activeDaysInMonth = useMemo(() => {
        const totalDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        
        if (filteredMonthTransactions.length === 0) return totalDays;
        
        const dates = filteredMonthTransactions
            .map(t => new Date(t.createdAt))
            .filter(d => !isNaN(d.getTime()));
            
        if (dates.length === 0) return totalDays;
        
        const earliestDate = new Date(Math.min(...dates));
        
        if (earliestDate.getFullYear() === selectedDate.getFullYear() && earliestDate.getMonth() === selectedDate.getMonth()) {
            const startDay = earliestDate.getDate();
            
            const today = new Date();
            let endDay = totalDays;
            if (today.getFullYear() === selectedDate.getFullYear() && today.getMonth() === selectedDate.getMonth()) {
                endDay = today.getDate();
            }
            
            const activeDays = endDay - startDay + 1;
            return activeDays > 0 ? activeDays : 1;
        }
        
        return totalDays;
    }, [filteredMonthTransactions, selectedDate]);
    // monthNetBalance removed (unused)

    // 2. Global Budget (Projected/Baseline)
    const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

    const sortedExpenseCategories = useMemo(() => {
        const list = [...expenseCategories];
        
        const getActualSpent = (catId) => {
            return planningMonthTransactions
                .filter(t => t.type === 'expense' && t.categoryId === catId)
                .reduce((sum, t) => sum + Number(t.amount), 0);
        };
        
        const getPlannedMonthly = (item) => {
            const amount = Number(item.amount) || 0;
            const period = Number(item.period) || 30;
            return (amount * 30) / period;
        };

        return list.sort((a, b) => {
            if (recurringExpensesSort === 'actual') {
                const actualA = getActualSpent(a.id);
                const actualB = getActualSpent(b.id);
                return actualB - actualA;
            } else if (recurringExpensesSort === 'planned') {
                const plannedA = getPlannedMonthly(a);
                const plannedB = getPlannedMonthly(b);
                
                if (plannedA === 0 && plannedB > 0) return 1;
                if (plannedB === 0 && plannedA > 0) return -1;
                if (plannedA === 0 && plannedB === 0) {
                    return getActualSpent(b.id) - getActualSpent(a.id);
                }
                
                return plannedB - plannedA;
            }
            return 0;
        });
    }, [expenseCategories, planningMonthTransactions, recurringExpensesSort]);

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

    const totalRemainingExpense = useMemo(() => {
        return expenseCategories.reduce((sum, cat) => {
            const activeMonths = cat.activeMonths || Array.from({length: 12}, (_, i) => i);
            if (!activeMonths.includes(selectedDate.getMonth())) return sum;

            const amount = Number(cat.amount) || 0;
            const period = Number(cat.period) || 30;
            const plannedMonthly = (amount * 30) / period;

            const actualSpent = planningMonthTransactions
                .filter(t => t.type === 'expense' && t.categoryId === cat.id)
                .reduce((acc, t) => acc + Number(t.amount), 0);

            const remaining = Math.max(0, plannedMonthly - actualSpent);
            return sum + remaining;
        }, 0);
    }, [expenseCategories, planningMonthTransactions, selectedDate]);
    // burnRateDaily removed (unused)

    // 3. Analytics Data Source Switcher
    const activeIncome = analyticsSource === 'actual' ? monthActualIncome : projectedMonthlyIncome;
    const activeExpense = analyticsSource === 'actual' ? monthActualExpense : projectedMonthlyExpense;
    const activeBalance = activeIncome - activeExpense;

    const activeDays = useMemo(() => {
        if (dateFilterType === 'month') {
            return activeDaysInMonth;
        }
        const diffTime = Math.abs(resolvedDateRange.end - resolvedDateRange.start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    }, [dateFilterType, activeDaysInMonth, resolvedDateRange]);

    const dailyAvgCategoryBreakdown = useMemo(() => {
        const activeDaysCount = activeDays;
        
        // 1. Calculate for all defined expense categories
        const breakdown = expenseCategories.map(cat => {
            const actualTotal = filteredMonthTransactions
                .filter(t => t.type === 'expense' && t.categoryId === cat.id)
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const actualDaily = actualTotal / activeDaysCount;
            const plannedDaily = (Number(cat.amount) || 0) / (Number(cat.period) || 30);
            return {
                id: cat.id,
                label: cat.label,
                color: cat.color || '#ef4444',
                actualDaily,
                plannedDaily,
                actualTotal,
                percent: plannedDaily > 0 ? (actualDaily / plannedDaily) * 100 : 0
            };
        });
        
        // 2. Also calculate for any "Other/Uncategorized" expenses
        const uncategorizedTotal = filteredMonthTransactions
            .filter(t => t.type === 'expense' && (!t.categoryId || !expenseCategories.some(c => c.id === t.categoryId)))
            .reduce((sum, t) => sum + Number(t.amount), 0);
            
        if (uncategorizedTotal > 0) {
            const actualDaily = uncategorizedTotal / activeDaysCount;
            breakdown.push({
                id: 'uncategorized',
                label: 'Other / Uncategorized',
                color: '#64748b',
                actualDaily,
                plannedDaily: 0,
                actualTotal: uncategorizedTotal,
                percent: 0
            });
        }
        
        return breakdown.sort((a, b) => b.actualDaily - a.actualDaily);
    }, [expenseCategories, filteredMonthTransactions, activeDays]);

    const balanceHistoryData = useMemo(() => {
        let currentBal = 0;
        const today = new Date();
        
        // 1. Calculate start balance before resolvedDateRange.start
        activeAnalyticAccountIds.forEach(accId => {
            if (accId === 'legacy') {
                // Legacy unallocated
            } else {
                const account = accounts.find(a => a.id === accId);
                if (account) {
                    currentBal += Number(account.initialBalance) || 0;
                }
            }
        });

        transactions.forEach(t => {
            if (new Date(t.createdAt) < resolvedDateRange.start) {
                const amount = Number(t.amount) || 0;
                if (t.type === 'income') {
                    const accId = t.accountId || 'legacy';
                    if (activeAnalyticAccountIds.includes(accId)) {
                        currentBal += amount;
                    }
                } else if (t.type === 'expense') {
                    const accId = t.accountId || 'legacy';
                    if (activeAnalyticAccountIds.includes(accId)) {
                        currentBal -= amount;
                    }
                } else if (t.type === 'transfer') {
                    if (activeAnalyticAccountIds.includes(t.accountId)) {
                        currentBal -= amount;
                    }
                    if (activeAnalyticAccountIds.includes(t.toAccountId)) {
                        currentBal += amount;
                    }
                }
            }
        });

        // 2. Filter transactions that are within resolvedDateRange
        const rangeTx = transactions
            .filter(t => {
                const d = new Date(t.createdAt);
                return d >= resolvedDateRange.start && d <= resolvedDateRange.end;
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // 3. Generate points based on grouping
        const points = [];
        const start = new Date(resolvedDateRange.start);
        const end = new Date(resolvedDateRange.end);

        if (balanceGrouping === 'day') {
            let curr = new Date(start);
            while (curr <= end) {
                if (curr > today) break;
                const dayStr = curr.toISOString().slice(0, 10);
                const dayTransactions = rangeTx.filter(t => t.createdAt.startsWith(dayStr));
                
                let prevBal = currentBal;
                dayTransactions.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    if (t.type === 'income') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) currentBal += amount;
                    } else if (t.type === 'expense') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) currentBal -= amount;
                    } else if (t.type === 'transfer') {
                        if (activeAnalyticAccountIds.includes(t.accountId)) currentBal -= amount;
                        if (activeAnalyticAccountIds.includes(t.toAccountId)) currentBal += amount;
                    }
                });

                points.push({
                    label: curr.getDate().toString(),
                    fullDate: dayStr,
                    balance: currentBal,
                    netFlow: currentBal - prevBal
                });
                
                curr.setDate(curr.getDate() + 1);
            }
        } else if (balanceGrouping === 'week') {
            let curr = new Date(start);
            const dayOfWeek = curr.getDay();
            const diff = curr.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            curr.setDate(diff); // Set to Monday of that week
            
            while (curr <= end) {
                const weekStart = new Date(curr);
                if (weekStart > today) break;
                const weekEnd = new Date(curr);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                const weekTransactions = rangeTx.filter(t => {
                    const d = new Date(t.createdAt);
                    return d >= weekStart && d <= weekEnd;
                });

                let prevBal = currentBal;
                weekTransactions.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    if (t.type === 'income') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) currentBal += amount;
                    } else if (t.type === 'expense') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) currentBal -= amount;
                    } else if (t.type === 'transfer') {
                        if (activeAnalyticAccountIds.includes(t.accountId)) currentBal -= amount;
                        if (activeAnalyticAccountIds.includes(t.toAccountId)) currentBal += amount;
                    }
                });

                const labelStr = `${weekStart.getDate()} ${weekStart.toLocaleDateString(undefined, {month:'short'})}`;
                points.push({
                    label: labelStr,
                    fullDate: weekStart.toISOString().slice(0, 10),
                    balance: currentBal,
                    netFlow: currentBal - prevBal
                });
                curr.setDate(curr.getDate() + 7);
            }
        } else {
            let curr = new Date(start);
            curr.setDate(1);
            
            while (curr <= end) {
                if (curr > today) break;
                const monthStr = curr.toISOString().slice(0, 7);
                const nextMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 1);
                const monthTransactionsList = rangeTx.filter(t => t.createdAt.startsWith(monthStr));

                let prevBal = currentBal;
                monthTransactionsList.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    if (t.type === 'income') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) currentBal += amount;
                    } else if (t.type === 'expense') {
                        const accId = t.accountId || 'legacy';
                        if (activeAnalyticAccountIds.includes(accId)) currentBal -= amount;
                    } else if (t.type === 'transfer') {
                        if (activeAnalyticAccountIds.includes(t.accountId)) currentBal -= amount;
                        if (activeAnalyticAccountIds.includes(t.toAccountId)) currentBal += amount;
                    }
                });

                const labelStr = curr.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                points.push({
                    label: labelStr,
                    fullDate: monthStr,
                    balance: currentBal,
                    netFlow: currentBal - prevBal
                });

                curr = nextMonth;
            }
        }

        return points;
    }, [transactions, accounts, activeAnalyticAccountIds, resolvedDateRange, balanceGrouping]);

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

    // 5. Daily Bar Chart (Range View)
    const dailyActivity = useMemo(() => {
        if (analyticsSource === 'budget') return []; // Budget has no daily distribution
        
        const days = [];
        
        if (spendingGrouping === 'day') {
            let current = new Date(resolvedDateRange.start);
            while (current <= resolvedDateRange.end) {
                const dayStr = current.toISOString().slice(0, 10); // "YYYY-MM-DD"
                const dayLabel = current.getDate().toString();
                const dayData = { day: dayLabel, income: 0, expense: 0, fullDate: dayStr };
                
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
                        dayData[`OUT_${categoryLabel}`] = (dayData[`OUT_${categoryLabel}`] || 0) - amount; // Negative!
                    }
                });
                
                dayData.net = dayData.income - dayData.expense;
                days.push(dayData);
                current.setDate(current.getDate() + 1);
            }
        } else if (spendingGrouping === 'week') {
            let current = new Date(resolvedDateRange.start);
            // Move to Monday of the current week
            const dayOfWeek = current.getDay();
            const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            current.setDate(current.getDate() + distanceToMonday);
            current.setHours(0, 0, 0, 0);

            while (current <= resolvedDateRange.end) {
                const weekStart = new Date(current);
                const weekEnd = new Date(current);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                const weekLabel = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                const weekData = { day: weekLabel, income: 0, expense: 0, fullDate: weekStart.toISOString().slice(0, 10) };

                const weekTransactions = filteredMonthTransactions.filter(t => {
                    const tDate = new Date(t.createdAt);
                    return tDate >= weekStart && tDate <= weekEnd &&
                           (dailyChartCategoryFilter === 'all' || t.categoryId === dailyChartCategoryFilter);
                });

                weekTransactions.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    const cat = categories.find(c => c.id === t.categoryId);
                    const categoryLabel = cat ? cat.label : 'Other';

                    if (t.type === 'income') {
                        weekData.income += amount;
                        weekData[`IN_${categoryLabel}`] = (weekData[`IN_${categoryLabel}`] || 0) + amount;
                    } else if (t.type === 'expense') {
                        weekData.expense += amount;
                        weekData[`OUT_${categoryLabel}`] = (weekData[`OUT_${categoryLabel}`] || 0) - amount; // Negative!
                    }
                });

                weekData.net = weekData.income - weekData.expense;
                if (weekEnd >= resolvedDateRange.start && weekStart <= resolvedDateRange.end) {
                    days.push(weekData);
                }

                current.setDate(current.getDate() + 7);
            }
        } else if (spendingGrouping === 'month') {
            let current = new Date(resolvedDateRange.start);
            current.setDate(1);
            current.setHours(0, 0, 0, 0);

            while (current <= resolvedDateRange.end) {
                const monthStart = new Date(current);
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
                monthEnd.setHours(23, 59, 59, 999);

                const monthStr = monthStart.toISOString().slice(0, 7); // "YYYY-MM"
                const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                const monthData = { day: monthLabel, income: 0, expense: 0, fullDate: monthStr };

                const monthTransactionsList = filteredMonthTransactions.filter(t => {
                    const tDate = new Date(t.createdAt);
                    return tDate >= monthStart && tDate <= monthEnd &&
                           (dailyChartCategoryFilter === 'all' || t.categoryId === dailyChartCategoryFilter);
                });

                monthTransactionsList.forEach(t => {
                    const amount = Number(t.amount) || 0;
                    const cat = categories.find(c => c.id === t.categoryId);
                    const categoryLabel = cat ? cat.label : 'Other';

                    if (t.type === 'income') {
                        monthData.income += amount;
                        monthData[`IN_${categoryLabel}`] = (monthData[`IN_${categoryLabel}`] || 0) + amount;
                    } else if (t.type === 'expense') {
                        monthData.expense += amount;
                        monthData[`OUT_${categoryLabel}`] = (monthData[`OUT_${categoryLabel}`] || 0) - amount; // Negative!
                    }
                });

                monthData.net = monthData.income - monthData.expense;
                days.push(monthData);
                current.setMonth(current.getMonth() + 1);
            }
        }
        
        return days;
    }, [analyticsSource, filteredMonthTransactions, resolvedDateRange, dailyChartCategoryFilter, categories, spendingGrouping]);


    // --- Export Actions ---
    const handleExport = () => {
        const dateLabel = getDateRangeLabel();
        if (dashboardTab === 'history') {
            const filteredList = monthTransactions.filter(t => {
                if (historyFilter.type !== 'all' && t.type !== historyFilter.type) return false;
                if (historyFilter.categoryId !== 'all' && t.categoryId !== historyFilter.categoryId) return false;
                if (historyFilter.accountId !== 'all') {
                    if (t.type === 'transfer') {
                        if (t.accountId !== historyFilter.accountId && t.toAccountId !== historyFilter.accountId) return false;
                    } else {
                        const accId = t.accountId || '';
                        if (accId !== historyFilter.accountId) return false;
                    }
                }
                const amount = Number(t.amount);
                if (historyFilter.minAmount !== '' && amount < Number(historyFilter.minAmount)) return false;
                if (historyFilter.maxAmount !== '' && amount > Number(historyFilter.maxAmount)) return false;
                return true;
            }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            exportTransactionsToExcel(filteredList, categories, accounts, dateLabel);
        } else if (dashboardTab === 'overview') {
            exportAnalyticsToExcel(dailyActivity, categoryBreakdown, balanceHistoryData, activeDaysInMonth, dateLabel);
        } else if (dashboardTab === 'budget') {
            exportBudgetToExcel(categories, planningMonthTransactions, dateLabel, selectedDate.getMonth());
        } else if (dashboardTab === 'projects') {
            let filteredProjects = projects;
            if (projectStatusFilter !== 'all') {
                filteredProjects = filteredProjects.filter(p => p.status === projectStatusFilter);
            }
            if (projectClientFilter !== 'all') {
                filteredProjects = filteredProjects.filter(p => p.client === projectClientFilter);
            }
            if (dateFilterType === 'month') {
                const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);
                filteredProjects = filteredProjects.filter(p => {
                    const d = new Date(p.receivedAt || p.createdAt || p.id);
                    return d >= startOfMonth && d <= endOfMonth;
                });
            } else if (dateFilterType === 'custom') {
                const start = customStartDate ? new Date(customStartDate) : null;
                const end = customEndDate ? new Date(customEndDate) : null;
                if (start) start.setHours(0,0,0,0);
                if (end) end.setHours(23,59,59,999);
                filteredProjects = filteredProjects.filter(p => {
                    const d = new Date(p.receivedAt || p.createdAt || p.id);
                    if (start && d < start) return false;
                    if (end && d > end) return false;
                    return true;
                });
            }
            exportProjectsToExcel(filteredProjects, transactions, dateLabel);
        }
    };


    // --- Actions ---
    
    const handleAddExpectedTransaction = (e) => {
        e.preventDefault();
        if (!expectedForm.date || !expectedForm.amount || !expectedForm.description) return;
        
        if (isEditingExpectedId) {
            updateUser({
                expectedTransactions: expectedTransactions.map(t => 
                    t.id === isEditingExpectedId ? { ...t, ...expectedForm } : t
                )
            });
            setIsEditingExpectedId(null);
        } else {
            const newTx = { ...expectedForm, id: Date.now().toString() };
            updateUser({ expectedTransactions: [...expectedTransactions, newTx] });
        }
        
        setExpectedForm({ date: expectedForm.date, description: '', amount: '', type: 'expense', categoryId: '' });
        setIsAddingExpected(false);
    };

    const handleDeleteExpectedTransaction = (id) => {
        updateUser({ expectedTransactions: expectedTransactions.filter(t => t.id !== id) });
    };

    const handleConfirmExpectedTransaction = (et) => {
        setNewTransaction({
            type: et.type,
            amount: et.amount,
            categoryId: et.categoryId || '',
            accountId: accounts[0]?.id || '',
            toAccountId: '',
            description: et.description,
            date: et.date,
            projectId: '',
            projectStageId: '',
            _fromExpectedTxId: et.id
        });
        setIsAddingTransaction(true);
    };
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

        const today = new Date();
        let createdAtDate;
        const selectedDateStr = newTransaction.date;
        const todayDateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        
        if (selectedDateStr === todayDateStr) {
            createdAtDate = today;
        } else {
            const parts = selectedDateStr.split('-').map(Number);
            createdAtDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
        }

        const payload = {
            ...newTransaction,
            description,
            amount: parseFloat(newTransaction.amount),
            createdAt: createdAtDate.toISOString()
        };

        if (newTransaction.id) {
            await transactionsActions.update(newTransaction.id, payload);
        } else {
            await transactionsActions.add(payload);
        }

        if (newTransaction._fromExpectedTxId) {
            handleDeleteExpectedTransaction(newTransaction._fromExpectedTxId);
        }

        setIsAddingTransaction(false);
        setNewTransaction({ ...newTransaction, id: undefined, amount: '', description: '', toAccountId: '', projectId: '', projectStageId: '', _fromExpectedTxId: undefined });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-2 md:pb-6 mb-2 md:mb-8 gap-3 md:gap-4">
                <div className="w-full md:w-auto">
                    <div className="flex items-center justify-between gap-4 w-full md:w-auto">
                        {/* Currency Selector */}
                        <div className="relative group">
                            <button className="text-lg md:text-xl font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                {CURRENCIES[currentCurrencyCode].symbol} <span className="text-[10px] uppercase align-top">{currentCurrencyCode}</span>
                            </button>
                            <div className="absolute top-full left-0 mt-2 bg-white shadow-xl border border-slate-200 border border-slate-300 rounded-xl overflow-hidden hidden group-hover:block w-32 z-50">
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

                        {/* Date Filter Type Tabs (Side-by-side with Currency on mobile) */}
                        {dashboardTab !== 'budget' && (
                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                <button 
                                    onClick={() => setDateFilterType('month')} 
                                    className={`px-2.5 py-1 rounded-md transition-all ${dateFilterType === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Month
                                </button>
                                <button 
                                    onClick={() => setDateFilterType('all')} 
                                    className={`px-2.5 py-1 rounded-md transition-all ${dateFilterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setDateFilterType('custom')} 
                                    className={`px-2.5 py-1 rounded-md transition-all ${dateFilterType === 'custom' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Custom
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Date Selector Month Switcher */}
                    {(dashboardTab === 'budget' || (dashboardTab !== 'budget' && dateFilterType === 'month')) && (
                        <div className="flex items-center justify-center md:justify-start gap-4 mt-2 bg-slate-50/50 md:bg-transparent py-1 px-3 md:p-0 rounded-lg w-full md:w-auto">
                            <button onClick={() => adjustMonth(-1)} className="text-slate-500 hover:text-blue-600 transition-colors"><ArrowDownRight className="w-4 h-4 rotate-45" /></button>
                            <span className="text-xs md:text-sm font-mono font-bold text-green-500 uppercase tracking-widest min-w-[125px] md:min-w-[140px] text-center">
                                {getMonthLabel(selectedDate)}
                            </span>
                            <button onClick={() => adjustMonth(1)} className="text-slate-500 hover:text-blue-600 transition-colors"><ArrowUpRight className="w-4 h-4 rotate-45" /></button>
                        </div>
                    )}

                    {/* Custom Date Inputs if Custom Selected */}
                    {dashboardTab !== 'budget' && dateFilterType === 'custom' && (
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 flex-wrap w-full md:w-auto">
                            <input 
                                type="date" 
                                value={customStartDate} 
                                onChange={e => setCustomStartDate(e.target.value)} 
                                className="bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                            />
                            <span className="text-[9px] font-bold uppercase text-slate-400">to</span>
                            <input 
                                type="date" 
                                value={customEndDate} 
                                onChange={e => setCustomEndDate(e.target.value)} 
                                className="bg-white border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0 flex-wrap w-full md:w-auto justify-center md:justify-end">
                    <button onClick={handleExport} title="Export to Excel" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm shrink-0 flex items-center justify-center text-slate-600 hover:text-green-600 group h-full">
                        <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider hidden md:inline">Export</span>
                    </button>
                    {/* Navigation Tabs - Match Task/Portfolio Style */}
                    <div className="flex bg-white shadow-sm border border-slate-200/50 p-1 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar w-full md:w-auto self-start md:self-end">
                    {[
                        { id: 'history', label: 'History', color: 'bg-blue-600 text-white shadow-lg' },
                        { id: 'overview', label: 'Analytics', color: 'bg-green-600 text-white shadow-lg' },
                        { id: 'budget', label: 'Planning', color: 'bg-amber-600 text-white shadow-lg' },
                        { id: 'projects', label: 'Coming', color: 'bg-indigo-600 text-white shadow-lg' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setDashboardTab(t.id)}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${dashboardTab === t.id ? t.color : 'text-slate-500 hover:text-blue-600'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 flex flex-col">
                    {/* Source Toggle for Analytics */}
                    {dashboardTab === 'overview' && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-1 mb-8 gap-4">
                            <div className="flex bg-white shadow-sm border border-slate-200 rounded-lg p-1 border border-slate-200 mb-1 self-start md:self-auto w-full md:w-auto">
                                <button onClick={() => setAnalyticsSource('actual')} className={`flex-1 md:flex-none px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'actual' ? 'bg-green-600 text-slate-800' : 'text-slate-500'}`}>Actuals</button>
                                <button onClick={() => setAnalyticsSource('budget')} className={`flex-1 md:flex-none px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'budget' ? 'bg-amber-600 text-slate-800' : 'text-slate-500'}`}>Budget Plan</button>
                            </div>
                        </div>
                    )}

                    {/* --- BUDGET VIEW (Planning) --- */}
                    {dashboardTab === 'budget' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in">
                            {/* Projections based on PLAN */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard title="Projected Income" amount={projectedMonthlyIncome} subtext="Baseline Configuration" icon={TrendingUp} color="#3b82f6" formatMoney={formatMoney} />
                                <StatCard title="Projected Expense" amount={projectedMonthlyExpense} subtext="Baseline Configuration" icon={TrendingDown} color="#ef4444" isNegative formatMoney={formatMoney} />
                                <StatCard title="Projected Cash Flow" amount={projectedFreeCashFlow} subtext="Potential Saving" icon={Wallet} color="#10b981" formatMoney={formatMoney} />
                                <StatCard title="Remaining to Spend" amount={totalRemainingExpense} subtext="Left in current budget" icon={Calculator} color="#f59e0b" formatMoney={formatMoney} />
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
                                                actualAmount={planningMonthTransactions.filter(t => t.type === 'income' && t.categoryId === cat.id).reduce((sum, t) => sum + Number(t.amount), 0)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Expense Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-red-900/10 p-4 rounded-xl border border-red-500/20">
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Recurring Expenses</h3>
                                            <span className="text-[10px] text-red-400 font-bold mt-0.5">
                                                Remaining to spend: {formatMoney(totalRemainingExpense)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={recurringExpensesSort}
                                                onChange={e => setRecurringExpensesSort(e.target.value)}
                                                className="bg-white/80 border border-red-500/20 text-[10px] font-bold text-red-700 uppercase tracking-wider rounded-lg px-2.5 py-1.5 outline-none focus:border-red-500/50 cursor-pointer animate-in fade-in"
                                            >
                                                <option value="actual">By Spent</option>
                                                <option value="planned">By Budget</option>
                                            </select>
                                            <button 
                                                onClick={() => { setEditingCategoryData({ type: 'expense', label: '', amount: '', period: 30, color: '#ef4444' }); setIsEditingCategory(true); }}
                                                className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-blue-600 rounded-lg transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-4">
                                        <div className="col-span-3">Category</div>
                                        <div className="col-span-3 pl-2">Budget Limit</div>
                                        <div className="col-span-6">Actual vs Planned Progress</div>
                                    </div>
                                    <div className="space-y-3">
                                        {sortedExpenseCategories.map(cat => (
                                            <BudgetRow 
                                                key={cat.id} item={cat} isExpense={true} 
                                                onEdit={(item) => { setEditingCategoryData(item); setIsEditingCategory(true); }}
                                                onDelete={categoriesActions.delete}
                                                currencySymbol={currencySymbol}
                                                actualAmount={planningMonthTransactions.filter(t => t.type === 'expense' && t.categoryId === cat.id).reduce((sum, t) => sum + Number(t.amount), 0)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- HISTORY VIEW --- */}
                    {/* --- COMING VIEW --- */}
                    {dashboardTab === 'projects' && (() => {
                        // Current Balance
                        // --- PREDICTIVE CASH FLOW ENGINE ---
                        
                        const currentBalance = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
                        
                        const formatDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        
                        const today = new Date();
                        today.setHours(0,0,0,0);
                        
                        const lookbackStart = new Date(lookbackDateRange.start + 'T00:00:00');
                        const lookbackEnd = new Date(lookbackDateRange.end + 'T23:59:59');
                        
                        const predictionStart = new Date(predictionDateRange.start + 'T00:00:00');
                        const predictionEnd = new Date(predictionDateRange.end + 'T23:59:59');
                        const daysInWindow = Math.max(1, Math.floor((predictionEnd - predictionStart) / (1000 * 60 * 60 * 24)));
                        
                        // 1. Calculate Daily Average Spend & Income (Lookback)
                        const lookbackTx = transactions.filter(t => {
                            const d = new Date(t.date || t.createdAt);
                            if (d < lookbackStart || d > lookbackEnd) return false;
                            
                            if (planningAccountId !== 'all') {
                                if (t.type === 'transfer') {
                                    if (t.accountId !== planningAccountId && t.toAccountId !== planningAccountId) return false;
                                } else {
                                    const accId = t.accountId || 'legacy';
                                    if (accId !== planningAccountId) return false;
                                }
                            }
                            
                            return true;
                        });
                        
                        let effectiveLookbackStart = lookbackStart;
                        if (lookbackTx.length > 0) {
                            const firstTxDate = new Date(Math.min(...lookbackTx.map(t => new Date(t.date || t.createdAt))));
                            if (firstTxDate > effectiveLookbackStart) {
                                effectiveLookbackStart = firstTxDate;
                                effectiveLookbackStart.setHours(0,0,0,0);
                            }
                        }
                        
                        const lookbackDays = Math.max(1, Math.floor((lookbackEnd - effectiveLookbackStart) / (1000 * 60 * 60 * 24)) + 1);
                        
                        const lookbackExpenses = lookbackTx.filter(t => {
                            if (t.type === 'expense') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.accountId === planningAccountId) return true;
                            return false;
                        });
                        const lookbackIncomes = lookbackTx.filter(t => {
                            if (t.type === 'income') return true;
                            if (planningAccountId !== 'all' && t.type === 'transfer' && t.toAccountId === planningAccountId) return true;
                            return false;
                        });

                        const filteredLookbackExpenses = selectedPredictionCategories.length > 0 
                            ? lookbackExpenses.filter(t => selectedPredictionCategories.includes(t.categoryId))
                            : lookbackExpenses;
                            
                        const totalLookbackSpend = filteredLookbackExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                        const dailyAverageSpend = totalLookbackSpend / lookbackDays;
                        
                        const expectedIncomeEvents = [];
                        const expectedExpenseEvents = [];
                        
                        let dailyRecurringIncome = 0;
                        if (planningMode === 'history') {
                            const totalLookbackIncome = lookbackIncomes.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
                            const dailyAverageIncome = totalLookbackIncome / lookbackDays;
                            dailyRecurringIncome = dailyAverageIncome;
                        } else {
                            // Project / Expected Mode
                            // Income:
                            projects.filter(p => p.status !== 'Rejected' && p.status !== 'Archived').forEach(p => {
                                p.stages?.forEach(s => {
                                    if (s.status === 'Rejected' || s.status === 'Not Started') return;
                                    
                                    const expDate = s.expectedPaymentDate ? new Date(s.expectedPaymentDate) : today;
                                    let effectiveDate = expDate < today ? today : expDate; // Overdue is expected today
                                    
                                    if (effectiveDate >= today && effectiveDate <= predictionEnd) {
                                        const stageIncome = transactions.filter(t => t.projectStageId === s.id && t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                                        const totalExpected = Number(s.expectedNetIncome) || 0;
                                        const remainingNet = Math.max(0, totalExpected - stageIncome);
                                        
                                        if (remainingNet > 0) {
                                            expectedIncomeEvents.push({
                                                date: formatDateStr(effectiveDate),
                                                amount: remainingNet,
                                                label: `${p.name} - ${s.name} (Overdue/Expected)`
                                            });
                                        }
                                    }
                                });
                            });
                            
                            // Expenses: Expected History
                            expectedTransactions.forEach(et => {
                                const etDate = new Date(et.date + 'T00:00:00');
                                let effectiveDate = etDate < today ? today : etDate;
                                if (effectiveDate >= today && effectiveDate <= predictionEnd) {
                                    if (et.type === 'expense') {
                                        expectedExpenseEvents.push({
                                            date: formatDateStr(effectiveDate),
                                            amount: Number(et.amount),
                                            label: et.description || 'Expected Expense'
                                        });
                                    } else {
                                        expectedIncomeEvents.push({
                                            date: formatDateStr(effectiveDate),
                                            amount: Number(et.amount),
                                            label: et.description || 'Expected Income'
                                        });
                                    }
                                }
                            });
                        }
                        
                        // 2. Generate Chart Data & Summary Stats in the target window
                        const chartData = [];
                        
                        // We need to calculate running balance correctly. 
                        // If predictionStart < today, we need historical balance. 
                        // The easiest way is to calculate from initial accounts balance up to predictionStart, then run loop.
                        let runningBalance = 0;
                        accounts.forEach(a => {
                            if (planningAccountId === 'all' || a.id === planningAccountId) {
                                runningBalance += (Number(a.initialBalance) || 0);
                            }
                        });
                        const txList = [...transactions].sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
                        
                        // Fast forward balance up to predictionStart
                        predictionStart.setHours(0,0,0,0);
                        txList.forEach(t => {
                            const d = new Date(t.date || t.createdAt);
                            d.setHours(0,0,0,0);
                            if (d < predictionStart) {
                                if (planningAccountId !== 'all') {
                                    if (t.type === 'transfer') {
                                        if (t.accountId === planningAccountId) runningBalance -= Number(t.amount);
                                        if (t.toAccountId === planningAccountId) runningBalance += Number(t.amount);
                                    } else {
                                        const accId = t.accountId || 'legacy';
                                        if (accId === planningAccountId) {
                                            if (t.type === 'income') runningBalance += Number(t.amount);
                                            if (t.type === 'expense') runningBalance -= Number(t.amount);
                                        }
                                    }
                                } else {
                                    if (t.type === 'income') runningBalance += Number(t.amount);
                                    if (t.type === 'expense') runningBalance -= Number(t.amount);
                                }
                            }
                        });
                        
                        let windowStartingBalance = runningBalance;
                        let windowExpectedIncome = 0;
                        let windowPredictedExpenses = 0;
                        
                        // Add the starting point to the graph (1 day before the window starts)
                        const startPointDate = new Date(predictionStart);
                        startPointDate.setDate(startPointDate.getDate() - 1);
                        chartData.push({
                            date: formatDateStr(startPointDate),
                            balance: windowStartingBalance,
                            shortDate: startPointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        });
                        
                        for (let i = 0; i <= daysInWindow; i++) {
                            const d = new Date(predictionStart);
                            d.setDate(d.getDate() + i);
                            d.setHours(0,0,0,0);
                            const dateStr = formatDateStr(d);
                            
                            // 1. Real history (past and today)
                            if (d <= today) {
                                const todaysTx = txList.filter(t => {
                                    const td = new Date(t.date || t.createdAt);
                                    return formatDateStr(td) === dateStr;
                                });
                                let dayInc = 0;
                                let dayExp = 0;
                                todaysTx.forEach(t => {
                                    if (planningAccountId !== 'all') {
                                        if (t.type === 'transfer') {
                                            if (t.accountId === planningAccountId) {
                                                runningBalance -= Number(t.amount);
                                                dayExp += Number(t.amount);
                                            }
                                            if (t.toAccountId === planningAccountId) {
                                                runningBalance += Number(t.amount);
                                                dayInc += Number(t.amount);
                                            }
                                        } else {
                                            const accId = t.accountId || 'legacy';
                                            if (accId === planningAccountId) {
                                                if (t.type === 'income') { dayInc += Number(t.amount); runningBalance += Number(t.amount); }
                                                if (t.type === 'expense') { dayExp += Number(t.amount); runningBalance -= Number(t.amount); }
                                            }
                                        }
                                    } else {
                                        if (t.type === 'income') { dayInc += Number(t.amount); runningBalance += Number(t.amount); }
                                        if (t.type === 'expense') { dayExp += Number(t.amount); runningBalance -= Number(t.amount); }
                                    }
                                });
                                windowExpectedIncome += dayInc;
                                windowPredictedExpenses += dayExp;
                            }
                            
                            // 2. Prediction baselines (strictly future)
                            if (d > today) {
                                let dayRecurringInc = 0;
                                const accountObj = accounts.find(a => a.id === planningAccountId);
                                const isMain = planningAccountId === 'all' || (accountObj && accountObj.label.toLowerCase().includes('main'));
                                
                                if (planningMode === 'history') {
                                    if (isMain) dayRecurringInc = dailyRecurringIncome;
                                } else {
                                    if (isMain) {
                                        const activeIncomeCategories = categories.filter(c => c.type === 'income');
                                        activeIncomeCategories.forEach(c => {
                                            const transferDay = Number(c.dayOfTransfer) || 1;
                                            const maxDaysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                                            const actualTransferDay = Math.min(transferDay, maxDaysInMonth);
                                            
                                            if (d.getDate() === actualTransferDay) {
                                                dayRecurringInc += (Number(c.amount) || 0);
                                            }
                                        });
                                    }
                                }
                                
                                runningBalance += dayRecurringInc;
                                runningBalance -= dailyAverageSpend;
                                windowExpectedIncome += dayRecurringInc;
                                windowPredictedExpenses += dailyAverageSpend;
                            }
                            
                            // 3. Expected Specific Events (today and future)
                            if (d >= today && planningMode === 'project') {
                                const accountObj = accounts.find(a => a.id === planningAccountId);
                                const isMain = planningAccountId === 'all' || (accountObj && accountObj.label.toLowerCase().includes('main'));
                                
                                const todaysIncEvents = expectedIncomeEvents.filter(e => e.date === dateStr);
                                todaysIncEvents.forEach(e => {
                                    if (isMain) {
                                        runningBalance += e.amount;
                                        windowExpectedIncome += e.amount;
                                    }
                                });
                                
                                const todaysExpEvents = expectedExpenseEvents.filter(e => e.date === dateStr);
                                todaysExpEvents.forEach(e => {
                                    if (isMain) {
                                        runningBalance -= e.amount;
                                        windowPredictedExpenses += e.amount;
                                    }
                                });
                            }
                            
                            chartData.push({
                                date: dateStr,
                                balance: runningBalance,
                                shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            });
                        }

                        // Determine safety color
                        const projectedEndBalance = runningBalance;
                        const isSafe = projectedEndBalance >= 0;
                        const balanceColorClass = isSafe ? 'text-indigo-700' : 'text-red-600';
                        const balanceBgClass = isSafe ? 'bg-indigo-50/30 border-indigo-200' : 'bg-red-50/30 border-red-200';

                        return (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in relative">
                                
                                {/* Control Panel */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end relative z-30">
                                    <div className="flex-1 space-y-1 w-full">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planning Mode</label>
                                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1 flex font-bold text-xs h-[38px]">
                                            <button 
                                                className={`flex-1 rounded-md transition-colors ${planningMode === 'history' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                                onClick={() => setPlanningMode('history')}
                                            >
                                                History
                                            </button>
                                            <button 
                                                className={`flex-1 rounded-md transition-colors ${planningMode === 'project' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                                                onClick={() => setPlanningMode('project')}
                                            >
                                                Expected
                                            </button>
                                        </div>
                                    </div>
                                    <DateRangePicker 
                                        label="Lookback Window" 
                                        range={lookbackDateRange} 
                                        setRange={setLookbackDateRange} 
                                        presets={[
                                            { label: 'This Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth(), 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }}},
                                            { label: 'Last Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth() - 1, 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth(), 0)) }}},
                                            { label: 'Last 30 Days', getRange: () => { const d = new Date(); const prev = new Date(d); prev.setDate(prev.getDate() - 30); return { start: formatDateStr(prev), end: formatDateStr(d) }}},
                                            { label: 'Last 90 Days', getRange: () => { const d = new Date(); const prev = new Date(d); prev.setDate(prev.getDate() - 90); return { start: formatDateStr(prev), end: formatDateStr(d) }}},
                                            { label: 'All Time (Past)', getRange: () => { const d = new Date(); const prev = new Date(d); prev.setFullYear(prev.getFullYear() - 1); return { start: formatDateStr(prev), end: formatDateStr(d) }}},
                                            { label: 'Custom', isCustom: true }
                                        ]} 
                                    />
                                    <DateRangePicker 
                                        label="Prediction Window" 
                                        range={predictionDateRange} 
                                        setRange={setPredictionDateRange} 
                                        presets={[
                                            { label: 'This Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth(), 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }}},
                                            { label: 'Next Month', getRange: () => { const d = new Date(); return { start: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 1)), end: formatDateStr(new Date(d.getFullYear(), d.getMonth() + 2, 0)) }}},
                                            { label: 'Next 30 Days', getRange: () => { const d = new Date(); const next = new Date(d); next.setDate(next.getDate() + 30); return { start: formatDateStr(d), end: formatDateStr(next) }}},
                                            { label: 'Next 90 Days', getRange: () => { const d = new Date(); const next = new Date(d); next.setDate(next.getDate() + 90); return { start: formatDateStr(d), end: formatDateStr(next) }}},
                                            { label: 'All Time (Future)', getRange: () => { const d = new Date(); const next = new Date(d); next.setFullYear(next.getFullYear() + 1); return { start: formatDateStr(d), end: formatDateStr(next) }}},
                                            { label: 'Custom', isCustom: true }
                                        ]} 
                                    />
                                    <div className="flex-[2] space-y-1 w-full md:w-auto">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Planning Account</label>
                                        <select 
                                            value={planningAccountId}
                                            onChange={e => setPlanningAccountId(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-700 h-[38px] outline-none focus:border-blue-500"
                                        >
                                            <option value="all">All Accounts</option>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-[2] space-y-1 w-full relative group">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expense Categories</label>
                                        <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-bold cursor-pointer flex justify-between items-center h-[38px]">
                                            <span className="truncate">
                                                {selectedPredictionCategories.length === 0 
                                                    ? 'All Expense Categories' 
                                                    : `${selectedPredictionCategories.length} Categories Selected`}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                                        </div>
                                        <div className="absolute top-[60px] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 hidden group-hover:block max-h-64 overflow-y-auto p-2">
                                            <div className="text-[10px] text-slate-400 font-bold mb-2 uppercase px-2">Filter Predicted Expenses</div>
                                            <div 
                                                className={`p-2 rounded-lg cursor-pointer text-xs font-bold mb-1 ${selectedPredictionCategories.length === 0 ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'}`}
                                                onClick={() => setSelectedPredictionCategories([])}
                                            >
                                                All Categories
                                            </div>
                                            {categories.filter(c => c.type === 'expense').map(c => (
                                                <div 
                                                    key={c.id} 
                                                    className={`p-2 rounded-lg cursor-pointer text-xs font-bold flex items-center justify-between mb-1 ${selectedPredictionCategories.includes(c.id) ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-700'}`}
                                                    onClick={() => {
                                                        if (selectedPredictionCategories.includes(c.id)) {
                                                            setSelectedPredictionCategories(selectedPredictionCategories.filter(id => id !== c.id));
                                                        } else {
                                                            setSelectedPredictionCategories([...selectedPredictionCategories, c.id]);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}}></div>
                                                        {c.label}
                                                    </div>
                                                    {selectedPredictionCategories.includes(c.id) && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20">
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden bg-slate-50/50">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Window Starting Balance</div>
                                        <div className="text-2xl font-black text-slate-700">
                                            {formatMoney(windowStartingBalance)}
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-bold mt-1">On {new Date(predictionDateRange.start).toLocaleDateString()}</div>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm relative overflow-hidden bg-blue-50/30">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Window Expected Income</div>
                                        <div className="text-2xl font-black text-blue-600">
                                            {formatMoney(windowExpectedIncome)}
                                        </div>
                                        <div className="text-[9px] text-blue-400 font-bold mt-1">Based on {formatMoney(windowExpectedIncome / (daysInWindow + 1))}/day avg</div>
                                        <Target className="w-12 h-12 absolute -right-3 -bottom-3 text-blue-100 opacity-50" />
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm relative overflow-hidden bg-red-50/30">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Window Predicted Expenses</div>
                                        <div className="text-2xl font-black text-red-600">
                                            {formatMoney(windowPredictedExpenses)}
                                        </div>
                                        <div className="text-[9px] text-red-400 font-bold mt-1">{formatMoney(windowPredictedExpenses / (daysInWindow + 1))}/day avg</div>
                                        <TrendingDown className="w-12 h-12 absolute -right-3 -bottom-3 text-red-100 opacity-50" />
                                    </div>
                                    <div className={`bg-white p-5 rounded-2xl border shadow-sm relative overflow-hidden ${balanceBgClass}`}>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Projected End Balance</div>
                                        <div className={`text-2xl font-black ${balanceColorClass}`}>
                                            {formatMoney(projectedEndBalance)}
                                        </div>
                                        <div className="text-[9px] text-slate-500 font-bold mt-1">On {new Date(predictionDateRange.end).toLocaleDateString()}</div>
                                        <Wallet className={`w-12 h-12 absolute -right-3 -bottom-3 opacity-50 ${isSafe ? 'text-indigo-100' : 'text-red-100'}`} />
                                    </div>
                                </div>

                                {/* Main Chart */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Cash Flow Projection</h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Projected Balance</div>
                                        </div>
                                    </div>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={isSafe ? '#6366f1' : '#ef4444'} stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor={isSafe ? '#6366f1' : '#ef4444'} stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} tickFormatter={(val) => `֏${(val/1000)}k`} />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', padding: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                                    itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }} 
                                                    labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}
                                                    formatter={(val) => formatMoney(val)} 
                                                />
                                                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="balance" 
                                                    name="Balance"
                                                    stroke={isSafe ? '#6366f1' : '#ef4444'} 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorBalance)" 
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: isSafe ? '#6366f1' : '#ef4444' }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Expected History Section */}
                                {planningMode === 'project' && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-10 mt-6">
                                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Expected History</h3>
                                            <button 
                                                onClick={() => {
                                                    if (isAddingExpected) {
                                                        setIsEditingExpectedId(null);
                                                        setExpectedForm({ date: expectedForm.date, description: '', amount: '', type: 'expense', categoryId: '' });
                                                    }
                                                    setIsAddingExpected(!isAddingExpected);
                                                }}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1"
                                            >
                                                {isAddingExpected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                {isAddingExpected ? 'Cancel' : 'Plan Transaction'}
                                            </button>
                                        </div>
                                        
                                        {isAddingExpected && (
                                            <div className="p-4 bg-blue-50/50 border-b border-slate-200">
                                                <form onSubmit={handleAddExpectedTransaction} className="flex flex-wrap items-end gap-3">
                                                    <div className="flex-1 min-w-[150px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                                                        <input type="date" required value={expectedForm.date} onChange={e => setExpectedForm({...expectedForm, date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-[150px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                                                        <select value={expectedForm.type} onChange={e => setExpectedForm({...expectedForm, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500">
                                                            <option value="expense">Expense</option>
                                                            <option value="income">Income</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex-[2] min-w-[200px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                                                        <input type="text" required placeholder="e.g. Taxes, Vacation, New Laptop" value={expectedForm.description} onChange={e => setExpectedForm({...expectedForm, description: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-[150px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                                                        <select value={expectedForm.categoryId} onChange={e => setExpectedForm({...expectedForm, categoryId: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500">
                                                            <option value="">Uncategorized</option>
                                                            {categories.filter(c => c.type === expectedForm.type).map(c => (
                                                                <option key={c.id} value={c.id}>{c.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex-1 min-w-[120px]">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Amount</label>
                                                        <input type="number" required placeholder="0" value={expectedForm.amount} onChange={e => setExpectedForm({...expectedForm, amount: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-blue-500" />
                                                    </div>
                                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors h-[34px]">
                                                        {isEditingExpectedId ? 'Save' : 'Add'}
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                        
                                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto no-scrollbar">
                                            {expectedTransactions.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">No planned transactions</div>
                                            ) : (
                                                [...expectedTransactions].sort((a,b) => new Date(a.date) - new Date(b.date)).map((et) => {
                                                    const cat = categories.find(c => c.id === et.categoryId);
                                                    return (
                                                    <div key={et.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#94a3b8' }} />
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-800">{et.description}</div>
                                                                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
                                                                    <Calendar className="w-3 h-3"/> {et.date} {cat && `• ${cat.label}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex items-center gap-4">
                                                            <div className={`text-sm font-black ${et.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                                {et.type === 'expense' ? '-' : '+'}{formatMoney(et.amount)}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button onClick={() => {
                                                                    setExpectedForm({
                                                                        date: et.date,
                                                                        description: et.description,
                                                                        amount: et.amount,
                                                                        type: et.type || 'expense',
                                                                        categoryId: et.categoryId || ''
                                                                    });
                                                                    setIsEditingExpectedId(et.id);
                                                                    setIsAddingExpected(true);
                                                                }} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                                                                    <Edit3 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleConfirmExpectedTransaction(et)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Confirm (Move to real history)">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleDeleteExpectedTransaction(et.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Delete">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )})
                                            )}
                                        </div>
                                    </div>
                                )}


                            </div>
                        );
                    })()}

                    {dashboardTab === 'history' && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
                            {/* Accounts Section */}
                            <div className="grid grid-cols-2 md:flex md:flex-row gap-4 pb-2 no-scrollbar">
                                {accounts.map(acc => (
                                    <div key={acc.id} onClick={() => { setEditingAccountData(acc); setIsEditingAccount(true); }} className="w-full md:min-w-[150px] bg-white shadow-sm border border-slate-200 p-4 rounded-xl cursor-pointer hover:border-slate-300 transition-all flex flex-col gap-2 relative overflow-hidden group">
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
                                <button onClick={() => { setEditingAccountData({ label: '', initialBalance: 0, color: '#3b82f6' }); setIsEditingAccount(true); }} className="w-full md:min-w-[150px] bg-slate-50 border border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all min-h-[80px]">
                                    <Plus className="w-5 h-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">New Account</span>
                                </button>
                            </div>

                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm border border-slate-200/40 p-4 rounded-xl border border-slate-200 gap-4">
                                <div className="flex items-center justify-between w-full md:w-auto gap-2">
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest shrink-0">Transactions • {getDateRangeLabel()}</h3>
                                    {viewMode === 'admin' && (
                                        <button 
                                            onClick={() => setIsAddingTransaction(true)}
                                            className="md:hidden flex px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all items-center gap-1 shrink-0"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Log
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden md:flex items-center gap-1"><Filter className="w-3 h-3"/></span>
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
                                    <select 
                                        value={historyFilter.accountId}
                                        onChange={e => setHistoryFilter({...historyFilter, accountId: e.target.value})}
                                        className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 max-w-[150px] truncate"
                                    >
                                        <option value="all">All Accounts</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.label}</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                                        <span className="text-[9px] font-bold uppercase text-slate-400">Min:</span>
                                        <input 
                                            type="number" 
                                            placeholder="0" 
                                            value={historyFilter.minAmount}
                                            onChange={e => setHistoryFilter({...historyFilter, minAmount: e.target.value})}
                                            className="w-12 bg-transparent text-xs font-mono font-bold text-slate-700 outline-none"
                                        />
                                        <span className="text-slate-300">|</span>
                                        <span className="text-[9px] font-bold uppercase text-slate-400">Max:</span>
                                        <input 
                                            type="number" 
                                            placeholder="∞" 
                                            value={historyFilter.maxAmount}
                                            onChange={e => setHistoryFilter({...historyFilter, maxAmount: e.target.value})}
                                            className="w-12 bg-transparent text-xs font-mono font-bold text-slate-700 outline-none"
                                        />
                                    </div>
                                    {(historyFilter.type !== 'all' || historyFilter.categoryId !== 'all' || historyFilter.accountId !== 'all' || historyFilter.minAmount !== '' || historyFilter.maxAmount !== '') && (
                                        <button onClick={() => setHistoryFilter({type:'all', categoryId:'all', accountId:'all', minAmount:'', maxAmount:''})} className="text-[10px] text-blue-500 hover:underline font-bold px-2 shrink-0">Clear</button>
                                    )}
                                    <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>
                                    <button 
                                        onClick={() => setIsAddingTransaction(true)}
                                        className="hidden md:flex px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase transition-all items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Log
                                    </button>
                                </div>
                            </div>
                            {(() => {
                                const filteredList = monthTransactions.filter(t => {
                                    if (historyFilter.type !== 'all' && t.type !== historyFilter.type) return false;
                                    if (historyFilter.categoryId !== 'all' && t.categoryId !== historyFilter.categoryId) return false;
                                    
                                    // Account filter
                                    if (historyFilter.accountId !== 'all') {
                                        if (t.type === 'transfer') {
                                            if (t.accountId !== historyFilter.accountId && t.toAccountId !== historyFilter.accountId) return false;
                                        } else {
                                            const accId = t.accountId || '';
                                            if (accId !== historyFilter.accountId) return false;
                                        }
                                    }

                                    // Amount range filter
                                    const amount = Number(t.amount);
                                    if (historyFilter.minAmount !== '' && amount < Number(historyFilter.minAmount)) return false;
                                    if (historyFilter.maxAmount !== '' && amount > Number(historyFilter.maxAmount)) return false;

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
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Income</div>
                                                <div className="text-base font-black text-green-600 mt-1">+{formatMoney(filteredIncome)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expenses</div>
                                                <div className="text-base font-black text-red-600 mt-1">-{formatMoney(filteredExpense)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUM</div>
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
                                                                            {dailyNet >= 0 ? '+' : ''}{formatMoney(dailyNet)}
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
                                                                                     <button onClick={() => { setNewTransaction({...t, date: getLocalYYYYMMDD(t.createdAt)}); setIsAddingTransaction(true); }} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600"><Edit3 className="w-3 h-3" /></button>
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
                            {(() => {
                                const difference = activeIncome - activeExpense;
                                const dailyProfit = analyticsSource === 'actual' ? (difference / (activeDays || 1)) : (difference / 30);
                                const dailySpend = analyticsSource === 'actual' ? (monthActualExpense / (activeDays || 1)) : (projectedMonthlyExpense / 30);
                                
                                const stats = [
                                    { title: analyticsSource === 'actual' ? "Actual Income" : "Planned Income", amount: activeIncome, color: "text-blue-500", bg: "bg-blue-100", icon: TrendingUp },
                                    { title: analyticsSource === 'actual' ? "Actual Expense" : "Planned Expense", amount: activeExpense, color: "text-red-500", bg: "bg-red-100", icon: TrendingDown },
                                    { title: "Net Difference", amount: difference, color: difference >= 0 ? "text-emerald-500" : "text-red-500", bg: difference >= 0 ? "bg-emerald-100" : "bg-red-100", icon: Wallet },
                                    { title: "Daily Avg Spend", amount: dailySpend, color: "text-amber-500", bg: "bg-amber-100", icon: Calendar, onClick: () => setShowDailyAvgBreakdown(!showDailyAvgBreakdown) },
                                    { title: "Daily Profit", amount: dailyProfit, color: dailyProfit >= 0 ? "text-emerald-500" : "text-red-500", bg: dailyProfit >= 0 ? "bg-emerald-100" : "bg-red-100", icon: TrendingUp },
                                    { title: "Current Balance", amount: totalCurrentLiquidity, color: "text-purple-500", bg: "bg-purple-100", icon: PieChart }
                                ];

                                return (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {stats.map((s, i) => {
                                            const Icon = s.icon;
                                            return (
                                                <div 
                                                    key={i} 
                                                    onClick={s.onClick} 
                                                    className={`p-3.5 rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group ${s.onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md transition-all' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                                        <div className={`p-1.5 rounded-lg ${s.bg} ${s.color} bg-opacity-50`}>
                                                            <Icon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{s.title}</div>
                                                    </div>
                                                    <div className="text-sm sm:text-base font-black text-slate-800 relative z-10">
                                                        {s.amount < 0 ? '-' : ''}{formatMoney ? formatMoney(Math.abs(s.amount)) : `$${Math.abs(s.amount).toLocaleString()}`}
                                                    </div>
                                                    {/* subtle background glow */}
                                                    <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-20 ${s.bg} z-0 group-hover:opacity-40 transition-opacity`} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Daily Spending Breakdown Widget */}
                            {showDailyAvgBreakdown && (
                                <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl animate-in slide-in-from-top duration-300 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-amber-500" /> Daily Spending Breakdown
                                            </h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                                                Showing actual vs. planned daily average per category ({getDateRangeLabel()})
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => setShowDailyAvgBreakdown(false)}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                                        {dailyAvgCategoryBreakdown.map((item, idx) => {
                                            const hasBudget = item.plannedDaily > 0;
                                            const isOver = hasBudget && item.actualDaily > item.plannedDaily;
                                            const overAmount = isOver ? item.actualDaily - item.plannedDaily : 0;
                                            
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                                                >
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div 
                                                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                                style={{ backgroundColor: item.color }} 
                                                            />
                                                            <span className="font-bold text-slate-800 truncate text-xs">{item.label}</span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="font-mono font-extrabold text-slate-800 text-xs">
                                                                {formatMoney(item.actualDaily)} <span className="text-[9px] text-slate-400 font-normal">/ day</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-1">
                                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                            <span>
                                                                {hasBudget 
                                                                    ? `Budget: ${formatMoney(item.plannedDaily)} / day`
                                                                    : 'No Plan Set'
                                                                }
                                                            </span>
                                                            {hasBudget && (
                                                                <span className={isOver ? 'text-red-500 font-extrabold' : 'text-slate-600'}>
                                                                    {isOver 
                                                                        ? `Over by ${formatMoney(overAmount)} / day`
                                                                        : `${(100 - (item.actualDaily / item.plannedDaily) * 100).toFixed(0)}% Left`
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {hasBudget && (
                                                            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="h-full rounded-full transition-all duration-1000" 
                                                                    style={{ 
                                                                        width: `${Math.min((item.actualDaily / item.plannedDaily) * 100, 100)}%`, 
                                                                        backgroundColor: isOver ? '#ef4444' : item.color 
                                                                    }} 
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {dailyAvgCategoryBreakdown.length === 0 && (
                                            <div className="col-span-full text-center py-8 text-slate-400 italic text-xs">
                                                No expenses recorded for this period.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500"/> {analyticsSource === 'actual' ? 'Spending Flow' : 'Daily Projection (Not Available)'}
                                        </h3>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {analyticsSource !== 'budget' && (
                                                <>
                                                    {/* Grouping Toggle */}
                                                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSpendingGrouping('day')} 
                                                            className={`px-2.5 py-1 rounded-md transition-all ${spendingGrouping === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            Days
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSpendingGrouping('week')} 
                                                            className={`px-2.5 py-1 rounded-md transition-all ${spendingGrouping === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            Weeks
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSpendingGrouping('month')} 
                                                            className={`px-2.5 py-1 rounded-md transition-all ${spendingGrouping === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            Months
                                                        </button>
                                                    </div>


                                                </>
                                            )}
                                            {analyticsSource !== 'budget' && dailyActivity.length > 0 && (
                                                <button onClick={() => setExpandedChart('bar')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full h-full min-h-0">
                                    {analyticsSource === 'budget' ? (
                                        <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                                            Budget is averaged daily. Switch to 'Actuals' to see daily transactions.
                                        </div>
                                    ) : dailyActivity.length > 0 ? (
                                            <ResponsiveContainer width="99%" height="100%">
                                                <BarChart data={dailyActivity} stackOffset="sign">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                                    <XAxis dataKey="day" stroke="#666" fontSize={10} tickLine={false} axisLine={false} interval={spendingGrouping === 'day' ? 2 : 0} />
                                                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `${currencySymbol}${val}`} />
                                                    <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                                                    <RechartsTooltip content={<CustomTooltip selectedDate={selectedDate} getMonthLabel={getMonthLabel} formatMoney={formatMoney} categories={categories} />} />
                                                    {incomeCategories.map(c => (
                                                        <Bar key={c.id} dataKey={`IN_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#10b981'} radius={[4, 4, 0, 0]} />
                                                    ))}
                                                    <Bar dataKey="IN_Other" name="Other Income" stackId="spending" fill="#64748b" radius={[4, 4, 0, 0]} />
                                                    
                                                    {expenseCategories.map(c => (
                                                        <Bar key={c.id} dataKey={`OUT_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#ef4444'} radius={[0, 0, 4, 4]} />
                                                    ))}
                                                    <Bar dataKey="OUT_Other" name="Other Expense" stackId="spending" fill="#475569" radius={[0, 0, 4, 4]} />
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

                             {/* Balance History Chart */}
                             <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl h-[400px] min-h-[400px] flex flex-col relative group">
                                 <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                     <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                         <Wallet className="w-4 h-4 text-emerald-500"/> Balance History
                                     </h3>
                                     <div className="flex items-center gap-3 flex-wrap">
                                         <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceChartMode('net_worth')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceChartMode === 'net_worth' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Balance
                                             </button>
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceChartMode('net_flow')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceChartMode === 'net_flow' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Net Flow
                                             </button>
                                         </div>
                                         <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceGrouping('day')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceGrouping === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Days
                                             </button>
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceGrouping('week')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceGrouping === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Weeks
                                             </button>
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceGrouping('month')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceGrouping === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Months
                                             </button>
                                         </div>
                                         <button onClick={() => setExpandedChart('area')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                                 <div className="flex-1 w-full h-full min-h-0">
                                     {balanceHistoryData.length > 0 ? (
                                         <ResponsiveContainer width="99%" height="100%">
                                             <AreaChart data={balanceHistoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                 <defs>
                                                     <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                                                         <stop offset="5%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0.2}/>
                                                         <stop offset="95%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
                                                     </linearGradient>
                                                 </defs>
                                                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                 <XAxis 
                                                     dataKey="label" 
                                                     stroke="#94a3b8" 
                                                     fontSize={10} 
                                                     fontWeight={600}
                                                     tickLine={false} 
                                                     axisLine={false} 
                                                     dy={10}
                                                 />
                                                 <YAxis 
                                                     stroke="#94a3b8" 
                                                     fontSize={10} 
                                                     fontWeight={600}
                                                     tickLine={false} 
                                                     axisLine={false} 
                                                     tickFormatter={val => formatMoney(val)}
                                                     dx={-10}
                                                 />
                                                 <RechartsTooltip 
                                                     contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                                     itemStyle={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }} 
                                                     labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }} 
                                                     formatter={(val) => [formatMoney(val), balanceChartMode === 'net_worth' ? "Net Worth" : "Net Flow"]} 
                                                 />
                                                 <Area 
                                                     type="monotone" 
                                                     dataKey={balanceChartMode === 'net_worth' ? "balance" : "netFlow"} 
                                                     stroke={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} 
                                                     strokeWidth={2.5}
                                                     fillOpacity={1} 
                                                     fill="url(#balanceGrad)" 
                                                 />
                                             </AreaChart>
                                         </ResponsiveContainer>
                                     ) : (
                                         <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                             <span className="text-xs">No balance history data available</span>
                                         </div>
                                     )}
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
                                
                                {['income', 'expense'].includes(newTransaction.type) && projects.length > 0 && (
                                    <>
                                        <div className="space-y-1 col-span-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Link to Project (Optional)</label>
                                            <select
                                                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                                                value={newTransaction.projectId || ''}
                                                onChange={e => setNewTransaction({ ...newTransaction, projectId: e.target.value, projectStageId: '' })}
                                            >
                                                <option value="">None</option>
                                                {projects.filter(p => p.status !== 'Archived').map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {newTransaction.projectId && (
                                            <div className="space-y-1 col-span-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Project Stage</label>
                                                <select
                                                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                                                    value={newTransaction.projectStageId || ''}
                                                    onChange={e => setNewTransaction({ ...newTransaction, projectStageId: e.target.value })}
                                                >
                                                    <option value="">Select Stage</option>
                                                    {projects.find(p => p.id === newTransaction.projectId)?.stages?.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}
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
                                {expandedChart === 'pie' ? (analyticsSource === 'actual' ? 'Spending Breakdown (Actual)' : 'Budget Allocation (Planned)') : 'Spending Flow'}
                            </h2>
                            {expandedChart === 'bar' && (
                                <>
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
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grouping:</span>
                                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                            <button 
                                                type="button"
                                                onClick={() => setSpendingGrouping('day')} 
                                                className={`px-2 py-1 rounded-md transition-all ${spendingGrouping === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Days
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setSpendingGrouping('week')} 
                                                className={`px-2 py-1 rounded-md transition-all ${spendingGrouping === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Weeks
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setSpendingGrouping('month')} 
                                                className={`px-2 py-1 rounded-md transition-all ${spendingGrouping === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                            >
                                                Months
                                            </button>
                                        </div>
                                    </div>
                                </>
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
                                            const daysForAvg = analyticsSource === 'actual' ? activeDaysInMonth : daysInMonth;
                                            const dailyAvg = item.value / daysForAvg;

                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => {
                                                        if (item.id) {
                                                            setHistoryFilter({ type: analyticsSource === 'budget' ? 'expense' : 'all', categoryId: item.id, accountId: 'all', minAmount: '', maxAmount: '' });
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

                        {expandedChart === 'area' && balanceHistoryData.length > 0 && (
                            <div className="flex flex-col w-full h-full">
                                {/* Chart Section */}
                                <div className="w-full h-full p-6 md:p-12">
                                     <ResponsiveContainer width="100%" height="100%">
                                         <AreaChart data={balanceHistoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                             <defs>
                                                 <linearGradient id="balanceGradExpand" x1="0" y1="0" x2="0" y2="1">
                                                     <stop offset="5%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0.2}/>
                                                     <stop offset="95%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
                                                 </linearGradient>
                                             </defs>
                                             <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                             <XAxis 
                                                 dataKey="label" 
                                                 stroke="#94a3b8" 
                                                 fontSize={12} 
                                                 fontWeight={600}
                                                 tickLine={false} 
                                                 axisLine={false} 
                                                 tickMargin={12}
                                             />
                                             <YAxis 
                                                 stroke="#94a3b8" 
                                                 fontSize={12} 
                                                 fontWeight={600}
                                                 tickLine={false} 
                                                 axisLine={false} 
                                                 tickFormatter={val => formatMoney(val)}
                                                 tickMargin={12}
                                             />
                                             <RechartsTooltip 
                                                 contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                                 itemStyle={{ color: '#fff', fontSize: '14px', fontFamily: 'monospace' }} 
                                                 labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }} 
                                                 formatter={(val) => [formatMoney(val), balanceChartMode === 'net_worth' ? "Net Worth" : "Net Flow"]} 
                                             />
                                             <Area 
                                                 type="monotone" 
                                                 dataKey={balanceChartMode === 'net_worth' ? "balance" : "netFlow"} 
                                                 stroke={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} 
                                                 strokeWidth={3}
                                                 fillOpacity={1} 
                                                 fill="url(#balanceGradExpand)" 
                                             />
                                         </AreaChart>
                                     </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {expandedChart === 'bar' && dailyActivity.length > 0 && (
                            <div className="flex flex-col w-full h-full">
                                {/* Chart Section */}
                                <div className="w-full h-full p-6 md:p-12">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={dailyActivity} stackOffset="sign" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} interval={spendingGrouping === 'day' ? 2 : 0} />
                                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `${currencySymbol}${val}`} tickMargin={8} />
                                                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                                                <RechartsTooltip content={<CustomTooltip selectedDate={selectedDate} getMonthLabel={getMonthLabel} formatMoney={formatMoney} categories={categories} />} />
                                                {incomeCategories.map(c => (
                                                    <Bar key={c.id} dataKey={`IN_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#10b981'} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                ))}
                                                <Bar dataKey="IN_Other" name="Other Income" stackId="spending" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                
                                                {expenseCategories.map(c => (
                                                    <Bar key={c.id} dataKey={`OUT_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#ef4444'} radius={[0, 0, 4, 4]} maxBarSize={40} />
                                                ))}
                                                <Bar dataKey="OUT_Other" name="Other Expense" stackId="spending" fill="#475569" radius={[0, 0, 4, 4]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
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
