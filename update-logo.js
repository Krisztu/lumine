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

  if (content.match(/LuminéLogo/i)) {
    // Replace old logo with new one
    content = content.replace(/LuminéLogo\.png/g, 'LuminéLogo2.png');
    
    // Remove hover animations attached to the Logo directly (e.g. page.tsx, sidebar.tsx)
    // Actually just removing "hover:scale-[number]" and "transition-transform" works.
    content = content.replace(/hover:scale-\d+/g, '');
    content = content.replace(/transition-[\w-]+ duration-\d+/g, '');
    
    // Increase logo sizes for different places
    
    // Sidebar: w-10 h-10 -> w-16 h-16
    if (file.includes('Sidebar')) {
      content = content.replace(/w-10 h-10/g, 'w-16 h-16');
    }
    
    // Page.tsx: h-24 sm:h-32 -> h-40 sm:h-56
    if (file.includes('page.tsx')) {
      content = content.replace(/h-24 sm:h-32/g, 'h-40 sm:h-56');
    }
    
    // Loading Screen: w-16 h-16 sm:w-20 sm:h-20 -> w-32 h-32 sm:w-40 sm:h-40
    if (file.includes('loading-screen.tsx')) {
      content = content.replace(/w-16 h-16 sm:w-20 sm:h-20/g, 'w-32 h-32 sm:w-40 sm:h-40');
    }
    
    // Inline tabs sizes
    if (file.includes('GradesTab') || file.includes('MonthlyBehaviorTab')) {
      content = content.replace(/w-6 h-6/g, 'w-10 h-10');
      content = content.replace(/w-5 h-5/g, 'w-8 h-8');
    }

    if (original !== content) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed:', file);
    }
  }
});
