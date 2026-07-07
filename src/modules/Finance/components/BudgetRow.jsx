import React, { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';

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

export default BudgetRow;
