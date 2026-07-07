const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const extractAndRemove = (componentName, isExportDefault = true, additionalImports = '') => {
    // Regex to match `const ComponentName = ... };`
    // We assume the component ends with `};\n` or `};` followed by a newline or another `const `
    // This is a naive extraction. Let's do it with specific string matching instead to be safe.
    let regex = new RegExp(`const ${componentName} = .*?\\n};`, 's');
    let match = content.match(regex);
    if (match) {
        let compStr = match[0];
        
        let newContent = `import React, { useState } from 'react';\n`;
        if (additionalImports) {
            newContent += additionalImports + '\n';
        }
        newContent += `\n${compStr}\n\n`;
        if (isExportDefault) {
            newContent += `export default ${componentName};\n`;
        } else {
            newContent = newContent.replace(`const ${componentName} = `, `export const ${componentName} = `);
        }

        fs.writeFileSync(`c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/components/${componentName}.jsx`, newContent);
        console.log(`Extracted ${componentName}`);
        
        // Remove from original
        content = content.replace(compStr, '');
    } else {
        console.log(`Could not find ${componentName}`);
    }
};

extractAndRemove('DateRangePicker', true, `import { Calendar, ChevronRight } from 'lucide-react';`);
extractAndRemove('CustomTooltip');
extractAndRemove('StatCard');
extractAndRemove('BudgetRow', true, `import { Edit3, Trash2 } from 'lucide-react';`);
extractAndRemove('CustomBalanceTooltip', true, `
import { formatDateToDDMMYYYY } from '../utils/financeHelpers';
`);

// Also extract helpers into a utils file
let utilsFile = `export const CURRENCIES = {
    AMD: { symbol: '֏', label: 'AMD', rate: 1 },
    USD: { symbol: '$', label: 'USD', rate: 0.0025 },
    EUR: { symbol: '€', label: 'EUR', rate: 0.0023 },
    RUB: { symbol: '₽', label: 'RUB', rate: 0.24 }
};

export const getLocalYYYYMMDD = (dateOrStr) => {
    const d = dateOrStr ? new Date(dateOrStr) : new Date();
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

export const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return \`\${parts[2]}.\${parts[1]}.\${parts[0]}\`;
    } else if (parts.length === 2) {
        return \`01.\${parts[1]}.\${parts[0]}\`;
    }
    return dateString;
};
`;

fs.writeFileSync(`c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/utils/financeHelpers.js`, utilsFile);

// Remove the helpers from FinanceModule
content = content.replace(/const CURRENCIES = \{[\s\S]*?\};\n/, '');
content = content.replace(/const getLocalYYYYMMDD = \([\s\S]*?\};\n/, '');
content = content.replace(/const formatDateToDDMMYYYY = \([\s\S]*?\};\n/, '');

// Add imports to FinanceModule
const importsToAdd = `
import DateRangePicker from './components/DateRangePicker';
import CustomTooltip from './components/CustomTooltip';
import StatCard from './components/StatCard';
import BudgetRow from './components/BudgetRow';
import CustomBalanceTooltip from './components/CustomBalanceTooltip';
import { CURRENCIES, getLocalYYYYMMDD, formatDateToDDMMYYYY } from './utils/financeHelpers';
`;

content = content.replace(/(import .*? from '\.\/utils\/financeExport';\n)/, `$1${importsToAdd}`);

fs.writeFileSync(filePath, content);
console.log('FinanceModule updated.');
