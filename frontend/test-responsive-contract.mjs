import fs from 'node:fs';
const css=fs.readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');const nav=fs.readFileSync(new URL('./src/navigation.js',import.meta.url),'utf8');
const checks=[['mobile breakpoint',/@media\(max-width:720px\)/.test(css)],['tablet breakpoint',/@media\(max-width:900px\)/.test(css)],['mobile sidebar hidden',/\.sidebar\{display:none\}/.test(css)],['mobile nav displayed',/\.mobileNav\{display:grid/.test(css)],['touch target 44',/min-height:44px/.test(css)],['five-column mobile nav',/grid-template-columns:repeat\(5,1fr\)/.test(css)],['role nav definitions',/MOBILE_NAV/.test(nav)]];
for(const [name,pass] of checks)console.log(`${pass?'PASS':'FAIL'} ${name}`);process.exit(checks.every(([,p])=>p)?0:1);
