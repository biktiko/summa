const fs = require('fs');

const overviewPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/tabs/OverviewTab.jsx';
const financePath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';

let overviewContent = fs.readFileSync(overviewPath, 'utf8');
let financeContent = fs.readFileSync(financePath, 'utf8');

const modalsMarker = '            {/* --- MODALS --- */}';
const modalsIndex = overviewContent.indexOf(modalsMarker);

if (modalsIndex !== -1) {
    // Extract everything from modalsMarker up to the end of the JSX fragment
    const endOfFragmentMarker = '        </>';
    const endOfFragmentIndex = overviewContent.lastIndexOf(endOfFragmentMarker);
    
    if (endOfFragmentIndex !== -1) {
        const extractedModals = overviewContent.substring(modalsIndex, endOfFragmentIndex);
        
        // Remove from OverviewTab.jsx
        // Wait, the "</div>" right before modalsMarker is the one causing "Expected closing tag for <>"
        // Let's remove that extra "</div>" too.
        // It's located right before { /* --- MODALS --- */ }
        
        // Let's just replace the whole chunk from the extra `</div>` to the `</>` with `</>`
        const preModalContent = overviewContent.substring(0, modalsIndex);
        // Find the last `</div>` in preModalContent and remove it
        const lastDivIndex = preModalContent.lastIndexOf('</div>');
        let newOverviewContent = overviewContent;
        if (lastDivIndex !== -1) {
            newOverviewContent = preModalContent.substring(0, lastDivIndex) + '\n' + endOfFragmentMarker + overviewContent.substring(endOfFragmentIndex + endOfFragmentMarker.length);
        }
        
        fs.writeFileSync(overviewPath, newOverviewContent);
        console.log("Fixed OverviewTab.jsx");
        
        // Now insert extractedModals into FinanceModule.jsx right before `</div>`s at the end.
        // FinanceModule.jsx ends with:
        //             </div>
        //         </div>
        //     );
        // };
        const financeEndIndex = financeContent.lastIndexOf('            </div>\n        </div>\n    );\n};');
        if (financeEndIndex !== -1) {
            const newFinanceContent = financeContent.substring(0, financeEndIndex) + '\n' + extractedModals + '\n' + financeContent.substring(financeEndIndex);
            fs.writeFileSync(financePath, newFinanceContent);
            console.log("Fixed FinanceModule.jsx");
        } else {
            console.log("Could not find end of FinanceModule.jsx");
        }
    }
} else {
    console.log("Modals marker not found in OverviewTab.jsx");
}
