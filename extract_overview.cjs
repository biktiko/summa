const fs = require('fs');

const mainPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(mainPath, 'utf8').replace(/\r\n/g, '\n');

const startMarker = `                     {/* --- ANALYTICS VIEW --- */}`;
const endMarkerPattern = `            )}\n        </div>\n    );\n};\n\nexport default FinanceModule;`;

const startIdx = content.indexOf(startMarker);
const endIdx = content.lastIndexOf(`            )}\n        </div>\n    );\n};\n`);

if (startIdx !== -1 && endIdx !== -1) {
    const rawTabCode = content.substring(startIdx, endIdx + 14); // include the `            )}`

    const allPossibleProps = [
        'filterAccountsList', 'activeAnalyticAccountIds', 'setSelectedAnalyticAccounts', 'analyticsSource',
        'activeIncome', 'activeExpense', 'activeDays', 'monthActualExpense', 'projectedMonthlyExpense',
        'showDailyAvgBreakdown', 'setShowDailyAvgBreakdown', 'totalCurrentLiquidity', 'dailyAvgCategoryBreakdown',
        'formatMoney', 'getDateRangeLabel', 'balanceChartMode', 'setBalanceChartMode', 'balanceGrouping',
        'setBalanceGrouping', 'balanceHistoryData', 'setExpandedChart', 'exportBalanceHistoryToExcel',
        'spendingGrouping', 'setSpendingGrouping', 'dailyChartCategoryFilter', 'setDailyChartCategoryFilter',
        'categories', 'pieChartMode', 'setPieChartMode', 'categoryBreakdown', 'dailyActivity', 'currencySymbol',
        'getMonthLabel', 'incomeCategories', 'expenseCategories', 'selectedDate', 'expandedChart', 'setHistoryFilter',
        'setDashboardTab', 'formatDateToDDMMYYYY'
    ];

    let tabFileContent = `import React from 'react';
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
${allPossibleProps.map(p => `    ${p},`).join('\n')}
}) => {
    return (
        <>
${rawTabCode}
        </>
    );
};

export default OverviewTab;
`;

    // Write OverviewTab.jsx
    fs.writeFileSync('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/tabs/OverviewTab.jsx', tabFileContent);

    // Replace in FinanceModule.jsx
    const replacement = `                     {/* --- ANALYTICS VIEW --- */}
                     <OverviewTab 
${allPossibleProps.map(p => `                         ${p}={${p}}`).join('\n')}
                     />`;
                     
    const newContent = content.substring(0, startIdx) + replacement + '\n' + content.substring(endIdx + 14);
    
    // Also need to import OverviewTab in FinanceModule.jsx
    let finalContent = newContent.replace(
        "import HistoryTab from './tabs/HistoryTab';",
        "import HistoryTab from './tabs/HistoryTab';\nimport OverviewTab from './tabs/OverviewTab';"
    );
    
    fs.writeFileSync(mainPath, finalContent);
    console.log("Successfully extracted OverviewTab!");
} else {
    console.log("Could not find boundaries", startIdx, endIdx);
}
