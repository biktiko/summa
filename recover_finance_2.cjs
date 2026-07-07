const fs = require('fs');
const path = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

// Find where the duplication starts
let dupStartIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setIsEditingAccount={setIsEditingAccount}')) {
        // The line after this should be the rest of HistoryTab props
        // But the multi_replace replaced it with `On {new Date(predictionDateRange...`
        if (lines[i+1] && lines[i+1].includes('predictionDateRange.start')) {
            dupStartIndex = i + 1;
            break;
        }
    }
}

if (dupStartIndex !== -1) {
    // Find where the duplication ends. 
    // The duplicated block ends when `<OverviewTab` is finally called.
    // Let's find the first `<OverviewTab` after dupStartIndex
    let overviewIndex = -1;
    for (let i = dupStartIndex; i < lines.length; i++) {
        if (lines[i].includes('<OverviewTab')) {
            overviewIndex = i;
            break;
        }
    }
    
    if (overviewIndex !== -1) {
        // We will slice out lines from `dupStartIndex` to `overviewIndex - 1` (or slightly above if there are comments)
        // Wait, the original code had:
        //                     getAccountBalance={getAccountBalance}
        //                     getDateRangeLabel={getDateRangeLabel}
        //                     viewMode={viewMode}
        //                     monthTransactions={monthTransactions}
        //                 />
        //             )}
        //
        //                      {/* --- ANALYTICS VIEW --- */}
        //                     {dashboardTab === 'overview' && (
        
        let overviewCommentIndex = overviewIndex;
        while (overviewCommentIndex > dupStartIndex && !lines[overviewCommentIndex - 1].includes('ANALYTICS VIEW')) {
            overviewCommentIndex--;
        }
        if (lines[overviewCommentIndex - 1].includes('ANALYTICS VIEW')) {
            overviewCommentIndex--; // include the comment
        }
        
        // Remove the duplicated block
        lines.splice(dupStartIndex, overviewCommentIndex - dupStartIndex);
        
        // Insert the missing props for HistoryTab
        const missingLines = [
            "                    getAccountBalance={getAccountBalance}",
            "                    getDateRangeLabel={getDateRangeLabel}",
            "                    viewMode={viewMode}",
            "                    monthTransactions={monthTransactions}",
            "                />",
            "            )}"
        ];
        lines.splice(dupStartIndex, 0, ...missingLines);
        
        fs.writeFileSync(path, lines.join('\n'));
        console.log("FinanceModule successfully recovered!");
    } else {
        console.log("Could not find OverviewTab after duplication");
    }
} else {
    console.log("Could not find duplication start");
}
