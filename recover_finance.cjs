const fs = require('fs');

const path = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(path, 'utf8');

// I will look for the duplicate section.
// The duplicate starts with:
//                                         <div className="text-[9px] text-slate-400 font-bold mt-1">On {new Date(predictionDateRange.start).toLocaleDateString()}</div>
// And it ends right before:
//             {dashboardTab === 'history' && (
//                 <HistoryTab formatMoney={formatMoney}

// Since `dashboardTab === 'history'` appears normally once, but now it appears TWICE!
// Wait, the multi replace output showed:
// +             {dashboardTab === 'history' && (
// +                 <HistoryTab formatMoney={formatMoney}
// So `dashboardTab === 'history'` is duplicated too!

const firstMarker = "                                        <div className=\"text-[9px] text-slate-400 font-bold mt-1\">On {new Date(predictionDateRange.start).toLocaleDateString()}</div>";

const firstOccurrence = content.indexOf(firstMarker);
const lastOccurrence = content.lastIndexOf(firstMarker);

if (firstOccurrence !== -1 && lastOccurrence !== -1 && firstOccurrence !== lastOccurrence) {
    console.log("Found duplicate!");
    // The duplicate was inserted at around line 1873.
    // The previous text before the bad insertion was:
    //                     getLocalYYYYMMDD={getLocalYYYYMMDD}
    //                     setEditingAccountData={setEditingAccountData}
    //                     setIsEditingAccount={setIsEditingAccount}
    
    // I can just replace the WHOLE chunk that `multi_replace_file_content` produced, with what it SHOULD have been.
    // Let's just restore the file up to line 1870, then manually append what I wanted.
    
    // Wait, the easiest way is to use `git restore src/modules/Finance/FinanceModule.jsx`, BUT I did some valid changes after git commit.
    // Wait, the git status showed: `modified:   src/modules/Finance/FinanceModule.jsx`
    // When was the last commit? 
    // I can just chop out the duplicate.
    
    // The text that multi_replace removed was:
    //                     getAccountBalance={getAccountBalance}
    //                     getDateRangeLabel={getDateRangeLabel}
    //                     viewMode={viewMode}
    //                     monthTransactions={monthTransactions}
    //                 />
    //             )}
    // 
    //                      {/* --- ANALYTICS VIEW --- */}
    //                      <OverviewTab ... />
    
    // So let's find:
    const cutStartString = "                    setIsEditingAccount={setIsEditingAccount}\r\n                                        <div className=\"text-[9px] text-slate-400 font-bold mt-1\">On {new Date(predictionDateRange.start).toLocaleDateString()}</div>";
    
    // Let's do it safer. 
    // I'll read the file, find the second occurrence of `predictionDateRange.start`, and delete backwards up to `setIsEditingAccount={setIsEditingAccount}`, replacing it with the proper `HistoryTab` ending and `OverviewTab`!
}

