import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard, DollarSign, PieChart, TrendingUp, TrendingDown,
    CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownRight, Filter,
    Download, Settings, CheckSquare, Eye, EyeOff, Trash2, X,
    Calendar, Calculator, Edit3, Save as SaveIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

import TaskBoard from '../../components/MissionControl/TaskBoard';
import NotesBoard from '../../components/MissionControl/NotesBoard';
import DailyProtocol from '../../components/MissionControl/DailyProtocol';
import GoalsBoard from '../../components/MissionControl/GoalsBoard';

// --- Helper Components ---

const StatCard = ({ title, amount, subtext, icon: Icon, color, isNegative, onClick, formatMoney }) => (
    <div onClick={onClick} className={`bg-neutral-900/40 border border-white/5 p-6 rounded-2xl flex items-start justify-between relative overflow-hidden group cursor-pointer hover:border-white/10 transition-all`}>
        <div className={`absolute top-0 right-0 p-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20`} style={{ backgroundColor: color }} />
        <div className="relative z-10">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">{title}</h3>
            <div className="text-2xl font-black text-white mb-2">
                {formatMoney ? formatMoney(amount) : `$${amount.toLocaleString()}`}
            </div>
            {subtext && (
                <div className={`flex items-center gap-1 text-[10px] font-bold opacity-70`}>
                    <span style={{ color: isNegative ? '#ef4444' : '#10b981' }}>{subtext}</span>
                </div>
            )}
        </div>
        <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${isNegative ? 'text-red-500' : 'text-white'}`} style={{ color: color }}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const BudgetRow = ({ item, isExpense, onEdit, onDelete, currencySymbol = '$' }) => {
    // Calculations
    const amount = Number(item.amount) || 0;
    const period = Number(item.period) || 30; // Default to monthly if 0/undefined
    const activeMonths = item.activeMonths || Array.from({length:12},(_,i)=>i);
    
    // Normalized to Monthly (30 days)
    const monthly = (amount * 30) / period;
    // Normalized to Daily
    const daily = amount / period;
    // Normalized to Yearly (taking active months into account roughly)
    const yearly = daily * 365 * (activeMonths.length / 12);

    return (
        <div className="grid grid-cols-12 gap-4 items-center p-3 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 transition-all group text-xs">
            <div className="col-span-3 flex items-center gap-3">
                <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: (item.color || '#666') + '20', color: item.color || '#666' }}
                >
                    {item.label?.[0]}
                </div>
                <div>
                    <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</div>
                    <div className="text-[9px] text-neutral-500">{activeMonths.length === 12 ? 'All Year' : `${activeMonths.length} Months`}</div>
                </div>
            </div>
            <div className="col-span-2 text-neutral-400 flex flex-col leading-tight">
                <span>{period === 30 ? 'Monthly' : period === 365 ? 'Yearly' : period === 7 ? 'Weekly' : `${period} Days`}</span>
                {item.dayOfTransfer && <span className="text-[9px] text-neutral-600">Day {item.dayOfTransfer}</span>}
            </div>
            <div className="col-span-2 font-mono text-white text-right">
                {currencySymbol}{amount.toLocaleString()}
            </div>
            <div className="col-span-4 grid grid-cols-3 gap-2 text-right font-mono text-neutral-500">
                <div>{currencySymbol}{daily.toFixed(0)}</div>
                <div className={isExpense ? 'text-red-400' : 'text-green-400'}>{currencySymbol}{monthly.toFixed(0)}</div>
                <div>{yearly > 1000 ? (yearly/1000).toFixed(1) + 'k' : yearly.toFixed(0)}</div>
            </div>
            <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="text-neutral-500 hover:text-white"><Edit3 className="w-3 h-3" /></button>
                <button onClick={() => onDelete(item.id)} className="text-neutral-500 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
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
    tasksActions, notesActions, transactionsActions, categoriesActions, protocolsActions, goalsActions,
    viewMode, processTask,
    activeView, setActiveView,
    missionTab, setMissionTab
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

    // Transaction Management State
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'expense',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    // --- Data Processing (Month-Aware) ---
    const transactions = userData.transactions || [];
    const categories = userData.categories || [];
    
    const currentMonthKey = selectedDate.toISOString().slice(0, 7); // "YYYY-MM"

    // 1. Month Actuals
    const monthTransactions = transactions.filter(t => t.createdAt.startsWith(currentMonthKey));
    const monthActualIncome = monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const monthActualExpense = monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const monthNetBalance = monthActualIncome - monthActualExpense;

    // 2. Global Budget (Projected/Baseline)
    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

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
    const burnRateDaily = projectedMonthlyExpense / 30;

    // 3. Analytics Data Source Switcher
    const activeIncome = analyticsSource === 'actual' ? monthActualIncome : projectedMonthlyIncome;
    const activeExpense = analyticsSource === 'actual' ? monthActualExpense : projectedMonthlyExpense;
    const activeBalance = activeIncome - activeExpense;
    const totalCurrentLiquidity = transactions.reduce((acc, t) => acc + (t.type === 'income' ? 1 : -1) * Number(t.amount), 0);

    // 4. Pie Chart Data (Dynamic)
    const categoryBreakdown = useMemo(() => {
        if (analyticsSource === 'actual') {
            const map = {};
            monthTransactions.filter(t => t.type === 'expense').forEach(t => {
                const catId = t.categoryId || 'uncategorized';
                map[catId] = (map[catId] || 0) + Number(t.amount);
            });
            return Object.keys(map).map(id => {
                const cat = categories.find(c => c.id === id);
                return { name: cat ? cat.label : 'Other', value: map[id], color: cat ? cat.color : '#555' };
            }).filter(i => i.value > 0);
        } else {
            // Budget Source
            return expenseCategories.map(c => ({
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
            const dayTotal = monthTransactions
                .filter(t => t.type === 'expense' && t.createdAt.startsWith(dayStr))
                .reduce((acc, t) => acc + Number(t.amount), 0);
            days.push({ day: String(i), amount: dayTotal, fullDate: dayStr });
        }
        return days;
    }, [analyticsSource, monthTransactions, currentMonthKey, selectedDate]);


    // --- Actions ---

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

        const payload = {
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            createdAt: new Date(newTransaction.date).toISOString()
        };

        if (newTransaction.id) {
            await transactionsActions.update(newTransaction.id, payload);
        } else {
            await transactionsActions.add(payload);
        }

        setIsAddingTransaction(false);
        setNewTransaction({ ...newTransaction, id: undefined, amount: '', description: '' });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2" style={{ textShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>Finance</h1>
                        
                        {/* Currency Selector */}
                        <div className="relative group">
                            <button className="text-xl font-bold text-neutral-500 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                {CURRENCIES[currentCurrencyCode].symbol} <span className="text-[10px] uppercase align-top">{currentCurrencyCode}</span>
                            </button>
                            <div className="absolute top-full left-0 mt-2 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden hidden group-hover:block w-32 z-50 shadow-xl">
                                {Object.entries(CURRENCIES).map(([code, info]) => (
                                    <button 
                                        key={code}
                                        onClick={() => setCurrency(code)}
                                        className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-white/10 ${currentCurrencyCode === code ? 'text-green-500' : 'text-neutral-400'}`}
                                    >
                                        {info.symbol} {code}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Month Selector */}
                    <div className="flex items-center gap-4 mt-2">
                        <button onClick={() => adjustMonth(-1)} className="text-neutral-500 hover:text-white transition-colors"><ArrowDownRight className="w-4 h-4 rotate-45" /></button>
                        <span className="text-sm font-mono font-bold text-green-500 uppercase tracking-widest min-w-[140px] text-center">
                            {getMonthLabel(selectedDate)}
                        </span>
                        <button onClick={() => adjustMonth(1)} className="text-neutral-500 hover:text-white transition-colors"><ArrowUpRight className="w-4 h-4 rotate-45" /></button>
                    </div>
                </div>

                <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-white/5 self-start md:self-auto overflow-x-auto">
                    {['dashboard', 'tasks', 'notes'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveView(tab)}
                            className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeView === tab ? 'bg-green-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Switcher */}
            {activeView === 'dashboard' && (
                <div className="flex-1 flex flex-col">
                    {/* Dashboard Nav */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-1 mb-8 gap-4">
                        <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto">
                             {[
                                { id: 'budget', label: 'Planning', color: 'text-yellow-500' },
                                { id: 'overview', label: 'Analytics', color: 'text-green-500' },
                                { id: 'history', label: 'History', color: 'text-blue-500' }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setDashboardTab(t.id)}
                                    className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${dashboardTab === t.id ? t.color : 'text-neutral-500 hover:text-white'}`}
                                >
                                    {t.label}
                                    {dashboardTab === t.id && <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full bg-current`} />}
                                </button>
                            ))}
                        </div>
                        
                        {/* Source Toggle for Analytics */}
                        {dashboardTab === 'overview' && (
                            <div className="flex bg-neutral-900 rounded-lg p-1 border border-white/5 mb-1 self-start md:self-auto">
                                <button onClick={() => setAnalyticsSource('actual')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'actual' ? 'bg-green-600 text-white' : 'text-neutral-500'}`}>Actuals</button>
                                <button onClick={() => setAnalyticsSource('budget')} className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${analyticsSource === 'budget' ? 'bg-yellow-600 text-white' : 'text-neutral-500'}`}>Budget Plan</button>
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
                                    <div className="flex justify-between items-center bg-green-900/10 p-4 rounded-xl border border-green-500/20">
                                        <h3 className="text-sm font-black text-green-500 uppercase tracking-widest">Recurring Income Sources</h3>
                                        <button 
                                            onClick={() => { setEditingCategoryData({ type: 'income', label: '', amount: '', period: 30, color: '#10b981' }); setIsEditingCategory(true); }}
                                            className="p-2 bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-neutral-600 px-3">
                                        <div className="col-span-3">Source</div>
                                        <div className="col-span-2">Period</div>
                                        <div className="col-span-2 text-right">Amount</div>
                                        <div className="col-span-4 text-right pr-2">Daily/Monthly/Yearly</div>
                                    </div>
                                    <div className="space-y-2">
                                        {incomeCategories.map(cat => (
                                            <BudgetRow 
                                                key={cat.id} item={cat} isExpense={false} 
                                                onEdit={(item) => { setEditingCategoryData(item); setIsEditingCategory(true); }}
                                                onDelete={categoriesActions.delete}
                                                currencySymbol={currencySymbol}
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
                                            className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="hidden md:grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-neutral-600 px-3">
                                        <div className="col-span-3">Category</div>
                                        <div className="col-span-2">Period</div>
                                        <div className="col-span-2 text-right">Amount</div>
                                        <div className="col-span-4 text-right pr-2">Daily/Monthly/Yearly</div>
                                    </div>
                                    <div className="space-y-2">
                                        {expenseCategories.map(cat => (
                                            <BudgetRow 
                                                key={cat.id} item={cat} isExpense={true} 
                                                onEdit={(item) => { setEditingCategoryData(item); setIsEditingCategory(true); }}
                                                onDelete={categoriesActions.delete}
                                                currencySymbol={currencySymbol}
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
                             <div className="flex justify-between items-center bg-neutral-900/40 p-4 rounded-xl border border-white/5">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Transactions • {getMonthLabel(selectedDate)}</h3>
                                <button 
                                    onClick={() => setIsAddingTransaction(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Log Transaction
                                </button>
                            </div>
                            <div className="space-y-2">
                                {monthTransactions.length === 0 ? (
                                    <div className="text-center py-20 text-neutral-500 italic border border-dashed border-white/10 rounded-xl">No transactions in {getMonthLabel(selectedDate)}</div>
                                ) : (
                                    monthTransactions.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(t => {
                                        const cat = categories.find(c => c.id === t.categoryId);
                                        return (
                                            <div key={t.id} className="group relative flex justify-between items-center p-4 bg-black/20 border border-white/5 rounded-xl text-sm hover:bg-white/5 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#555' }} />
                                                    <div>
                                                        <div className="font-bold text-white">{t.description || 'Unknown'}</div>
                                                        <div className="text-[10px] text-neutral-500 uppercase">{new Date(t.createdAt).toLocaleDateString()} • {cat?.label || 'Uncategorized'}</div>
                                                    </div>
                                                </div>
                                                <div className={`font-mono font-bold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {t.type === 'income' ? '+' : '-'}{formatMoney(Math.abs(t.amount))}
                                                </div>
                                                
                                                {/* Edit/Delete Overlay */}
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black p-1 rounded-lg border border-white/10 shadow-xl">
                                                     <button onClick={() => { setNewTransaction({...t, date: t.createdAt.split('T')[0]}); setIsAddingTransaction(true); }} className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-white"><Edit3 className="w-3 h-3" /></button>
                                                     <button onClick={() => transactionsActions.delete(t.id)} className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                     {/* --- ANALYTICS VIEW --- */}
                     {dashboardTab === 'overview' && (
                         <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                             
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
                                <div className="bg-neutral-900/40 p-6 rounded-2xl border border-white/5 h-[400px] min-h-[400px] flex flex-col">
                                    <h3 className="text-xs font-bold text-white uppercase mb-4 tracking-widest flex items-center gap-2">
                                        <PieChart className="w-4 h-4 text-purple-500"/> {analyticsSource === 'actual' ? 'Spending Breakdown (Actual)' : 'Budget Allocation (Planned)'}
                                    </h3>
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
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} formatter={(val) => formatMoney(val)} />
                                                <Legend />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                                            <span className="text-xs">No data for this view in {getMonthLabel(selectedDate)}</span>
                                        </div>
                                    )}
                                    </div>
                                </div>

                                {/* Daily Spending Bar Chart */}
                                <div className="bg-neutral-900/40 p-6 rounded-2xl border border-white/5 h-[400px] min-h-[400px] flex flex-col">
                                    <h3 className="text-xs font-bold text-white uppercase mb-4 tracking-widest flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-blue-500"/> {analyticsSource === 'actual' ? 'Daily Spending Flow' : 'Daily Projection (Not Available)'}
                                    </h3>
                                    <div className="flex-1 w-full h-full min-h-0">
                                    {analyticsSource === 'budget' ? (
                                        <div className="h-full flex items-center justify-center text-neutral-500 text-xs">
                                            Budget is averaged daily. Switch to 'Actuals' to see daily transactions.
                                        </div>
                                    ) : dailyActivity.length > 0 ? (
                                        <ResponsiveContainer width="99%" height="100%">
                                            <BarChart data={dailyActivity}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                <XAxis dataKey="day" stroke="#666" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                                                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `${currencySymbol}${val}`} />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                                    labelFormatter={(label) => `${getMonthLabel(selectedDate)} ${label}`}
                                                    formatter={(val) => [formatMoney(val), 'Amount']}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                                            <span className="text-xs">No transactions found for {getMonthLabel(selectedDate)}</span>
                                        </div>
                                    )}
                                    </div>
                                </div>
                             </div>
                         </div>
                     )}
                </div>
            )}

            {activeView === 'tasks' && (
                <div className="flex-1 min-h-[600px] flex flex-col">
                    {/* Mission Control Tabs */}
                    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-1">
                        <button
                            onClick={() => setMissionTab('protocol')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'protocol' ? 'text-purple-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Routine
                            {missionTab === 'protocol' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setMissionTab('missions')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'missions' ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Tasks
                            {missionTab === 'missions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setMissionTab('goals')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'goals' ? 'text-yellow-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Strategic Goals
                            {missionTab === 'goals' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 rounded-t-full" />}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {missionTab === 'protocol' ? (
                             <DailyProtocol
                                 protocols={userData.protocols}
                                 actions={protocolsActions}
                                 moduleId="finance"
                                 viewMode={viewMode}
                                 processTask={processTask}
                                 settings={userData.gameplaySettings}
                             />
                        ) : missionTab === 'missions' ? (
                             <TaskBoard
                                tasks={userData.tasks}
                                actions={tasksActions}
                                moduleId="finance"
                                viewMode={viewMode}
                                processTask={processTask}
                                settings={userData.gameplaySettings}
                            /> 
                        ) : (
                             <GoalsBoard
                                 goals={userData.goals}
                                 tasks={userData.tasks}
                                 actions={goalsActions}
                                 viewMode={viewMode}
                                 processTask={processTask}
                                 moduleId="finance"
                             />
                        )}
                    </div>
                 </div>
            )}
             {activeView === 'notes' && (
                  <NotesBoard
                  notes={userData.notes}
                  actions={notesActions}
                  moduleId="finance"
                  viewMode={viewMode}
              />
            )}

            {/* --- MODALS --- */}

            {/* Category/Budget Modal */}
            {isEditingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-white uppercase">
                                {editingCategoryData?.id ? 'Edit Item' : 'New Budget Item'}
                            </h3>
                            <button onClick={() => setIsEditingCategory(false)}><X className="w-5 h-5 text-neutral-500" /></button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                    value={editingCategoryData.label}
                                    onChange={e => setEditingCategoryData({ ...editingCategoryData, label: e.target.value })}
                                    required autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Amount</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-mono focus:border-blue-500 outline-none"
                                        value={editingCategoryData.amount}
                                        onChange={e => setEditingCategoryData({ ...editingCategoryData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Period (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-mono focus:border-blue-500 outline-none"
                                        value={editingCategoryData.period}
                                        onChange={e => setEditingCategoryData({ ...editingCategoryData, period: e.target.value })}
                                        placeholder="30"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Active Months</label>
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
                                                 className={`h-8 rounded text-xs font-bold transition-all border border-white/5 ${
                                                     (editingCategoryData.activeMonths || Array.from({length:12},(_,x)=>x)).includes(i)
                                                     ? 'bg-white text-black' 
                                                     : 'bg-black text-neutral-500 hover:bg-white/10'
                                                 }`}
                                             >{m}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Day of Transfer</label>
                                    <input
                                        type="number"
                                        max="31" min="1"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-mono focus:border-blue-500 outline-none"
                                        value={editingCategoryData.dayOfTransfer || ''}
                                        onChange={e => setEditingCategoryData({ ...editingCategoryData, dayOfTransfer: e.target.value })}
                                        placeholder="e.g. 15"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Color</label>
                                    <input
                                        type="color"
                                        className="w-full h-[50px] bg-black border border-white/10 rounded-xl p-1 cursor-pointer"
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
             
            {/* Transaction Modal */}
            {isAddingTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                     <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-white uppercase">Log Transaction</h3>
                            <button onClick={() => setIsAddingTransaction(false)}><X className="w-5 h-5 text-neutral-500" /></button>
                        </div>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div className="flex bg-neutral-900 rounded-xl p-1 border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTransaction.type === 'expense' ? 'bg-red-500/20 text-red-500' : 'text-neutral-500'}`}
                                >Expense</button>
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTransaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'text-neutral-500'}`}
                                >Income</button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-lg font-mono focus:border-green-500 outline-none"
                                    value={newTransaction.amount}
                                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Grocery"
                                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-green-500 outline-none"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Category</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-green-500"
                                            value={newTransaction.categoryId}
                                            onChange={e => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.filter(c => c.type === newTransaction.type).map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button" 
                                            title="Create Category"
                                            onClick={() => { setIsAddingTransaction(false); setEditingCategoryData({ type: newTransaction.type, label: '', amount: '', period: 30, color: '#10b981' }); setIsEditingCategory(true); }}
                                            className="p-3 bg-white/10 rounded-xl hover:bg-white/20 text-white"
                                        >
                                            <Plus className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                                        value={newTransaction.date}
                                        onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 bg-white text-black font-bold uppercase rounded-xl hover:bg-neutral-200 transition-colors mt-2">
                                Save Transaction
                            </button>
                        </form>
                     </div>
                </div>
            )}

        </div>
    );
};

export default FinanceModule;
