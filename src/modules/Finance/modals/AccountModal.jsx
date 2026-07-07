import React from 'react';
import { X, Trash2 } from 'lucide-react';

const AccountModal = ({
    isEditingAccount,
    setIsEditingAccount,
    editingAccountData,
    setEditingAccountData,
    handleSaveAccount,
}) => {
    if (!isEditingAccount) return null;

    return (
        <>
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
        </>);
};

export default AccountModal;
