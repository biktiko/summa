import React from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';

const TransactionModal = ({
    isAddingTransaction,
    setIsAddingTransaction,
    handleAddTransaction,
    newTransaction,
    setNewTransaction,
    accounts,
    categories,
    isCategoryDropdownOpen,
    setIsCategoryDropdownOpen,
    categorySearchQuery,
    setCategorySearchQuery,
    setEditingCategoryData,
    setIsEditingCategory,
    projects
}) => {
    if (!isAddingTransaction) return null;

    return (
        <>
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
        </>);
};

export default TransactionModal;
