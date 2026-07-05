const fs = require('fs');
const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(/let prevBal = currentBal;\s*monthTransactionsList\.forEach\(t => \{/, `let prevBal = currentBal;
                  let dayIncome = 0;
                  let dayExpense = 0;
                  monthTransactionsList.forEach(t => {`);

fs.writeFileSync(filePath, c);
console.log("Fixed month loop");
