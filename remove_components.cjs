const fs = require('fs');

const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
const content = fs.readFileSync(filePath, 'utf8');

// Line endings might be \r\n
const isCRLF = content.includes('\r\n');
const delimiter = isCRLF ? '\r\n' : '\n';
const lines = content.split(delimiter);

// Ranges to remove:
// DateRangePicker: { start: 19, end: 73 }
// CustomTooltip: { start: 77, end: 144 }
// StatCard: { start: 146, end: 167 }
// BudgetRow: { start: 169, end: 260 }
// CustomBalanceTooltip: { start: 277, end: 306 }
// CURRENCIES: { start: 262, end: 267 }
// getLocalYYYYMMDD: { start: 269, end: 273 }
// formatDateToDDMMYYYY: { start: 309, end: 318 }

// Sort descending by start line so removing doesn't mess up earlier indices
const ranges = [
    { start: 309, end: 318 },
    { start: 277, end: 306 },
    { start: 269, end: 273 },
    { start: 262, end: 267 },
    { start: 169, end: 260 },
    { start: 146, end: 167 },
    { start: 77, end: 144 },
    { start: 19, end: 73 }
];

for (const range of ranges) {
    // start and end are 1-indexed, so we delete from start-1 to end-1
    // Number of elements to delete is end - start + 1
    const startIndex = range.start - 1;
    const count = range.end - range.start + 1;
    lines.splice(startIndex, count);
}

// Add imports at line 18 (index 17)
const imports = [
    "import DateRangePicker from './components/DateRangePicker';",
    "import CustomTooltip from './components/CustomTooltip';",
    "import StatCard from './components/StatCard';",
    "import BudgetRow from './components/BudgetRow';",
    "import CustomBalanceTooltip from './components/CustomBalanceTooltip';",
    "import { CURRENCIES, getLocalYYYYMMDD, formatDateToDDMMYYYY } from './utils/financeHelpers';"
];

lines.splice(17, 0, ...imports);

fs.writeFileSync(filePath, lines.join(delimiter));
console.log('Removed components and added imports successfully.');
