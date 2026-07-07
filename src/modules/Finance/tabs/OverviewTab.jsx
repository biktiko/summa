import React from 'react';
import { 
    TrendingUp, TrendingDown, Wallet, Calendar, PieChart as PieChartIcon, Calculator, Download, Maximize2, X
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar, ReferenceLine
} from 'recharts';
import StatCard from '../components/StatCard';
import CustomTooltip from '../components/CustomTooltip';
import CustomBalanceTooltip from '../components/CustomBalanceTooltip';

const OverviewTab = ({
    filterAccountsList,
    activeAnalyticAccountIds,
    setSelectedAnalyticAccounts,
    analyticsSource,
    activeIncome,
    activeExpense,
    activeDays,
    monthActualExpense,
    projectedMonthlyExpense,
    showDailyAvgBreakdown,
    setShowDailyAvgBreakdown,
    totalCurrentLiquidity,
    dailyAvgCategoryBreakdown,
    formatMoney,
    getDateRangeLabel,
    balanceChartMode,
    setBalanceChartMode,
    balanceGrouping,
    setBalanceGrouping,
    balanceHistoryData,
    setExpandedChart,
    exportBalanceHistoryToExcel,
    spendingGrouping,
    setSpendingGrouping,
    dailyChartCategoryFilter,
    setDailyChartCategoryFilter,
    categories,
    pieChartMode,
    setPieChartMode,
    categoryBreakdown,
    dailyActivity,
    currencySymbol,
    getMonthLabel,
    incomeCategories,
    expenseCategories,
    selectedDate,
    expandedChart,
    setHistoryFilter,
    setDashboardTab,
    formatDateToDDMMYYYY,
}) => {
    return (
        <>
                     {/* --- ANALYTICS VIEW --- */}
                     
                         <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
                             
                             {/* Account Filter */}
                             <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">Filter Accounts:</span>
                                 {filterAccountsList.map(acc => {
                                     const isSelected = activeAnalyticAccountIds.includes(acc.id);
                                     return (
                                         <button
                                             key={acc.id}
                                             onClick={() => {
                                                 if (isSelected) {
                                                     setSelectedAnalyticAccounts(activeAnalyticAccountIds.filter(id => id !== acc.id));
                                                 } else {
                                                     setSelectedAnalyticAccounts([...activeAnalyticAccountIds, acc.id]);
                                                 }
                                             }}
                                             className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                                 isSelected 
                                                 ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                                                 : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                             }`}
                                         >
                                             <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: acc.color }} />
                                             {acc.label}
                                         </button>
                                     );
                                 })}
                                 <button 
                                     onClick={() => setSelectedAnalyticAccounts(null)}
                                     className="text-[10px] font-bold text-blue-600 hover:underline ml-auto px-2"
                                 >
                                     Reset
                                 </button>
                             </div>

                            {/* Stats based on Toggle */}
                            {(() => {
                                const difference = activeIncome - activeExpense;
                                const dailyProfit = analyticsSource === 'actual' ? (difference / (activeDays || 1)) : (difference / 30);
                                const dailySpend = analyticsSource === 'actual' ? (monthActualExpense / (activeDays || 1)) : (projectedMonthlyExpense / 30);
                                
                                const stats = [
                                    { title: analyticsSource === 'actual' ? "Actual Income" : "Planned Income", amount: activeIncome, color: "text-blue-500", bg: "bg-blue-100", icon: TrendingUp },
                                    { title: analyticsSource === 'actual' ? "Actual Expense" : "Planned Expense", amount: activeExpense, color: "text-red-500", bg: "bg-red-100", icon: TrendingDown },
                                    { title: "Net Difference", amount: difference, color: difference >= 0 ? "text-emerald-500" : "text-red-500", bg: difference >= 0 ? "bg-emerald-100" : "bg-red-100", icon: Wallet },
                                    { title: "Daily Avg Spend", amount: dailySpend, color: "text-amber-500", bg: "bg-amber-100", icon: Calendar, onClick: () => setShowDailyAvgBreakdown(!showDailyAvgBreakdown) },
                                    { title: "Daily Profit", amount: dailyProfit, color: dailyProfit >= 0 ? "text-emerald-500" : "text-red-500", bg: dailyProfit >= 0 ? "bg-emerald-100" : "bg-red-100", icon: TrendingUp },
                                    { title: "Current Balance", amount: totalCurrentLiquidity, color: "text-purple-500", bg: "bg-purple-100", icon: PieChartIcon }
                                ];

                                return (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {stats.map((s, i) => {
                                            const Icon = s.icon;
                                            return (
                                                <div 
                                                    key={i} 
                                                    onClick={s.onClick} 
                                                    className={`p-3.5 rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group ${s.onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md transition-all' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                                        <div className={`p-1.5 rounded-lg ${s.bg} ${s.color} bg-opacity-50`}>
                                                            <Icon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{s.title}</div>
                                                    </div>
                                                    <div className="text-sm sm:text-base font-black text-slate-800 relative z-10">
                                                        {s.amount < 0 ? '-' : ''}{formatMoney ? formatMoney(Math.abs(s.amount)) : `$${Math.abs(s.amount).toLocaleString()}`}
                                                    </div>
                                                    {/* subtle background glow */}
                                                    <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-20 ${s.bg} z-0 group-hover:opacity-40 transition-opacity`} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Daily Spending Breakdown Widget */}
                            {showDailyAvgBreakdown && (
                                <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl animate-in slide-in-from-top duration-300 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-amber-500" /> Daily Spending Breakdown
                                            </h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                                                Showing actual vs. planned daily average per category ({getDateRangeLabel()})
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => setShowDailyAvgBreakdown(false)}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                                        {dailyAvgCategoryBreakdown.map((item, idx) => {
                                            const hasBudget = item.plannedDaily > 0;
                                            const isOver = hasBudget && item.actualDaily > item.plannedDaily;
                                            const overAmount = isOver ? item.actualDaily - item.plannedDaily : 0;
                                            
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                                                >
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div 
                                                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                                style={{ backgroundColor: item.color }} 
                                                            />
                                                            <span className="font-bold text-slate-800 truncate text-xs">{item.label}</span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="font-mono font-extrabold text-slate-800 text-xs">
                                                                {formatMoney(item.actualDaily)} <span className="text-[9px] text-slate-400 font-normal">/ day</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-1">
                                                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                                            <span>
                                                                {hasBudget 
                                                                    ? `Budget: ${formatMoney(item.plannedDaily)} / day`
                                                                    : 'No Plan Set'
                                                                }
                                                            </span>
                                                            {hasBudget && (
                                                                <span className={isOver ? 'text-red-500 font-extrabold' : 'text-slate-600'}>
                                                                    {isOver 
                                                                        ? `Over by ${formatMoney(overAmount)} / day`
                                                                        : `${(100 - (item.actualDaily / item.plannedDaily) * 100).toFixed(0)}% Left`
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {hasBudget && (
                                                            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="h-full rounded-full transition-all duration-1000" 
                                                                    style={{ 
                                                                        width: `${Math.min((item.actualDaily / item.plannedDaily) * 100, 100)}%`, 
                                                                        backgroundColor: isOver ? '#ef4444' : item.color 
                                                                    }} 
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {dailyAvgCategoryBreakdown.length === 0 && (
                                            <div className="col-span-full text-center py-8 text-slate-400 italic text-xs">
                                                No expenses recorded for this period.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                             <div className="grid md:grid-cols-2 gap-6">
                                {/* Pie Chart */}
                                <div className="bg-white shadow-sm border border-slate-200/40 p-6 rounded-2xl border border-slate-200 h-[400px] min-h-[400px] flex flex-col relative group">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <PieChartIcon className="w-4 h-4 text-purple-500"/> {analyticsSource === 'actual' ? 'Spending Breakdown (Actual)' : 'Budget Allocation (Planned)'}
                                        </h3>
                                        <button onClick={() => setExpandedChart('pie')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                    </div>
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
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(val) => formatMoney(val)} />
                                                <Legend />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <span className="text-xs">No data for this view in {getMonthLabel(selectedDate)}</span>
                                        </div>
                                    )}
                                    </div>
                                </div>

                                {/* Daily Spending Bar Chart */}
                                <div className="bg-white shadow-sm border border-slate-200/40 p-6 rounded-2xl border border-slate-200 h-[400px] min-h-[400px] flex flex-col relative group">
                                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-blue-500"/> {analyticsSource === 'actual' ? 'Spending Flow' : 'Daily Projection (Not Available)'}
                                        </h3>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {analyticsSource !== 'budget' && (
                                                <>
                                                    {/* Grouping Toggle */}
                                                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSpendingGrouping('day')} 
                                                            className={`px-2.5 py-1 rounded-md transition-all ${spendingGrouping === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            Days
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSpendingGrouping('week')} 
                                                            className={`px-2.5 py-1 rounded-md transition-all ${spendingGrouping === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            Weeks
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSpendingGrouping('month')} 
                                                            className={`px-2.5 py-1 rounded-md transition-all ${spendingGrouping === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                                        >
                                                            Months
                                                        </button>
                                                    </div>


                                                </>
                                            )}
                                            {analyticsSource !== 'budget' && dailyActivity.length > 0 && (
                                                <button onClick={() => setExpandedChart('bar')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full h-full min-h-0">
                                    {analyticsSource === 'budget' ? (
                                        <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                                            Budget is averaged daily. Switch to 'Actuals' to see daily transactions.
                                        </div>
                                    ) : dailyActivity.length > 0 ? (
                                            <ResponsiveContainer width="99%" height="100%">
                                                <BarChart data={dailyActivity} stackOffset="sign">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                                                    <XAxis dataKey="day" stroke="#666" fontSize={10} tickLine={false} axisLine={false} interval={spendingGrouping === 'day' ? 2 : 0} />
                                                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `${currencySymbol}${val}`} />
                                                    <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
                                                    <RechartsTooltip content={<CustomTooltip selectedDate={selectedDate} getMonthLabel={getMonthLabel} formatMoney={formatMoney} categories={categories} />} />
                                                    {incomeCategories.map(c => (
                                                        <Bar key={c.id} dataKey={`IN_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#10b981'} radius={[4, 4, 0, 0]} />
                                                    ))}
                                                    <Bar dataKey="IN_Other" name="Other Income" stackId="spending" fill="#64748b" radius={[4, 4, 0, 0]} />
                                                    
                                                    {expenseCategories.map(c => (
                                                        <Bar key={c.id} dataKey={`OUT_${c.label}`} name={c.label} stackId="spending" fill={c.color || '#ef4444'} radius={[0, 0, 4, 4]} />
                                                    ))}
                                                    <Bar dataKey="OUT_Other" name="Other Expense" stackId="spending" fill="#475569" radius={[0, 0, 4, 4]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <span className="text-xs">No transactions found for {getMonthLabel(selectedDate)}</span>
                                        </div>
                                    )}
                                    </div>
                                </div>
                             </div>

                             {/* Balance History Chart */}
                             <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl h-[400px] min-h-[400px] flex flex-col relative group">
                                 <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                     <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                         <Wallet className="w-4 h-4 text-emerald-500"/> Balance History
                                     </h3>
                                     <div className="flex items-center gap-3 flex-wrap">
                                         <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceChartMode('net_worth')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceChartMode === 'net_worth' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Balance
                                             </button>
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceChartMode('net_flow')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceChartMode === 'net_flow' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Net Flow
                                             </button>
                                         </div>
                                         <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[9px] font-bold uppercase tracking-wider">
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceGrouping('day')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceGrouping === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Days
                                             </button>
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceGrouping('week')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceGrouping === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Weeks
                                             </button>
                                             <button 
                                                 type="button"
                                                 onClick={() => setBalanceGrouping('month')} 
                                                 className={`px-2.5 py-1 rounded-md transition-all ${balanceGrouping === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                             >
                                                 Months
                                             </button>
                                         </div>
                                         <button onClick={() => setExpandedChart('area')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                                 <div className="flex-1 w-full h-full min-h-0">
                                     {balanceHistoryData.length > 0 ? (
                                         <ResponsiveContainer width="99%" height="100%">
                                             <AreaChart data={balanceHistoryData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                 <defs>
                                                     <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                                                         <stop offset="5%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0.2}/>
                                                         <stop offset="95%" stopColor={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
                                                     </linearGradient>
                                                 </defs>
                                                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                 <XAxis 
                                                     dataKey="label" 
                                                     stroke="#94a3b8" 
                                                     fontSize={10} 
                                                     fontWeight={600}
                                                     tickLine={false} 
                                                     axisLine={false} 
                                                     dy={10}
                                                 />
                                                 <YAxis 
                                                     stroke="#94a3b8" 
                                                     fontSize={10} 
                                                     fontWeight={600}
                                                     tickLine={false} 
                                                     axisLine={false} 
                                                     tickFormatter={val => formatMoney(val)}
                                                     dx={-10}
                                                 />
                                                 <RechartsTooltip content={<CustomBalanceTooltip formatMoney={formatMoney} balanceChartMode={balanceChartMode} />} />
                                                 <Area 
                                                     type="monotone" 
                                                     dataKey={balanceChartMode === 'net_worth' ? "balance" : "netFlow"} 
                                                     stroke={balanceChartMode === 'net_worth' ? "#10b981" : "#3b82f6"} 
                                                     strokeWidth={2.5}
                                                     fillOpacity={1} 
                                                     fill="url(#balanceGrad)" 
                                                 />
                                             </AreaChart>
                                         </ResponsiveContainer>
                                     ) : (
                                         <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                             <span className="text-xs">No balance history data available</span>
                                         </div>
                                     )}
                                                              {/* Balance History Table */}
                             <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-2xl flex flex-col relative mt-6">
                                 <div className="flex justify-between items-center mb-6">
                                     <h3 className="text-sm font-bold text-slate-800 tracking-wider">Detailed History</h3>
                                     <button onClick={exportBalanceHistoryToExcel} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                                         <Download className="w-4 h-4" /> Export (.xlsx)
                                     </button>
                                 </div>
                                 <div className="overflow-x-auto w-full">
                                     <table className="w-full text-left border-collapse min-w-[600px]">
                                         <thead>
                                             <tr className="border-b-2 border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                 <th className="pb-3 px-4 font-bold w-32">Date</th>
                                                 <th className="pb-3 px-4 text-right w-32">Income</th>
                                                 <th className="pb-3 px-4 text-right w-32">Expense</th>
                                                 <th className="pb-3 px-4 text-right w-32">Net Flow</th>
                                                 <th className="pb-3 px-4 text-right w-32">Balance</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {balanceHistoryData.map((d, i) => (
                                                 <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                     <td className="py-3 px-4 text-xs font-bold text-slate-700">{formatDateToDDMMYYYY(d.fullDate)}</td>
                                                     <td className="py-3 px-4 text-xs font-mono text-emerald-600 text-right">+{formatMoney(d.income || 0)}</td>
                                                     <td className="py-3 px-4 text-xs font-mono text-rose-600 text-right">-{formatMoney(d.expense || 0)}</td>
                                                     <td className="py-3 px-4 text-xs font-mono text-slate-700 text-right">{d.netFlow >= 0 ? '+' : ''}{formatMoney(d.netFlow)}</td>
                                                     <td className="py-3 px-4 text-xs font-mono font-bold text-slate-800 text-right">{formatMoney(d.balance)}</td>
                                                 </tr>
                                             ))}
                                             {balanceHistoryData.length === 0 && (
                                                 <tr>
                                                     <td colSpan="5" className="py-8 text-center text-xs text-slate-400">No data available</td>
                                                 </tr>
                                             )}
                                         </tbody>
                                     </table>
                                 </div>
                             </div>
</div>
                             </div>
                         </div>
                     </>
    );
};

export default OverviewTab;
