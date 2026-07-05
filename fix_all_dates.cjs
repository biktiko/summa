const fs = require('fs');
const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(/curr\.toISOString\(\)\.slice\(0, 7\)/g, "getLocalYYYYMMDD(curr).slice(0, 7)");
c = c.replace(/monthStart\.toISOString\(\)\.slice\(0, 7\)/g, "getLocalYYYYMMDD(monthStart).slice(0, 7)");

c = c.replace(/t\.createdAt\.startsWith\(dayStr\)/g, "getLocalYYYYMMDD(t.createdAt) === dayStr");
c = c.replace(/t\.createdAt\.startsWith\(monthStr\)/g, "getLocalYYYYMMDD(t.createdAt).startsWith(monthStr)");

c = c.replace(/label: curr\.getDate\(\)\.toString\(\),/g, "label: String(curr.getDate()).padStart(2, '0') + '.' + String(curr.getMonth() + 1).padStart(2, '0'),");

fs.writeFileSync(filePath, c);
console.log('Fixed additional dates');
