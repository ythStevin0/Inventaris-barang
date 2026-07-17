const fs = require('fs');

function checkQuotes(filename) {
    const code = fs.readFileSync(filename, 'utf8');
    let doubleQuotes = 0;
    let singleQuotes = 0;
    let backticks = 0;
    for (let i = 0; i < code.length; i++) {
        if (code[i] === '"' && code[i-1] !== '\\') doubleQuotes++;
        if (code[i] === "'" && code[i-1] !== '\\') singleQuotes++;
        if (code[i] === "\`" && code[i-1] !== '\\') backticks++;
    }
    console.log("Double Quotes: " + (doubleQuotes % 2 === 0 ? "BALANCED" : "UNBALANCED") + " (" + doubleQuotes + ")");
    console.log("Single Quotes: " + (singleQuotes % 2 === 0 ? "BALANCED" : "UNBALANCED") + " (" + singleQuotes + ")");
    console.log("Backticks: " + (backticks % 2 === 0 ? "BALANCED" : "UNBALANCED") + " (" + backticks + ")");
}

checkQuotes('src/pages/Dashboard/Dashboard.jsx');
