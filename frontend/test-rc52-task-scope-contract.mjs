import fs from 'node:fs';
const app=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('./src/navigation.js',import.meta.url),'utf8');
const checks=[
 ['task navigation visible',nav.includes("['tasks','Tugas Saya']")],
 ['specialized task manager exists',app.includes('function TaskManager({api,data,role,reload})')],
 ['assignee candidates endpoint',app.includes("api.get('/tasks/assignees')")],
 ['task create endpoint',app.includes("api.post('/tasks'")],
 ['task complete endpoint',app.includes('`/tasks/${id}/complete`')],
 ['assigned-only explanatory copy',app.includes('Hanya tugas yang ditugaskan langsung kepada akun Anda yang ditampilkan.')],
];
for(const [name,pass] of checks){if(!pass)throw new Error(`FAIL ${name}`);console.log(`PASS ${name}`)}
console.log(`RC52 task scope frontend contract: ${checks.length}/${checks.length} PASS`);
