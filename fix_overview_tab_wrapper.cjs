const fs = require('fs');

const overviewPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/tabs/OverviewTab.jsx';
const financePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';

let overviewContent = fs.readFileSync(overviewPath, 'utf8');

// 1. Remove `{dashboardTab === 'overview' && (` from OverviewTab.jsx
overviewContent = overviewContent.replace(/\{\s*dashboardTab\s*===\s*'overview'\s*&&\s*\(/, '');

// 2. Remove the matching `)}` from OverviewTab.jsx (near the end)
// The end looks like:
//                              </div>
//                          </div>
//                      )}
//             
//         </>
const endMatcher = /\)\s*\}\s*<\/>/g;
overviewContent = overviewContent.replace(/\)\s*\}\s*(<\/>\s*\)\s*;\s*\}\s*;\s*export default OverviewTab;)/, '$1');

fs.writeFileSync(overviewPath, overviewContent);

// 3. Wrap <OverviewTab in FinanceModule.jsx
let financeContent = fs.readFileSync(financePath, 'utf8');

// The call is:
//                      {/* --- ANALYTICS VIEW --- */}
//                      <OverviewTab 
//                          filterAccountsList={filterAccountsList}

financeContent = financeContent.replace(
    /\/\*\s*---\s*ANALYTICS VIEW\s*---\s*\*\/\s*<OverviewTab/,
    `{/* --- ANALYTICS VIEW --- */}\n                     {dashboardTab === 'overview' && (\n                     <OverviewTab`
);

// Close the wrapper. Where does <OverviewTab /> end?
// The end of the <OverviewTab ... /> call in FinanceModule.jsx:
//                          formatDateToDDMMYYYY={formatDateToDDMMYYYY}
//                      />
//             </div>
//         </div>
financeContent = financeContent.replace(
    /(formatDateToDDMMYYYY=\{formatDateToDDMMYYYY\}\s*\/>)/,
    `$1\n                     )}`
);

fs.writeFileSync(financePath, financeContent);
console.log("Fixed dashboardTab wrapper");
