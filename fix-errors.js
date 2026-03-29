const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app', 'dashboard', 'components');

function fixFiles(directory) {
  fs.readdirSync(directory).forEach(file => {
    const p = path.join(directory, file);
    if (fs.statSync(p).isDirectory()) {
      fixFiles(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf-8');
      let changed = false;

      // Case 1: ternary praising {rec.type === 'praise' ? () : ()}
      // Can span multiple lines. We'll use a regex that matches the opening and closing parenthesis with only whitespace inside.
      const praiseRegex = /\{([\w\.]+)\s*===\s*['"]praise['"]\s*\?\s*\(\s*\)\s*:\s*\(\s*\)\s*\}/g;
      if (praiseRegex.test(content)) {
        content = content.replace(praiseRegex, `{$1 === 'praise' ? (<img src="/LuminéLogo.png" alt="Dicséret" className="w-5 h-5 object-contain" />) : (<img src="/LuminéLogo.png" alt="Figyelmeztetés" className="w-5 h-5 object-contain grayscale opacity-50" />)}`);
        changed = true;
      }
      
      const singlePraiseRegex = /\{([\w\.]+)\s*===\s*['"]praise['"]\s*\?\s*\(\s*\)\s*:\s*\(\s*\)\s*\}/g;
      // also replacing ones where there's no parenthesis? In my earlier mistake, the tags were simply removed, so `()` were leftover from `( <Icon /> )`.

      // Case 2: Leftover empty JSX expressions like `{ ... && }` or `{ ... &&\r\n}`.
      // This is a bit tricky. We can just replace `&& }` with `&& null}`.
      const andRegex = /&&\s*\}/g;
      if (andRegex.test(content)) {
        content = content.replace(andRegex, `&& null}`);
        changed = true;
      }

      // Case 3: Empty tags sometimes generated? No, my previous script only did tag removal.
      
      // We will also check if `import { } from 'lucide-react'` was left empty without removing it.
      const emptyImportRegex = /import\s*\{\s*\}\s*from\s*['"]lucide-react['"];?\s*[\r\n]*/g;
      if (emptyImportRegex.test(content)) {
        content = content.replace(emptyImportRegex, '');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(p, content, 'utf-8');
        console.log('Fixed', file);
      }
    }
  });
}

fixFiles(dir);

