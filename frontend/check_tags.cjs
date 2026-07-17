const fs = require('fs');

function checkTags(filename) {
    const code = fs.readFileSync(filename, 'utf8');
    const tags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'strong', 'button', 'svg', 'path', 'Link', 'form', 'input', 'footer', 'thead', 'tbody', 'tr', 'th', 'td', 'table'];
    
    console.log("Checking: " + filename);
    tags.forEach(tag => {
        const opens = (code.match(new RegExp('<' + tag + '(\\s|>)', 'g')) || []).length;
        const closes = (code.match(new RegExp('</' + tag + '>', 'g')) || []).length;
        if (opens !== closes && tag !== 'path' && tag !== 'input') {
            console.log("MISMATCH -> " + tag + ": <" + tag + " (" + opens + ") vs </" + tag + "> (" + closes + ")");
        }
    });
}

checkTags('src/pages/Dashboard/Dashboard.jsx');
