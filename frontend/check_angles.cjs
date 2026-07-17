const fs = require('fs');
const code = fs.readFileSync('src/pages/Dashboard/Dashboard.jsx', 'utf8');
const opens = (code.match(/</g) || []).length;
const closes = (code.match(/>/g) || []).length;
const arrows = (code.match(/=>/g) || []).length;
const gts = (code.match(/\s>\s/g) || []).length;
console.log("< : " + opens + " vs > : " + (closes - arrows - gts));
