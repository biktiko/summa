const fs = require('fs');

const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
const delimiter = isCRLF ? '\r\n' : '\n';
let lines = content.split(delimiter);

// Get the JSX block
const extractBlock = (startLine, endLine) => {
    return lines.slice(startLine - 1, endLine).join('\n');
};

const categoryModalStr = extractBlock(2513, 2607);
const accountModalStr = extractBlock(2610, 2662);
const transactionModalStr = extractBlock(2665, 2881);

const categoryModalComponent = `import React from 'react';
import { X, Trash2 } from 'lucide-react';

const CategoryModal = ({
    isEditingCategory,
    setIsEditingCategory,
    editingCategoryData,
    setEditingCategoryData,
    handleSaveCategory,
    handleDeleteCategory
}) => {
    if (!isEditingCategory) return null;

    return (
${categoryModalStr.replace(/^            /gm, '        ')}
    );
};

export default CategoryModal;
`;

const accountModalComponent = `import React from 'react';
import { X, Trash2 } from 'lucide-react';

const AccountModal = ({
    isEditingAccount,
    setIsEditingAccount,
    editingAccountData,
    setEditingAccountData,
    handleSaveAccount,
    handleDeleteAccount
}) => {
    if (!isEditingAccount) return null;

    return (
${accountModalStr.replace(/^            /gm, '        ')}
    );
};

export default AccountModal;
`;

const transactionModalComponent = `import React from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';

const TransactionModal = ({
    isAddingTransaction,
    setIsAddingTransaction,
    handleAddTransaction,
    newTransaction,
    setNewTransaction,
    accounts,
    categories,
    isCategoryDropdownOpen,
    setIsCategoryDropdownOpen,
    categorySearchQuery,
    setCategorySearchQuery,
    setEditingCategoryData,
    setIsEditingCategory,
    projects
}) => {
    if (!isAddingTransaction) return null;

    return (
${transactionModalStr.replace(/^            /gm, '        ')}
    );
};

export default TransactionModal;
`;

fs.writeFileSync('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/CategoryModal.jsx', categoryModalComponent);
fs.writeFileSync('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/AccountModal.jsx', accountModalComponent);
fs.writeFileSync('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/TransactionModal.jsx', transactionModalComponent);

// Now replace in FinanceModule.jsx (bottom to top)

lines.splice(2665 - 1, 2881 - 2665 + 1,
    `            <TransactionModal`,
    `                isAddingTransaction={isAddingTransaction}`,
    `                setIsAddingTransaction={setIsAddingTransaction}`,
    `                handleAddTransaction={handleAddTransaction}`,
    `                newTransaction={newTransaction}`,
    `                setNewTransaction={setNewTransaction}`,
    `                accounts={accounts}`,
    `                categories={categories}`,
    `                isCategoryDropdownOpen={isCategoryDropdownOpen}`,
    `                setIsCategoryDropdownOpen={setIsCategoryDropdownOpen}`,
    `                categorySearchQuery={categorySearchQuery}`,
    `                setCategorySearchQuery={setCategorySearchQuery}`,
    `                setEditingCategoryData={setEditingCategoryData}`,
    `                setIsEditingCategory={setIsEditingCategory}`,
    `                projects={projects}`,
    `            />`
);

lines.splice(2610 - 1, 2662 - 2610 + 1,
    `            <AccountModal`,
    `                isEditingAccount={isEditingAccount}`,
    `                setIsEditingAccount={setIsEditingAccount}`,
    `                editingAccountData={editingAccountData}`,
    `                setEditingAccountData={setEditingAccountData}`,
    `                handleSaveAccount={handleSaveAccount}`,
    `                handleDeleteAccount={handleDeleteAccount}`,
    `            />`
);

lines.splice(2513 - 1, 2607 - 2513 + 1,
    `            <CategoryModal`,
    `                isEditingCategory={isEditingCategory}`,
    `                setIsEditingCategory={setIsEditingCategory}`,
    `                editingCategoryData={editingCategoryData}`,
    `                setEditingCategoryData={setEditingCategoryData}`,
    `                handleSaveCategory={handleSaveCategory}`,
    `                handleDeleteCategory={handleDeleteCategory}`,
    `            />`
);

// Add imports
const imports = [
    "import TransactionModal from './modals/TransactionModal';",
    "import CategoryModal from './modals/CategoryModal';",
    "import AccountModal from './modals/AccountModal';"
];

lines.splice(17, 0, ...imports);

fs.writeFileSync(filePath, lines.join(delimiter));
console.log('Successfully extracted modals');
