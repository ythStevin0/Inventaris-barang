const fs = require('fs');

function checkBalance(filename) {
    const code = fs.readFileSync(filename, 'utf8');
    let braces = 0;
    let parens = 0;
    let brackets = 0;
    
    // Very simple check
    for (let i = 0; i < code.length; i++) {
        if (code[i] === '{') braces++;
        if (code[i] === '}') braces--;
        if (code[i] === '(') parens++;
        if (code[i] === ')') parens--;
        if (code[i] === '[') brackets++;
        if (code[i] === ']') brackets--;
    }
    console.log(filename + " - Braces: " + braces + ", Parens: " + parens + ", Brackets: " + brackets);
}

checkBalance('src/pages/Dashboard/original_dashboard.jsx');
checkBalance('src/pages/Dashboard/Dashboard.jsx');
