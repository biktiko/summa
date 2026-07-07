const fs = require('fs');
const path = 'c:/Users/user/Desktop/Workplace/Summa/summa/src/modules/Finance/modals/CategoryModal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the very end
content = content.replace(/\s*\)\}\s*\)\s*;\s*};\s*export default CategoryModal;/g, '\n    </>\n    );\n};\n\nexport default CategoryModal;');

fs.writeFileSync(path, content);
console.log("Fixed CategoryModal end");
