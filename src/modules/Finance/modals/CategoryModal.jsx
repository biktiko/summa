import React from 'react';
import { X, Trash2 } from 'lucide-react';

const CategoryModal = ({
    isEditingCategory,
    setIsEditingCategory,
    editingCategoryData,
    setEditingCategoryData,
    handleSaveCategory,
}) => {
    if (!isEditingCategory) return null;

    return (
        <>
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
    </>
    );
};

export default CategoryModal;
