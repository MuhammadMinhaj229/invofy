const fs = require('fs');
const path = require('path');

const files = [
  'app/[locale]/layout.tsx',
  'app/[locale]/opengraph-image.tsx',
  'app/components/layout/LandingContent.tsx',
  'app/manifest.ts',
  'i18n/locales/en.json',
  'lib/seo.ts'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/Free Invoice Generator/gi, 'Safar Invoice Generator');
    content = content.replace(/free invoice generator/gi, 'Safar Invoice Generator');
    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
  }
});
