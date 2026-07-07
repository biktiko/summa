const fs = require('fs');

const mainPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(mainPath, 'utf8');

const searchStr = `                     />\n\n        </div>\n    );\n};\n\nexport default FinanceModule;`;
const searchStr2 = `                     />\r\n\r\n        </div>\r\n    );\r\n};\r\n\r\nexport default FinanceModule;`;

const replacement = `                     />\n            </div>\n        </div>\n        </div>\n    );\n};\n\nexport default FinanceModule;`;

if (content.includes(searchStr)) {
    content = content.replace(searchStr, replacement);
    fs.writeFileSync(mainPath, content);
    console.log("Fixed end 1");
} else if (content.includes(searchStr2)) {
    content = content.replace(searchStr2, replacement);
    fs.writeFileSync(mainPath, content);
    console.log("Fixed end 2");
} else {
    // If not matching, just replace the last div
    const idx = content.lastIndexOf('        </div>');
    if (idx !== -1) {
        content = content.substring(0, idx) + '            </div>\n        </div>\n        </div>' + content.substring(idx + 14);
        fs.writeFileSync(mainPath, content);
        console.log("Fixed end 3");
    } else {
        console.log("Could not find end");
    }
}
