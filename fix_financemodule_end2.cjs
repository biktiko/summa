const fs = require('fs');
const mainPath = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/FinanceModule.jsx';
let content = fs.readFileSync(mainPath, 'utf8');

// The end looks like:
//             </div>
//         </div>
//         </div>
//     );
// };

content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*};\s*export default FinanceModule;/g, 
`            </div>\n        </div>\n    );\n};\n\nexport default FinanceModule;`);

fs.writeFileSync(mainPath, content);
console.log("Fixed to 2 divs");
