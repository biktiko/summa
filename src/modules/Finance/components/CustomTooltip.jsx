import React, { useState } from 'react';

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

export default CustomTooltip;
