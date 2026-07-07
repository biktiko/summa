const fs = require('fs');
const content = fs.readFileSync('c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx', 'utf8');
const lines = content.split('\n');
const findBlock = (startStr) => {
    let start = -1;
    let end = -1;
    let braces = 0;
    let parens = 0;
    let inBlock = false;
    for (let i = 0; i < lines.length; i++) {
        if (!inBlock && lines[i].includes(startStr)) {
            start = i + 1;
            inBlock = true;
            for (let char of lines[i].substring(lines[i].indexOf(startStr))) {
                if (char === '{') braces++;
                if (char === '}') braces--;
                if (char === '(') parens++;
                if (char === ')') parens--;
            }
            continue;
        }
        if (inBlock) {
            for (let char of lines[i]) {
                if (char === '{') braces++;
                if (char === '}') braces--;
                if (char === '(') parens++;
                if (char === ')') parens--;
            }
            if (braces === 0 && parens === 0) {
                end = i + 1;
                return { start, end };
            }
        }
    }
    return null;
}
console.log('overview:', findBlock("{dashboardTab === 'overview' && ("));
console.log('budget:', findBlock("{dashboardTab === 'budget' && ("));
console.log('history:', findBlock("{dashboardTab === 'history' && ("));
console.log('planning:', findBlock("{dashboardTab === 'planning' && ("));
