const fs = require('fs');

const mainPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(mainPath, 'utf8');

// We add a normalization step to resolvedDateRange
const oldDateRangeStr = `        if (dateFilterType === 'month') {
            start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        } else if (dateFilterType === 'all') {
            const dates = transactions.map(t => new Date(t.createdAt)).filter(d => !isNaN(d.getTime()));
            if (dates.length > 0) {
                start = new Date(Math.min(...dates));
                end = new Date(); // Calculate up to today
            } else {
                start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            }
        } else if (dateFilterType === 'custom') {
            if (customStartDate) start = new Date(customStartDate);
            else start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            
            if (customEndDate) end = new Date(customEndDate);
            else end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        }
        
        return { start, end };`;

const newDateRangeStr = `        if (dateFilterType === 'month') {
            start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        } else if (dateFilterType === 'all') {
            const dates = transactions.map(t => new Date(t.createdAt)).filter(d => !isNaN(d.getTime()));
            if (dates.length > 0) {
                start = new Date(Math.min(...dates));
                end = new Date(); // Calculate up to today
            } else {
                start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            }
        } else if (dateFilterType === 'custom') {
            if (customStartDate) start = new Date(customStartDate);
            else start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            
            if (customEndDate) end = new Date(customEndDate);
            else end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        }
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };`;

content = content.replace(oldDateRangeStr, newDateRangeStr);
fs.writeFileSync(mainPath, content);
console.log('Fixed resolvedDateRange normalization');
