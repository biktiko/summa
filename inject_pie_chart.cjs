const fs = require('fs');

const mainPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Add pieChartMode state
content = content.replace(
    `const [analyticsSource, setAnalyticsSource] = useState('actual'); // 'actual' | 'budget'`,
    `const [analyticsSource, setAnalyticsSource] = useState('actual'); // 'actual' | 'budget'\n    const [pieChartMode, setPieChartMode] = useState('expense'); // 'expense' | 'income'`
);

// 2. Update categoryBreakdown memo
content = content.replace(
    `    const categoryBreakdown = useMemo(() => {
        if (analyticsSource === 'actual') {
            const map = {};
            filteredMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
                const catId = t.categoryId || 'uncategorized';
                map[catId] = (map[catId] || 0) + Number(t.amount);
            });
            return Object.keys(map).map(id => {
                const cat = categories.find(c => c.id === id);
                return { id, name: cat ? cat.label : 'Other', value: map[id], color: cat ? cat.color : '#555' };
            }).filter(i => i.value > 0);
        } else {
            // Budget Source
            return expenseCategories.map(c => ({
                id: c.id,
                name: c.label,
                value: (Number(c.amount) * 30) / (Number(c.period) || 30),
                color: c.color
            })).filter(i => i.value > 0);
        }
    }, [analyticsSource, monthTransactions, categories, expenseCategories]);`,
    `    const categoryBreakdown = useMemo(() => {
        if (analyticsSource === 'actual') {
            const map = {};
            filteredMonthTransactions.filter(t => t.type === pieChartMode).forEach(t => {
                const catId = t.categoryId || 'uncategorized';
                map[catId] = (map[catId] || 0) + Number(t.amount);
            });
            return Object.keys(map).map(id => {
                const cat = categories.find(c => c.id === id);
                return { id, name: cat ? cat.label : 'Other', value: map[id], color: cat ? cat.color : '#555' };
            }).filter(i => i.value > 0);
        } else {
            // Budget Source
            const targetCategories = pieChartMode === 'income' ? incomeCategories : expenseCategories;
            return targetCategories.map(c => ({
                id: c.id,
                name: c.label,
                value: (Number(c.amount) * 30) / (Number(c.period) || 30),
                color: c.color
            })).filter(i => i.value > 0);
        }
    }, [analyticsSource, pieChartMode, filteredMonthTransactions, categories, expenseCategories, incomeCategories]);`
);

// 3. Update Pie Chart Header in Overview
const oldPieHeader = `<div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <PieChart className="w-4 h-4 text-purple-500"/> {analyticsSource === 'actual' ? 'Spending Breakdown (Actual)' : 'Budget Allocation (Planned)'}
                                        </h3>
                                        <button onClick={() => setExpandedChart('pie')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                    </div>`;

const newPieHeader = `<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <PieChart className="w-4 h-4 text-purple-500"/> {analyticsSource === 'actual' ? 'Breakdown (Actual)' : 'Allocation (Planned)'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
                                                <button onClick={() => setPieChartMode('expense')} className={\`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all \${pieChartMode === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>Expense</button>
                                                <button onClick={() => setPieChartMode('income')} className={\`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all \${pieChartMode === 'income' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>Income</button>
                                            </div>
                                            <button onClick={() => setExpandedChart('pie')} className="text-slate-400 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>`;
content = content.replace(oldPieHeader, newPieHeader);

fs.writeFileSync(mainPath, content);
console.log('Pie chart modifications applied.');
