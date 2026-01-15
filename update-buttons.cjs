const fs = require('fs');
const path = require('path');

const files = [
  ...fs.readdirSync('services').filter(f => f.endsWith('.html')).map(f => path.join('services', f)),
  ...fs.readdirSync('portfolio').filter(f => f.endsWith('.html')).map(f => path.join('portfolio', f)),
  'materials.html',
  'about.html',
  'index.html'
];

let totalButtons = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Replace copper buttons with primary + silver border
  // Pattern 1: bg-accent-copper-500 hover:bg-accent-copper-600
  let newContent = content.replace(
    /bg-accent-copper-500 hover:bg-accent-copper-600 text-white/g,
    'bg-gradient-primary hover:opacity-90 text-white border-2 border-accent-silver-200 shadow-md'
  );

  // Pattern 2: bg-accent-copper-500 hover:bg-accent-copper-600 (with other classes)
  newContent = newContent.replace(
    /bg-accent-copper-500 hover:bg-accent-copper-600/g,
    'bg-gradient-primary hover:opacity-90 border-2 border-accent-silver-200 shadow-md'
  );

  // Count changes
  const originalCopper = (content.match(/bg-accent-copper/g) || []).length;
  const newPrimary = (newContent.match(/bg-gradient-primary/g) || []).length;

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`✓ Updated ${originalCopper} buttons in ${path.basename(file)}`);
    totalButtons += originalCopper;
  }
});

console.log(`\n✅ Updated ${totalButtons} buttons from copper to gradient-primary with silver borders!`);
