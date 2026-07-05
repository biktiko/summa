const fs = require('fs');
const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let c = fs.readFileSync(filePath, 'utf8');

const exportBalanceHistoryToExcelCode = `
    const exportBalanceHistoryToExcel = () => {
        const data = balanceHistoryData.map(d => ({
            'Date': formatDateToDDMMYYYY(d.fullDate),
            'Income': d.income,
            'Expense': d.expense,
            'Net Flow': d.netFlow,
            'Balance': d.balance
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Balance_History");
        XLSX.writeFile(wb, \`Balance_History.xlsx\`);
    };
`;

if (!c.includes('exportBalanceHistoryToExcel')) {
    c = c.replace(/const \[projectClientFilter, setProjectClientFilter\] = useState\('all'\);/, exportBalanceHistoryToExcelCode + '\n    const [projectClientFilter, setProjectClientFilter] = useState(\'all\');');
}

const tableCode = `
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
                                                     <td className="py-3 px-4 text-xs font-mono text-emerald-600 text-right">+{formatMoney(d.income)}</td>
                                                     <td className="py-3 px-4 text-xs font-mono text-rose-600 text-right">-{formatMoney(d.expense)}</td>
                                                     <td className="py-3 px-4 text-xs font-mono text-slate-700 text-right">{d.netFlow > 0 ? '+' : ''}{formatMoney(d.netFlow)}</td>
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
`;

if (!c.includes('Detailed History')) {
    c = c.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Projects Performance \*\/\})/g, tableCode + '\n$1');
}

fs.writeFileSync(filePath, c);
