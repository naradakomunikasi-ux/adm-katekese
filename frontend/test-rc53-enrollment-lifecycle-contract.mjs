import fs from 'node:fs';
const src=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[
 ['canonical enrollment endpoint',src.includes('/enrollments`')||src.includes('/enrollments')],
 ['program first selector',src.includes('Kelola Enrollment')&&src.includes('chooseEnrollmentProgram')],
 ['batch capacity context',src.includes('kapasitas ${b.participant_count}/${b.capacity}')],
 ['lifecycle activate',src.includes("changeEnrollment(e,'ACTIVE')")],
 ['lifecycle complete',src.includes("changeEnrollment(e,'COMPLETED')")],
 ['lifecycle cancel',src.includes("changeEnrollment(e,'CANCELLED')")],
];
for(const [name,pass] of checks){if(!pass)throw new Error(`RC53 contract failed: ${name}`);console.log(`PASS ${name}`)}
console.log(`${checks.length}/${checks.length} PASS`);
