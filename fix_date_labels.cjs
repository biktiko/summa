const fs = require('fs');

const mainPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Fix Daily Activity labels
content = content.replace(
    `const dayLabel = current.getDate().toString();`,
    `const dayLabel = dateFilterType === 'month' ? current.getDate().toString() : String(current.getDate()).padStart(2, '0') + '.' + String(current.getMonth() + 1).padStart(2, '0');`
);

// 2. Fix Balance History shortDates
content = content.replace(
    `shortDate: startPointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })`,
    `shortDate: dateFilterType === 'month' ? startPointDate.getDate().toString() : String(startPointDate.getDate()).padStart(2, '0') + '.' + String(startPointDate.getMonth() + 1).padStart(2, '0')`
);

content = content.replace(
    `shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })`,
    `shortDate: dateFilterType === 'month' ? d.getDate().toString() : String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0')`
);

// We should also ensure balanceGroup === 'week' and 'month' use good formats?
// The user mainly complained about 'day' view because it had just "1", "2" for days.
// The week/month formats are probably okay as they use strings like 'Aug 1 - Aug 7'.

fs.writeFileSync(mainPath, content);
console.log('Date labels fixed.');
