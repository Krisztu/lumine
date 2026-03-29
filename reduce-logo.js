const fs = require('fs');
const path = require('path');

function walk(d) {
  let files = [];
  try {
    const list = fs.readdirSync(d);
    list.forEach(f => {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) {
        files = files.concat(walk(p));
      } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
        files.push(p);
      }
    });
  } catch(e) {}
  return files;
}

const targetDirs = [
  path.join(__dirname, 'src', 'app'),
  path.join(__dirname, 'src', 'shared')
];

let files = [];
targetDirs.forEach(d => {
  files = files.concat(walk(d));
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Decrease logo sizes for different places
  
  if (file.includes('Sidebar')) {
    content = content.replace(/w-16 h-16/g, 'w-12 h-12');
  }
  
  if (file.includes('page.tsx')) {
    content = content.replace(/h-40 sm:h-56/g, 'h-28 sm:h-40');
  }
  
  if (file.includes('loading-screen.tsx')) {
    content = content.replace(/w-32 h-32 sm:w-40 sm:h-40/g, 'w-24 h-24 sm:w-32 sm:h-32');
  }
  
  if (file.includes('GradesTab') || file.includes('MonthlyBehaviorTab')) {
    content = content.replace(/w-10 h-10/g, 'w-8 h-8');
    content = content.replace(/w-8 h-8/g, 'w-6 h-6');
  }

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed sizes in:', file);
  }
});
