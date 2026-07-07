const fs = require('fs');

const tabPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/tabs/HistoryTab.jsx';
const mainPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';

const tabContent = fs.readFileSync(tabPath, 'utf8');
const mainContent = fs.readFileSync(mainPath, 'utf8');

const tabLines = tabContent.split(/\r?\n/);
const mainLines = mainContent.split(/\r?\n/);

const tabPropsReplacement = `const HistoryTab = ({
    accounts,
    categories,
    historyFilter,
    setHistoryFilter,
    setNewTransaction,
    setIsAddingTransaction,
    transactionsActions,
    getLocalYYYYMMDD,
    setEditingAccountData,
    setIsEditingAccount,
    getAccountBalance,
    getDateRangeLabel,
    viewMode,
    monthTransactions
}) => {`;

const newTabContent = tabContent.replace(/const HistoryTab = \(\{[\s\S]*?\}\) => \{/, tabPropsReplacement);
fs.writeFileSync(tabPath, newTabContent);

const mainPropsReplacement = `<HistoryTab
                    accounts={accounts}
                    categories={categories}
                    historyFilter={historyFilter}
                    setHistoryFilter={setHistoryFilter}
                    setNewTransaction={setNewTransaction}
                    setIsAddingTransaction={setIsAddingTransaction}
                    transactionsActions={transactionsActions}
                    getLocalYYYYMMDD={getLocalYYYYMMDD}
                    setEditingAccountData={setEditingAccountData}
                    setIsEditingAccount={setIsEditingAccount}
                    getAccountBalance={getAccountBalance}
                    getDateRangeLabel={getDateRangeLabel}
                    viewMode={viewMode}
                    monthTransactions={monthTransactions}
                />`;

const newMainContent = mainContent.replace(/<HistoryTab[\s\S]*?\/>/, mainPropsReplacement);
fs.writeFileSync(mainPath, newMainContent);

console.log('Fixed HistoryTab props');
