const fs = require('fs');
const path = require('path');

const replacements = {
  'text-[#11224E]': 'text-emerald-900',
  'bg-[#11224E]/10': 'bg-emerald-50',
  'hover:bg-[#11224E]/10': 'hover:bg-emerald-50',
  'bg-[#11224E]/90': 'bg-emerald-800',
  'hover:bg-[#11224E]/90': 'hover:bg-emerald-800',
  'bg-[#11224E]': 'bg-emerald-700',
  'hover:bg-[#11224E]': 'hover:bg-emerald-800',
  'border-[#11224E]': 'border-emerald-700',
  'ring-[#11224E]': 'ring-emerald-700',
  'focus:border-[#11224E]': 'focus:border-emerald-700',
  'focus:ring-[#11224E]': 'focus:ring-emerald-700',
  'text-[#F87B1B]': 'text-teal-600',
  'bg-[#F87B1B]/10': 'bg-teal-50',
  'bg-[#F87B1B]/90': 'bg-teal-600',
  'hover:bg-[#F87B1B]/90': 'hover:bg-teal-600',
  'bg-[#F87B1B]': 'bg-teal-500',
  'hover:bg-[#F87B1B]': 'hover:bg-teal-600',
  'border-[#F87B1B]': 'border-teal-500',
  'ring-[#F87B1B]': 'ring-teal-500',
  'focus:border-[#F87B1B]': 'focus:border-teal-500',
  'focus:ring-[#F87B1B]': 'focus:ring-teal-500'
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDir = fs.statSync(dirPath).isDirectory();
    if (isDir) {
      walkDir(dirPath);
    } else if (dirPath.endsWith('.jsx')) {
      replaceInFile(dirPath);
    }
  });
}

walkDir('c:/Users/helmy/Inventaris-barang/frontend/src');
