const fs = require('fs');

const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
const delimiter = isCRLF ? '\r\n' : '\n';
let lines = content.split(delimiter);

const extractBlock = (startLine, endLine) => {
    return lines.slice(startLine - 1, endLine).join('\n');
};

const historyStr = extractBlock(1858, 2094);

const tabComponent = `import React, { useState } from 'react';
import { ChevronDown, Plus, Download, Filter, Search, TrendingUp, TrendingDown, RefreshCw, Layers, Edit3, Trash2 } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

const HistoryTab = ({
    transactions,
    accounts,
    projects,
    categories,
    historyFilter,
    setHistoryFilter,
    historySearchQuery,
    setHistorySearchQuery,
    currencySymbol,
    formatDateToDDMMYYYY,
    setNewTransaction,
    setIsAddingTransaction,
    transactionsActions,
    getLocalYYYYMMDD
}) => {
    return (
${historyStr.replace(/^            /gm, '        ').replace('{dashboardTab === \'history\' && (', '').replace(/\}$/, '')}
    );
};

export default HistoryTab;
`;

fs.mkdirSync('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/tabs', { recursive: true });
fs.writeFileSync('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/tabs/HistoryTab.jsx', tabComponent);

lines.splice(1858 - 1, 2094 - 1858 + 1,
    `            {dashboardTab === 'history' && (`,
    `                <HistoryTab`,
    `                    transactions={transactions}`,
    `                    accounts={accounts}`,
    `                    projects={projects}`,
    `                    categories={categories}`,
    `                    historyFilter={historyFilter}`,
    `                    setHistoryFilter={setHistoryFilter}`,
    `                    historySearchQuery={historySearchQuery}`,
    `                    setHistorySearchQuery={setHistorySearchQuery}`,
    `                    currencySymbol={currencySymbol}`,
    `                    formatDateToDDMMYYYY={formatDateToDDMMYYYY}`,
    `                    setNewTransaction={setNewTransaction}`,
    `                    setIsAddingTransaction={setIsAddingTransaction}`,
    `                    transactionsActions={transactionsActions}`,
    `                    getLocalYYYYMMDD={getLocalYYYYMMDD}`,
    `                />`,
    `            )}`
);

lines.splice(17, 0, "import HistoryTab from './tabs/HistoryTab';");

fs.writeFileSync(filePath, lines.join(delimiter));
console.log('Successfully extracted HistoryTab');
