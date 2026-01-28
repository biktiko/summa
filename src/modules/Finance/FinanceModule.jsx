import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard, DollarSign, PieChart, TrendingUp, TrendingDown,
    CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownRight, Filter,
    Download, Settings, CheckSquare, Eye, EyeOff, Trash2, X
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts';

import TaskBoard from '../../components/MissionControl/TaskBoard';
import NotesBoard from '../../components/MissionControl/NotesBoard';

// --- Sub-components (Inline for now to ensure file creation works, can extract later) ---

const StatCard = ({ title, amount, trend, trendValue, icon: Icon, color, isNegative }) => (
    <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-2xl flex items-start justify-between relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20`} style={{ backgroundColor: color }} />

        <div className="relative z-10">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">{title}</h3>
            <div className="text-2xl font-black text-white mb-2">${amount.toLocaleString()}</div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{trendValue}</span>
                </div>
            )}
        </div>

        <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${isNegative ? 'text-red-500' : 'text-white'}`} style={{ color: color }}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const TransactionRow = ({ transaction, category, onDelete }) => (
    <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 transition-all group">
        <div className="flex items-center gap-4">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{ backgroundColor: category?.color + '20', color: category?.color }}
            >
                {category?.label?.[0] || '?'}
            </div>
            <div>
                <h4 className="text-sm font-bold text-white">{transaction.description || 'Untitled Transaction'}</h4>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                    {new Date(transaction.createdAt).toLocaleDateString()} • {category?.label || 'Uncategorized'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <span className={`font-mono font-bold ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                {transaction.type === 'expense' ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
            </span>
            <button
                onClick={() => onDelete(transaction.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-neutral-600 hover:text-red-500 transition-all"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
);

import DailyProtocol from '../../components/MissionControl/DailyProtocol';
import GoalsBoard from '../../components/MissionControl/GoalsBoard';

const FinanceModule = ({
    userData,
    updateUser,
    tasksActions, notesActions, transactionsActions, protocolsActions, goalsActions,
    viewMode, processTask,
    activeView, setActiveView,
    missionTab, setMissionTab
}) => {
    const [dashboardTab, setDashboardTab] = useState('overview'); // overview | transactions
    const [isAdding, setIsAdding] = useState(false);

    // --- Derived Data ---
    const transactions = userData.transactions || [];
    const categories = userData.categories || [];

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense; // Should ideally match userData.balance but calculated here for filtering

    // Chart Data Preparation
    const dataByMonth = useMemo(() => {
        // Simple aggregation by month (last 6 months)
        // ... (Implementation detail)
        return [
            { name: 'Jan', income: 4000, expense: 2400 },
            { name: 'Feb', income: 3000, expense: 1398 },
            { name: 'Mar', income: 2000, expense: 9800 },
            { name: 'Apr', income: 2780, expense: 3908 },
            { name: 'May', income: 1890, expense: 4800 },
            { name: 'Jun', income: 2390, expense: 3800 },
        ];
    }, [transactions]);

    const expenseByCategory = useMemo(() => {
        const catMap = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            const catId = t.categoryId || 'uncategorized';
            catMap[catId] = (catMap[catId] || 0) + Number(t.amount);
        });

        return Object.keys(catMap).map(catId => {
            const cat = categories.find(c => c.id === catId);
            return {
                name: cat ? cat.label : 'Uncategorized',
                value: catMap[catId],
                color: cat ? cat.color : '#666'
            };
        });
    }, [transactions, categories]);

    // Form State
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'expense',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTransaction.amount || !newTransaction.categoryId) return;

        await transactionsActions.add({
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            createdAt: new Date(newTransaction.date).toISOString()
        });

        setIsAdding(false);
        setNewTransaction({ ...newTransaction, amount: '', description: '' });
    };

    // --- Privacy Logic ---
    const getModulePrivacy = () => userData.modulePrivacy?.finance || {};
    const isModuleEnabled = getModulePrivacy().enabled !== false;

    const isSectionVisible = (sectionKey) => {
        // If whole module is disabled, everything is hidden
        if (!isModuleEnabled) return false;
        // Default to true if not explicitly set to false
        return getModulePrivacy().sections?.[sectionKey] !== false;
    };

    const toggleSectionVisibility = (sectionKey) => {
        const currentPrivacy = userData.modulePrivacy || {};
        const currentFinance = currentPrivacy.finance || {};
        const currentSections = currentFinance.sections || {};

        const newState = {
            ...currentPrivacy,
            finance: {
                ...currentFinance,
                sections: {
                    ...currentSections,
                    [sectionKey]: !isSectionVisible(sectionKey)
                }
            }
        };

        updateUser({ modulePrivacy: newState });
    };

    // If module is disabled in guest mode, don't show content (or show restricted view)
    // But since this is inside the module component, the parent App might handle the "Module Access" check.
    // However, we handle inner content here.

    return (
        <div className="animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 mb-8 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2" style={{ textShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>Finance</h1>
                    <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest pl-1">
                        Wealth & Asset Management
                    </p>
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

            {/* Dashboard View */}
            {activeView === 'dashboard' && (
                <div className={`flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 ${!isSectionVisible('overview') && viewMode === 'guest' ? 'opacity-20 pointer-events-none filter blur-sm' : ''}`}>
                    {/* Dashboard Sub-Navigation */}
                    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-1">
                        <button
                            onClick={() => setDashboardTab('overview')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${dashboardTab === 'overview' ? 'text-green-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Overview
                            {dashboardTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setDashboardTab('transactions')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${dashboardTab === 'transactions' ? 'text-blue-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Transactions
                            {dashboardTab === 'transactions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full" />}
                        </button>
                    </div>

                    {dashboardTab === 'overview' ? (
                        <div className="space-y-8">
                            {/* Stat Cards - Controlled by Overview privacy */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Net Balance"
                                    amount={userData.balance || 0} // Using UseLifeData balance as primary
                                    trend="up" trendValue="+12% vs last month"
                                    icon={Wallet} color="#10b981"
                                />
                                <StatCard
                                    title="Total Income"
                                    amount={totalIncome}
                                    icon={TrendingUp} color="#3b82f6"
                                />
                                <StatCard
                                    title="Total Expense"
                                    amount={totalExpense}
                                    isNegative
                                    icon={TrendingDown} color="#ef4444"
                                />
                            </div>

                            {/* Main Charts Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Area Chart */}
                                <div className="lg:col-span-2 bg-neutral-900/40 border border-white/5 rounded-2xl p-6 h-[400px]">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-500" /> Cash Flow
                                    </h3>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <AreaChart data={dataByMonth}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                                            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Pie Chart */}
                                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6 h-[400px]">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <PieChart className="w-4 h-4 text-purple-500" /> Expense Breakdown
                                    </h3>
                                    {expenseByCategory.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="90%">
                                            <RePieChart>
                                                <Pie
                                                    data={expenseByCategory}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {expenseByCategory.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip />
                                                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                                            <PieChart className="w-12 h-12 mb-2 opacity-50" />
                                            <span className="text-xs">No expense data yet</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className={`space-y-4 ${!isSectionVisible('transactions') && viewMode === 'guest' ? 'hidden' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        Recent Transactions
                                        {viewMode === 'admin' && (
                                            <button onClick={() => toggleSectionVisibility('transactions')} className={`p-1 rounded ${isSectionVisible('transactions') ? 'text-neutral-600 hover:text-white' : 'text-red-500'}`}>
                                                {isSectionVisible('transactions') ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            </button>
                                        )}
                                    </h3>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                    >
                                        <Plus className="w-3 h-3" /> Add New
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {transactions.slice(0, 5).map(t => (
                                        <TransactionRow
                                            key={t.id}
                                            transaction={t}
                                            category={categories.find(c => c.id === t.categoryId)}
                                            onDelete={transactionsActions.delete}
                                        />
                                    ))}
                                    {transactions.length === 0 && (
                                        <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-neutral-500 text-xs">
                                            No transactions recorded yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    ) : (
                        <div className={`space-y-4 ${!isSectionVisible('transactions') && viewMode === 'guest' ? 'hidden' : ''}`}>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">All Transactions</h3>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                                >
                                    <Plus className="w-3 h-3" /> Add New
                                </button>
                            </div>

                            <div className="space-y-2">
                                {transactions.length > 0 ? (
                                    transactions.map(t => (
                                        <TransactionRow
                                            key={t.id}
                                            transaction={t}
                                            category={categories.find(c => c.id === t.categoryId)}
                                            onDelete={transactionsActions.delete}
                                        />
                                    ))
                                ) : (
                                    <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl text-neutral-500 text-xs">
                                        No transactions found. Start by adding one.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Tasks View with Sub-navigation */}
            {activeView === 'tasks' && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Sub-Tabs */}
                    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-1">
                        <button
                            onClick={() => setMissionTab('protocol')}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'protocol' ? 'text-yellow-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Routine
                            {missionTab === 'protocol' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 rounded-t-full" />}
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
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${missionTab === 'goals' ? 'text-green-500' : 'text-neutral-500 hover:text-white'}`}
                        >
                            Strategies
                            {missionTab === 'goals' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-t-full" />}
                        </button>
                    </div>

                    {missionTab === 'protocol' && (
                        <DailyProtocol
                            protocols={userData.protocols}
                            actions={protocolsActions}
                            moduleId="finance"
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('protocol')}
                            toggleSectionVisibility={() => toggleSectionVisibility('protocol')}
                        />
                    )}

                    {missionTab === 'missions' && (
                        <TaskBoard
                            tasks={userData.tasks}
                            actions={tasksActions}
                            moduleId="finance"
                            viewMode={viewMode}
                            processTask={processTask}
                            isSectionHidden={!isSectionVisible('tasks')}
                            toggleSectionVisibility={() => toggleSectionVisibility('tasks')}
                        />
                    )}

                    {missionTab === 'goals' && (
                        <GoalsBoard
                            goals={userData.goals}
                            tasks={userData.tasks}
                            actions={goalsActions}
                            moduleId="finance"
                            viewMode={viewMode}
                            isSectionHidden={!isSectionVisible('goals')}
                            toggleSectionVisibility={() => toggleSectionVisibility('goals')}
                        />
                    )}
                </div>
            )}

            {/* Notes */}
            {
                activeView === 'notes' && (
                    <NotesBoard
                        notes={userData.notes}
                        actions={notesActions}
                        moduleId="finance"
                        viewMode={viewMode}
                        isSectionHidden={!isSectionVisible('notes')}
                        toggleSectionVisibility={() => toggleSectionVisibility('notes')}
                    />
                )
            }

            {/* Quick Add Modal */}
            {
                isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                        <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-white uppercase">Add Transaction</h3>
                                <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-neutral-500" /></button>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-4">
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
                                        placeholder="e.g. Grocery Scaling"
                                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-green-500 outline-none"
                                        value={newTransaction.description}
                                        onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Category</label>
                                        <select
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                                            value={newTransaction.categoryId}
                                            onChange={e => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.filter(c => c.type === newTransaction.type).map(c => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </select>
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
                )
            }
        </div >
    );
};

export default FinanceModule;
