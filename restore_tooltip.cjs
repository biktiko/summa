const fs = require('fs');
const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let c = fs.readFileSync(filePath, 'utf8');

const customBalanceTooltipFn = `
const CustomBalanceTooltip = ({ active, payload, label, formatMoney, balanceChartMode }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const displayLabel = data.fullDate ? formatDateToDDMMYYYY(data.fullDate) : label;
        return (
            <div className="bg-slate-900 border-none rounded-xl p-4 shadow-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{displayLabel}</div>
                <div className="space-y-1">
                    <div className="flex justify-between items-center gap-4 text-xs font-mono text-white">
                        <span className="text-slate-300 font-sans">Balance</span>
                        <span className="font-bold">{formatMoney(data.balance)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 text-xs font-mono text-emerald-400">
                        <span className="text-emerald-500/80 font-sans">Income</span>
                        <span>+{formatMoney(data.income)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 text-xs font-mono text-rose-400">
                        <span className="text-rose-500/80 font-sans">Expense</span>
                        <span>-{formatMoney(data.expense)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4 text-xs font-mono text-blue-400 pt-1 border-t border-slate-700/50">
                        <span className="text-blue-500/80 font-sans">Net Flow</span>
                        <span>{data.netFlow > 0 ? '+' : ''}{formatMoney(data.netFlow)}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};
`;

if (!c.includes('const CustomBalanceTooltip')) {
    c = c.replace(/const FinanceModule =/g, customBalanceTooltipFn + '\n\nconst FinanceModule =');
    fs.writeFileSync(filePath, c);
    console.log("CustomBalanceTooltip inserted");
}
