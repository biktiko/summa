const fs = require('fs');

function fixModal(filePath, varName) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the opening `{varName && (`
    const regexOpen = new RegExp(`\\{\\s*${varName}\\s*&&\\s*\\(`);
    content = content.replace(regexOpen, '<>');

    // Replace the closing `)}` before `);` at the end
    // The closing is usually:
    //         )}
    //     );
    const regexClose = /\)\}\s*\)\s*;/;
    if (regexClose.test(content)) {
        content = content.replace(regexClose, '</>);');
    } else {
        // Fallback: replace the last `)}`
        const lastIdx = content.lastIndexOf(')}');
        if (lastIdx !== -1) {
            content = content.substring(0, lastIdx) + '</>' + content.substring(lastIdx + 2);
        }
    }

    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
}

fixModal('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/AccountModal.jsx', 'isEditingAccount');
fixModal('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/CategoryModal.jsx', 'isEditingCategory');
fixModal('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/TransactionModal.jsx', 'isEditingTransaction');
