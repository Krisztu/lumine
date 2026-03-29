const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src', 'app', 'dashboard', 'components');

const functionalIcons = new Set([
  'X', 'XCircle', 'Check', 'CheckCircle', 'Plus', 'Edit', 
  'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight', 
  'Loader2', 'MoreHorizontal', 'LogOut', 'Sun', 'Moon'
]);

// Components considered as navbar/sidebar - skip them!
const skippedFiles = [
  'Sidebar.tsx', 
  'DashboardTabs.tsx', 
  'DashboardHeader.tsx'
];

function processFile(filePath) {
  const fileName = path.basename(filePath);
  if (skippedFiles.includes(fileName)) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  // Find lucide-react import
  const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
  if (!importMatch) return;

  const importedIdents = importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  
  const toRemove = [];
  const toKeep = [];

  importedIdents.forEach(ident => {
    // Some might be aliased import { Image as ImageIcon }
    const actualName = ident.split(' as ').pop().trim();
    if (functionalIcons.has(actualName) || functionalIcons.has(ident)) {
      toKeep.push(ident);
    } else {
      toRemove.push(actualName);
    }
  });

  if (toRemove.length === 0) return;

  // Remove the components from JSX
  toRemove.forEach(iconName => {
    // Match <IconName className="..." /> or <IconName /> or <IconName></IconName>
    // We will do a generic regex: <IconName [^>]*\/>
    const tagRegex1 = new RegExp(`<${iconName}\\s+[^>]*/>`, 'g');
    const tagRegex2 = new RegExp(`<${iconName}\\s*/>`, 'g');
    
    content = content.replace(tagRegex1, '');
    content = content.replace(tagRegex2, '');
  });

  // Update or remove the import statement
  if (toKeep.length === 0) {
    // Remove the entire import
    content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"]\s*[\r\n]*/, '');
  } else {
    // Update the import
    const newImport = `import { ${toKeep.join(', ')} } from 'lucide-react'`;
    content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]lucide-react['"]/, newImport);
  }

  // Also remove some empty divs or spans around the icon if they just hold the icon?
  // Usually it's in a <CardTitle className="..."> <IconName .../> Title </CardTitle>
  // Let's also clean up unncecessary `flex items-center` from CardTitle if it was used for the icon.
  // Actually, keeping flex items-center is harmless.

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${fileName}`);
}

fs.readdirSync(directory).forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(directory, file));
  }
});
