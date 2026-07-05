const fs = require('fs');
const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let c = fs.readFileSync(filePath, 'utf8');

c = c.replace(/let prevBal = currentBal;\s*dayTransactions\.forEach\(t => \{/g, `let prevBal = currentBal;
                  let dayIncome = 0;
                  let dayExpense = 0;
                  dayTransactions.forEach(t => {`);

c = c.replace(/if \(activeAnalyticAccountIds\.includes\(accId\)\) currentBal \+= amount;/g, `if (activeAnalyticAccountIds.includes(accId)) { currentBal += amount; dayIncome += amount; }`);

c = c.replace(/if \(activeAnalyticAccountIds\.includes\(accId\)\) currentBal -= amount;/g, `if (activeAnalyticAccountIds.includes(accId)) { currentBal -= amount; dayExpense += amount; }`);

c = c.replace(/points\.push\(\{\s*label: String\(curr\.getDate\(\)\)\.padStart\(2, '0'\) \+ '\.' \+ String\(curr\.getMonth\(\) \+ 1\)\.padStart\(2, '0'\),\s*fullDate: dayStr,\s*balance: currentBal,\s*netFlow: currentBal - prevBal\s*\}\);/g, `points.push({
                      label: String(curr.getDate()).padStart(2, '0') + '.' + String(curr.getMonth() + 1).padStart(2, '0'),
                      fullDate: dayStr,
                      balance: currentBal,
                      netFlow: currentBal - prevBal,
                      income: dayIncome,
                      expense: dayExpense
                  });`);

// WEEK
c = c.replace(/let prevBal = currentBal;\s*weekTransactions\.forEach\(t => \{/g, `let prevBal = currentBal;
                  let dayIncome = 0;
                  let dayExpense = 0;
                  weekTransactions.forEach(t => {`);

c = c.replace(/points\.push\(\{\s*label: labelStr,\s*fullDate: getLocalYYYYMMDD\(weekStart\),\s*balance: currentBal,\s*netFlow: currentBal - prevBal\s*\}\);/g, `points.push({
                      label: labelStr,
                      fullDate: getLocalYYYYMMDD(weekStart),
                      balance: currentBal,
                      netFlow: currentBal - prevBal,
                      income: dayIncome,
                      expense: dayExpense
                  });`);

// MONTH
c = c.replace(/let prevBal = currentBal;\s*monthTransactionsIter\.forEach\(t => \{/g, `let prevBal = currentBal;
                  let dayIncome = 0;
                  let dayExpense = 0;
                  monthTransactionsIter.forEach(t => {`);

c = c.replace(/points\.push\(\{\s*label: labelStr,\s*fullDate: monthStr,\s*balance: currentBal,\s*netFlow: currentBal - prevBal\s*\}\);/g, `points.push({
                      label: labelStr,
                      fullDate: monthStr,
                      balance: currentBal,
                      netFlow: currentBal - prevBal,
                      income: dayIncome,
                      expense: dayExpense
                  });`);

fs.writeFileSync(filePath, c);
console.log("Updated balanceHistoryData points");
