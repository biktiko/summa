const fs = require('fs');
const filePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let c = fs.readFileSync(filePath, 'utf8');

const getLocalYYYYMMDDFn = `const getLocalYYYYMMDD = (dateOrStr) => {
    const d = dateOrStr ? new Date(dateOrStr) : new Date();
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};`;

// Remove original definition
c = c.replace(/const getLocalYYYYMMDD = \(\s*dateOrStr[\s\S]*?\};\n/g, '');

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

// Add to top level
c = c.replace(/const FinanceModule =/g, getLocalYYYYMMDDFn + '\n\n' + formatDateToDDMMYYYYFn + '\n\nconst FinanceModule =');

// Remove formatDateToDDMMYYYY from inside the component
c = c.replace(/const formatDateToDDMMYYYY = \(\s*dateString[\s\S]*?\};\n/g, '');

// Replace all toISOString().slice(0, 10) usages
c = c.replace(/new Date\(\)\.toISOString\(\)\.slice\(0,\s*10\)/g, 'getLocalYYYYMMDD()');
c = c.replace(/defaultTarget\.toISOString\(\)\.slice\(0,\s*10\)/g, 'getLocalYYYYMMDD(defaultTarget)');
c = c.replace(/curr\.toISOString\(\)\.slice\(0,\s*10\)/g, 'getLocalYYYYMMDD(curr)');
c = c.replace(/weekStart\.toISOString\(\)\.slice\(0,\s*10\)/g, 'getLocalYYYYMMDD(weekStart)');
c = c.replace(/current\.toISOString\(\)\.slice\(0,\s*10\)/g, 'getLocalYYYYMMDD(current)');

// Additional date fixes
c = c.replace(/curr\.toISOString\(\)\.slice\(0, 7\)/g, "getLocalYYYYMMDD(curr).slice(0, 7)");
c = c.replace(/monthStart\.toISOString\(\)\.slice\(0, 7\)/g, "getLocalYYYYMMDD(monthStart).slice(0, 7)");

// Fix startsWith
c = c.replace(/t\.createdAt\.startsWith\(dayStr\)/g, "getLocalYYYYMMDD(t.createdAt) === dayStr");
c = c.replace(/t\.createdAt\.startsWith\(monthStr\)/g, "getLocalYYYYMMDD(t.createdAt).startsWith(monthStr)");

// Update X-axis label to be DD.MM
c = c.replace(/label: curr\.getDate\(\)\.toString\(\),/g, "label: String(curr.getDate()).padStart(2, '0') + '.' + String(curr.getMonth() + 1).padStart(2, '0'),");

// Fix tooltips
const customBalanceTooltipReplacement = `const CustomBalanceTooltip = ({ active, payload, label, formatMoney, balanceChartMode }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const displayLabel = data.fullDate ? formatDateToDDMMYYYY(data.fullDate) : label;
        return (
            <div className="bg-slate-900 border-none rounded-xl p-4 shadow-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{displayLabel}</div>`;

c = c.replace(/const CustomBalanceTooltip = \(\{ active, payload, label, formatMoney, balanceChartMode \}\) => \{\s*if \(active && payload && payload\.length\) \{\s*const data = payload\[0\]\.payload;\s*return \(\s*<div className="bg-slate-900 border-none rounded-xl p-4 shadow-xl">\s*<div className="text-\[10px\] font-bold text-slate-400 uppercase mb-2">\{label\}<\/div>/g, customBalanceTooltipReplacement);

// Fix expanded tooltip
c = c.replace(/<RechartsTooltip \n                                                  contentStyle=\{\{\s*backgroundColor:\s*'#0f172a'[\s\S]*?\/>/g, `<RechartsTooltip content={<CustomBalanceTooltip formatMoney={formatMoney} balanceChartMode={balanceChartMode} />} />`);
c = c.replace(/<RechartsTooltip\s*contentStyle=\{\{\s*backgroundColor:\s*'#0f172a'[\s\S]*?\/>/g, `<RechartsTooltip content={<CustomBalanceTooltip formatMoney={formatMoney} balanceChartMode={balanceChartMode} />} />`);

fs.writeFileSync(filePath, c);
console.log('All fixes applied successfully');
