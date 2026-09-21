import fs from 'node:fs';
const files=['src/App.jsx','src/api.js','src/auth.js','src/navigation.js','src/page-registry.js','src/ui-state.js','src/styles.css'];
const text=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
for(const rule of [[/eval\s*\(/,'eval is forbidden'],[/href=["']#["']/,'placeholder links are forbidden'],[/onClick=\{\(\)=>alert/,'alert-based interactions are forbidden']]){if(rule[0].test(text))throw new Error(rule[1]);}
if(!text.includes(':focus-visible'))throw new Error('focus-visible styling required');
if(!text.includes('min-height:44px'))throw new Error('44px touch target contract required');
console.log('frontend source lint PASS');
