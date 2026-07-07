const fs = require('fs');

const overviewPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/tabs/OverviewTab.jsx';
let overviewContent = fs.readFileSync(overviewPath, 'utf8');

// Replace `icon: PieChart` with `icon: PieChartIcon`
overviewContent = overviewContent.replace(/icon:\s*PieChart/g, 'icon: PieChartIcon');

// Replace `<PieChart ` with `<PieChartIcon ` 
overviewContent = overviewContent.replace(/<PieChart\s/g, '<PieChartIcon ');

fs.writeFileSync(overviewPath, overviewContent);
console.log("Fixed PieChart references");
