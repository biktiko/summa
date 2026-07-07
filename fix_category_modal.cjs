const fs = require('fs');

const path = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/CategoryModal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the typo
content = content.replace(/months\.filter\(x=>x!==i\\\)}\\\);/g, 'months.filter(x=>x!==i)});');
content = content.replace(/months\.filter\(x=>x!==i}\)}\);/g, 'months.filter(x=>x!==i)});');
content = content.replace(/months\.filter\(x=>x!==i<\/>\);/g, 'months.filter(x=>x!==i)});');
content = content.replace(/months\.filter\(x=>x!==i\\\}\\\)\\\);/g, 'months.filter(x=>x!==i)});');

// Fix the end of the file to have proper `</>);`
const endSearchStr = `                  </div>\r\n              </div>\r\n          </div>\r\n      )}\\)}\\);`;
if (content.includes(endSearchStr)) {
    content = content.replace(endSearchStr, `                  </div>\n              </div>\n          </div>\n      </>);`);
} else {
    // maybe \n
    content = content.replace(/}\\\)}\\\);$/g, '</>);');
    content = content.replace(/}\)}\);$/g, '</>);');
}

fs.writeFileSync(path, content);
console.log("Fixed CategoryModal");
