const fs = require('fs');
const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let c = fs.readFileSync(filePath, 'utf8');

const formatDateToDDMMYYYYFn = `const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return \`\${parts[2]}.\${parts[1]}.\${parts[0]}\`;
    } else if (parts.length === 2) {
        return \`01.\${parts[1]}.\${parts[0]}\`;
    }
    return dateString;
};`;

if (!c.includes('const formatDateToDDMMYYYY')) {
    c = c.replace(/const FinanceModule =/g, formatDateToDDMMYYYYFn + '\n\nconst FinanceModule =');
    fs.writeFileSync(filePath, c);
    console.log("formatDateToDDMMYYYY inserted");
}
