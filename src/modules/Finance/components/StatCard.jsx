import React, { useState } from 'react';

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

export default StatCard;
