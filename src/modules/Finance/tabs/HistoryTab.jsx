import React, { useState } from 'react';
import { ChevronDown, Plus, Download, Filter, Search, TrendingUp, TrendingDown, RefreshCw, Layers, Edit3, Trash2 } from 'lucide-react';


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
    monthTransactions
}) => {
    return (
                
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
    );
};

export default HistoryTab;
