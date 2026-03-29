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

  if (content.match(/LuminéLogo2\.png/g)) {
    // Revert logo back to LuminéLogo.png everywhere
    content = content.replace(/LuminéLogo2\.png/g, 'LuminéLogo.png');

    if (original !== content) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed to LuminéLogo.png:', file);
    }
  }
});
