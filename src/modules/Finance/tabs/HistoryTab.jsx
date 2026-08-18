import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Download, Filter, Search, TrendingUp, TrendingDown, RefreshCw, Layers, Edit3, Trash2 } from 'lucide-react';


const HistoryTab = ({
    accounts,
    formatMoney,
    categories,
    historyFilter,
    setHistoryFilter,
    setNewTransaction,
    setIsAddingTransaction,
    transactionsActions,
    getLocalYYYYMMDD,
    setEditingAccountData,
    setIsEditingAccount,
    getAccountBalance,
    getDateRangeLabel,
    viewMode,
    monthTransactions,
    activeAnalyticAccountIds,
    mainAccountId,
    setMainAccount
}) => {
    const [page, setPage] = useState(1);
    const [collapsedDays, setCollapsedDays] = useState({});
    const [groupingMode, setGroupingMode] = useState('day'); // 'day' | 'week' | 'month'
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const pageSize = 10;

    React.useEffect(() => {
        setPage(1);
    }, [historyFilter]);

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const activeTag = document.activeElement?.tagName?.toLowerCase();
                if (activeTag !== 'input' && activeTag !== 'textarea') {
                    e.preventDefault();
                    setIsAddingTransaction(true);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsAddingTransaction]);

    return (
                
                    <div className="space-y-3 animate-in slide-in-from-bottom-2 fade-in">


                        {/* Filters Row */}
                        <div className="bg-white shadow-sm border border-slate-200 p-2 md:px-3 md:py-2 rounded-xl flex flex-col md:flex-row gap-2 md:items-center justify-between relative z-20">
                            <div className="flex flex-wrap gap-2 items-center flex-1 min-w-0 w-full">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:flex items-center gap-1 shrink-0"><Filter className="w-3 h-3"/></span>
                                <select 
                                    value={historyFilter.type}
                                    onChange={e => setHistoryFilter({...historyFilter, type: e.target.value, categoryIds: []})}
                                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 shrink-0"
                                >
                                    <option value="all">All Types</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                    <option value="transfer">Transfers</option>
                                </select>
                                {historyFilter.type !== 'transfer' && (
                                    <div className="relative shrink-0">
                                        <button 
                                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                            className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-2.5 py-1.5 outline-none hover:border-blue-500 flex items-center justify-between min-w-[130px] md:min-w-[150px]"
                                        >
                                            <span className="truncate max-w-[110px]">
                                                {(!historyFilter.categoryIds || historyFilter.categoryIds.length === 0) ? "All Categories" : `${historyFilter.categoryIds.length} selected`}
                                            </span>
                                            <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
                                        </button>
                                        {isCategoryOpen && (
                                            <div className="absolute top-full mt-1 left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5">
                                                <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!historyFilter.categoryIds || historyFilter.categoryIds.length === 0}
                                                        onChange={() => setHistoryFilter(prev => ({...prev, categoryIds: []}))}
                                                        className="rounded text-blue-600 focus:ring-0 border-slate-300"
                                                    />
                                                    All Categories
                                                </label>
                                                <div className="h-px bg-slate-100 my-0.5"></div>
                                                {historyFilter.type !== 'income' && (
                                                    <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={(historyFilter.categoryIds || []).includes('transfer')}
                                                            onChange={() => {
                                                                setHistoryFilter(prev => {
                                                                    const ids = prev.categoryIds || [];
                                                                    const nextIds = ids.includes('transfer') ? ids.filter(id => id !== 'transfer') : [...ids, 'transfer'];
                                                                    return { ...prev, categoryIds: nextIds };
                                                                });
                                                            }}
                                                            className="rounded text-purple-500 focus:ring-0 border-slate-300"
                                                        />
                                                        🔄 Transfers
                                                    </label>
                                                )}
                                                {categories.filter(c => historyFilter.type === 'all' || c.type === historyFilter.type).map(c => (
                                                    <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={(historyFilter.categoryIds || []).includes(c.id)}
                                                            onChange={() => {
                                                                setHistoryFilter(prev => {
                                                                    const ids = prev.categoryIds || [];
                                                                    const nextIds = ids.includes(c.id) ? ids.filter(id => id !== c.id) : [...ids, c.id];
                                                                    return { ...prev, categoryIds: nextIds };
                                                                });
                                                            }}
                                                            className="rounded text-blue-600 focus:ring-0 border-slate-300"
                                                        />
                                                        <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: c.color}}></div>
                                                        <span className="truncate">{c.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setHistoryFilter(prev => ({ ...prev, showTransfers: prev.showTransfers === false ? true : false }))}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                                        (historyFilter.showTransfers ?? true)
                                            ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 shadow-sm'
                                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-500 line-through opacity-70'
                                    }`}
                                    title={(historyFilter.showTransfers ?? true) ? "Переводы включены (нажмите, чтобы скрыть)" : "Переводы скрыты (нажмите, чтобы показать)"}
                                >
                                    <RefreshCw className={`w-3 h-3 ${(historyFilter.showTransfers ?? true) ? 'text-purple-600' : 'text-slate-400'}`} />
                                    <span>Переводы</span>
                                    <span className={`w-1.5 h-1.5 rounded-full ${(historyFilter.showTransfers ?? true) ? 'bg-purple-500' : 'bg-slate-300'}`} />
                                </button>
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
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
                                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0 flex-1 min-w-[120px] md:flex-none">
                                    <input 
                                        type="date" 
                                        value={historyFilter.date || ''}
                                        onChange={e => setHistoryFilter({...historyFilter, date: e.target.value})}
                                        className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 w-full md:w-auto shrink-0 flex-1 md:flex-none">
                                    <Search className="w-3.5 h-3.5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        value={historyFilter.search || ''}
                                        onChange={e => setHistoryFilter({...historyFilter, search: e.target.value})}
                                        className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full md:w-28"
                                    />
                                </div>
                                {(historyFilter.type !== 'all' || (historyFilter.categoryIds && historyFilter.categoryIds.length > 0) || historyFilter.minAmount !== '' || historyFilter.maxAmount !== '' || historyFilter.date || historyFilter.search || historyFilter.showTransfers === false) && (
                                    <button onClick={() => setHistoryFilter({type:'all', categoryIds:[], minAmount:'', maxAmount:'', date:'', search:'', showTransfers: true})} className="text-[10px] text-blue-500 hover:underline font-bold px-1.5 shrink-0 ml-auto md:ml-0">Clear</button>
                                )}
                            </div>
                            {viewMode === 'admin' && (
                                <>
                                    {/* Desktop Log Button */}
                                    <button 
                                        onClick={() => setIsAddingTransaction(true)}
                                        className="hidden md:flex px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase transition-all items-center gap-1.5 shrink-0 shadow-sm ml-auto"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Log
                                    </button>
                                    {/* Mobile FAB Log Button */}
                                    <button 
                                        onClick={() => setIsAddingTransaction(true)}
                                        className="md:hidden fixed bottom-[90px] right-4 w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 z-50 transition-transform active:scale-95"
                                        title="Log Transaction"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                        {(() => {
                            const getTransferFlow = (t) => {
                                if (t.type !== 'transfer') return null;
                                
                                // 1. If filtered by active analytic accounts (from Overview / Breakdown)
                                if (activeAnalyticAccountIds && activeAnalyticAccountIds.length > 0) {
                                    const isSourceSelected = activeAnalyticAccountIds.includes(t.accountId);
                                    const isDestSelected = activeAnalyticAccountIds.includes(t.toAccountId);
                                    if (isSourceSelected && !isDestSelected) return 'out';
                                    if (!isSourceSelected && isDestSelected) return 'in';
                                    if (isSourceSelected && isDestSelected) return 'internal';
                                    return null;
                                }
                                
                                // 2. If all accounts are selected
                                return 'internal';
                            };

                            const filteredList = monthTransactions.filter(t => {
                                const fAccounts = activeAnalyticAccountIds || [];
                                const fCategories = historyFilter.categoryIds || [];
                                
                                // 1. Account filter
                                if (fAccounts.length > 0) {
                                    if (t.type === 'transfer') {
                                        if (!fAccounts.includes(t.accountId) && !fAccounts.includes(t.toAccountId)) {
                                            return false;
                                        }
                                    } else {
                                        const accId = t.accountId || '';
                                        if (!fAccounts.includes(accId)) {
                                            return false;
                                        }
                                    }
                                }

                                // 2. Transfers toggle (showTransfers)
                                const showTransfers = historyFilter.showTransfers !== false;
                                if (t.type === 'transfer') {
                                    if (!showTransfers && historyFilter.type !== 'transfer' && !fCategories.includes('transfer')) {
                                        return false;
                                    }
                                }

                                // 3. Category filter
                                if (fCategories.length > 0) {
                                    if (t.type === 'transfer') {
                                        if (!fCategories.includes('transfer')) return false;
                                    } else {
                                        if (!fCategories.includes(t.categoryId)) return false;
                                    }
                                }

                                // 4. Type filter (Income / Expense / Transfers / All)
                                if (historyFilter.type !== 'all') {
                                    if (historyFilter.type === 'transfer') {
                                        if (t.type !== 'transfer') return false;
                                    } else if (historyFilter.type === 'income') {
                                        if (t.type === 'income') {
                                            // regular income matches
                                        } else if (t.type === 'transfer' && showTransfers) {
                                            const flow = getTransferFlow(t);
                                            // Must be an incoming transfer to the filtered account(s)
                                            if (flow !== 'in' && flow !== 'internal') return false;
                                        } else {
                                            return false;
                                        }
                                    } else if (historyFilter.type === 'expense') {
                                        if (t.type === 'expense') {
                                            // regular expense matches
                                        } else if (t.type === 'transfer' && showTransfers) {
                                            const flow = getTransferFlow(t);
                                            // Must be an outgoing transfer from the filtered account(s)
                                            if (flow !== 'out' && flow !== 'internal') return false;
                                        } else {
                                            return false;
                                        }
                                    }
                                }

                                // 5. Amount range filter
                                const amount = Number(t.amount);
                                if (historyFilter.minAmount !== '' && amount < Number(historyFilter.minAmount)) return false;
                                if (historyFilter.maxAmount !== '' && amount > Number(historyFilter.maxAmount)) return false;

                                // 6. Date filter
                                if (historyFilter.date) {
                                    const tDate = getLocalYYYYMMDD(t.createdAt);
                                    if (tDate !== historyFilter.date) return false;
                                }

                                // 7. Search filter
                                if (historyFilter.search && historyFilter.search.trim() !== '') {
                                    const searchLower = historyFilter.search.toLowerCase();
                                    if (!t.description || !t.description.toLowerCase().includes(searchLower)) {
                                        return false;
                                    }
                                }

                                return true;
                            }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

                            const filteredIncome = filteredList.reduce((sum, t) => {
                                if (t.type === 'income') return sum + Number(t.amount);
                                if (t.type === 'transfer') {
                                    const flow = getTransferFlow(t);
                                    if (flow === 'in') return sum + Number(t.amount);
                                }
                                return sum;
                            }, 0);

                            const filteredExpense = filteredList.reduce((sum, t) => {
                                if (t.type === 'expense') return sum + Number(t.amount);
                                if (t.type === 'transfer') {
                                    const flow = getTransferFlow(t);
                                    if (flow === 'out') return sum + Number(t.amount);
                                }
                                return sum;
                            }, 0);

                            const filteredNet = filteredIncome - filteredExpense;

                            return (
                                <>
                                    {/* Summary Stats: Compact Row with Mobile Support */}
                                    <div className="bg-white border border-slate-200 p-2 md:px-4 md:py-2 rounded-xl shadow-sm flex flex-row items-center justify-between md:justify-around gap-1 md:gap-3 text-xs font-bold text-center">
                                        <div className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 flex-1 min-w-0">
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Income</span>
                                            <span className="font-mono font-black text-green-600 text-[11px] md:text-sm truncate w-full">+{formatMoney(filteredIncome)}</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 flex-1 min-w-0 border-l border-r border-slate-100 md:border-none px-1">
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expenses</span>
                                            <span className="font-mono font-black text-red-600 text-[11px] md:text-sm truncate w-full">-{formatMoney(filteredExpense)}</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 flex-1 min-w-0">
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUM</span>
                                            <span className={`font-mono font-black text-[11px] md:text-sm truncate w-full ${filteredNet >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {filteredNet >= 0 ? '+' : ''}{formatMoney(filteredNet)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mt-3">
                                        {filteredList.length === 0 ? (
                                            <div className="text-center py-20 text-slate-500 italic border border-dashed border-slate-300 rounded-xl">
                                                No transactions found matching filters
                                            </div>
                                        ) : (
                                            (() => {
                                                // Group by date
                                                const groups = {};
                                                filteredList.forEach(t => {
                                                    const d = new Date(t.createdAt);
                                                    let dateStr = '';
                                                    let rawDate = null;
                                                    
                                                    if (groupingMode === 'week') {
                                                        const firstDay = new Date(d);
                                                        firstDay.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
                                                        const lastDay = new Date(firstDay);
                                                        lastDay.setDate(lastDay.getDate() + 6);
                                                        const formatShort = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                                        dateStr = `${formatShort(firstDay)} - ${formatShort(lastDay)}, ${firstDay.getFullYear()}`;
                                                        rawDate = new Date(firstDay.setHours(0,0,0,0));
                                                    } else if (groupingMode === 'month') {
                                                        dateStr = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
                                                        rawDate = new Date(d.getFullYear(), d.getMonth(), 1);
                                                    } else {
                                                        dateStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                                                        rawDate = new Date(d.setHours(0,0,0,0));
                                                    }

                                                    if (!groups[dateStr]) {
                                                        groups[dateStr] = {
                                                            dateLabel: dateStr,
                                                            rawDate: rawDate,
                                                            income: 0,
                                                            expense: 0,
                                                            transactions: []
                                                        };
                                                    }
                                                    if (t.type === 'income') {
                                                        groups[dateStr].income += Number(t.amount);
                                                    } else if (t.type === 'expense') {
                                                        groups[dateStr].expense += Number(t.amount);
                                                    } else if (t.type === 'transfer') {
                                                        const flow = getTransferFlow(t);
                                                        if (flow === 'in') {
                                                            groups[dateStr].income += Number(t.amount);
                                                        } else if (flow === 'out') {
                                                            groups[dateStr].expense += Number(t.amount);
                                                        }
                                                    }
                                                    groups[dateStr].transactions.push(t);
                                                });

                                                const sortedGroups = Object.values(groups).sort((a, b) => b.rawDate - a.rawDate);
                                                const totalPages = Math.ceil(sortedGroups.length / pageSize);
                                                const paginatedGroups = sortedGroups.slice((page - 1) * pageSize, page * pageSize);

                                                const isAnyExpanded = paginatedGroups.some(g => !collapsedDays[g.dateLabel]);
                                                const toggleCollapseAll = () => {
                                                    if (isAnyExpanded) {
                                                        const newCollapsed = { ...collapsedDays };
                                                        paginatedGroups.forEach(g => newCollapsed[g.dateLabel] = true);
                                                        setCollapsedDays(newCollapsed);
                                                    } else {
                                                        const newCollapsed = { ...collapsedDays };
                                                        paginatedGroups.forEach(g => delete newCollapsed[g.dateLabel]);
                                                        setCollapsedDays(newCollapsed);
                                                    }
                                                };

                                                return (
                                                    <>
                                                    <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-1 mb-3 gap-2">
                                                        <div className="flex gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                                                            <button 
                                                                onClick={() => setGroupingMode('day')}
                                                                className={`flex-1 md:flex-none px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${groupingMode === 'day' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                Days
                                                            </button>
                                                            <button 
                                                                onClick={() => setGroupingMode('week')}
                                                                className={`flex-1 md:flex-none px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${groupingMode === 'week' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                Weeks
                                                            </button>
                                                            <button 
                                                                onClick={() => setGroupingMode('month')}
                                                                className={`flex-1 md:flex-none px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${groupingMode === 'month' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                Months
                                                            </button>
                                                        </div>
                                                        <button 
                                                            onClick={toggleCollapseAll}
                                                            className="w-full md:w-auto justify-center text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1 transition-colors px-3 py-1.5 rounded hover:bg-slate-200/50"
                                                        >
                                                            {isAnyExpanded ? 'Collapse All' : 'Expand All'}
                                                        </button>
                                                    </div>
                                                    {paginatedGroups.map((group, groupIdx) => {
                                                    const dailyNet = group.income - group.expense;
                                                    const isCollapsed = collapsedDays[group.dateLabel] || false;
                                                    return (
                                                        <div key={groupIdx} className="space-y-2">
                                                            {/* Day Header with Daily Sums */}
                                                            <div 
                                                                onClick={() => setCollapsedDays(prev => ({ ...prev, [group.dateLabel]: !isCollapsed }))}
                                                                className="bg-slate-100/80 backdrop-blur px-4 py-2 rounded-xl border border-slate-200/50 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm cursor-pointer hover:bg-slate-200/80 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                    <span>{group.dateLabel}</span>
                                                                </div>
                                                                <div className="flex gap-4 font-mono items-center">
                                                                    {(group.income > 0 && group.expense > 0) && (
                                                                        <>
                                                                            <span className="text-green-600 hidden md:inline">+{formatMoney(group.income)}</span>
                                                                            <span className="text-red-500 hidden md:inline">-{formatMoney(group.expense)}</span>
                                                                        </>
                                                                    )}
                                                                    <div className={`px-2 py-0.5 rounded-lg border font-black shadow-sm ${dailyNet >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                                        {dailyNet >= 0 ? '+' : ''}{formatMoney(dailyNet)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Day's Transactions */}
                                                            {!isCollapsed && (
                                                            <div className="space-y-2 pl-2 md:pl-4 border-l-2 border-slate-200/70">
                                                                {group.transactions.map(t => {
                                                                    const cat = categories.find(c => c.id === t.categoryId);
                                                                    const fromAcc = accounts.find(a => a.id === t.accountId);
                                                                    const toAcc = accounts.find(a => a.id === t.toAccountId);
                                                                    const flow = getTransferFlow(t);

                                                                    let amountDisplay = null;
                                                                    let dotColor = cat?.color || '#555';
                                                                    let subtitle = '';

                                                                    if (t.type === 'transfer') {
                                                                        dotColor = '#a855f7';
                                                                        if (flow === 'out') {
                                                                            amountDisplay = <div className="font-mono font-bold text-red-500">-{formatMoney(Math.abs(t.amount))}</div>;
                                                                            subtitle = ` • Transfer Out ➔ ${toAcc?.label || 'External'}`;
                                                                        } else if (flow === 'in') {
                                                                            amountDisplay = <div className="font-mono font-bold text-green-500">+{formatMoney(Math.abs(t.amount))}</div>;
                                                                            subtitle = ` • Transfer In ➔ ${toAcc?.label || 'Account'} (from ${fromAcc?.label || 'External'})`;
                                                                        } else {
                                                                            amountDisplay = <div className="font-mono font-bold text-purple-600">⇄ {formatMoney(Math.abs(t.amount))}</div>;
                                                                            subtitle = ` • Transfer ${fromAcc?.label || 'Unknown'} ➔ ${toAcc?.label || 'Unknown'}`;
                                                                        }
                                                                    } else if (t.type === 'income') {
                                                                        amountDisplay = <div className="font-mono font-bold text-green-500">+{formatMoney(Math.abs(t.amount))}</div>;
                                                                        subtitle = ` • ${cat?.label || 'Uncategorized'} • ${fromAcc?.label || 'Cash'}`;
                                                                    } else {
                                                                        amountDisplay = <div className="font-mono font-bold text-red-500">-{formatMoney(Math.abs(t.amount))}</div>;
                                                                        subtitle = ` • ${cat?.label || 'Uncategorized'} • ${fromAcc?.label || 'Cash'}`;
                                                                    }

                                                                    return (
                                                                        <div key={t.id} className="group relative flex justify-between items-center p-4 bg-white/20 border border-slate-200 rounded-xl text-sm hover:bg-slate-100 transition-all">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                                                                                <div>
                                                                                    <div className="font-bold text-slate-800">{t.description || (t.type === 'transfer' ? (flow === 'out' ? `Transfer to ${toAcc?.label || ''}` : flow === 'in' ? `Transfer from ${fromAcc?.label || ''}` : 'Transfer') : 'Unknown')}</div>
                                                                                    <div className="text-[10px] text-slate-500 uppercase">
                                                                                        {new Date(t.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                                                        {subtitle}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            {amountDisplay}
                                                                            
                                                                            {/* Edit/Delete Overlay */}
                                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg border border-slate-300 shadow-xl">
                                                                                 <button onClick={() => { setNewTransaction({...t, date: getLocalYYYYMMDD(t.createdAt)}); setIsAddingTransaction(true); }} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-blue-600"><Edit3 className="w-3 h-3" /></button>
                                                                                 <button onClick={() => transactionsActions.delete(t.id)} className="p-2 hover:bg-slate-200 rounded text-slate-500 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                
                                                {/* Pagination Controls */}
                                                {totalPages > 1 && (
                                                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
                                                        <button 
                                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                                            disabled={page === 1}
                                                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                                        >
                                                            Previous
                                                        </button>
                                                        <span className="text-xs font-bold text-slate-500">
                                                            Page {page} of {totalPages}
                                                        </span>
                                                        <button 
                                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                            disabled={page === totalPages}
                                                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                                </>
                                                );
                                            })()
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
    );
};

export default HistoryTab;
