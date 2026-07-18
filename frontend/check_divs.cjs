const fs = require('fs');

function checkDivs(filename) {
    const code = fs.readFileSync(filename, 'utf8');
    const opens = (code.match(/<div(\s|>)/g) || []).length;
    const closes = (code.match(/<\/div>/g) || []).length;
    console.log(filename + " - <div: " + opens + ", </div: " + closes);
}

checkDivs('src/pages/Dashboard/original_dashboard.jsx');
checkDivs('src/pages/Dashboard/Dashboard.jsx');
