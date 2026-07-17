const fs = require('fs');

const code = fs.readFileSync('src/pages/Dashboard/Dashboard.jsx', 'utf8');
const opens = (code.match(/<>/g) || []).length;
const closes = (code.match(/<\/>/g) || []).length;
console.log("<> : " + opens + " vs </>: " + closes);
