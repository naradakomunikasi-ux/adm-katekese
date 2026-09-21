import {evaluateRetrieval} from '../backend/src/rag-evaluation.js';
const cases=[
{id:'baptis',rankedIds:['baptis-syarat','jadwal','umum'],relevantIds:['baptis-syarat']},
{id:'komuni',rankedIds:['umum','komuni-syarat','jadwal'],relevantIds:['komuni-syarat']},
{id:'krisma',rankedIds:['krisma-syarat','umum'],relevantIds:['krisma-syarat']}
];
const r=evaluateRetrieval(cases); const pass=r.recallAtK>=1 && r.mrr>=0.8; console.log(JSON.stringify({...r,thresholds:{recallAtK:1,mrr:0.8},status:pass?'PASS':'FAIL'},null,2)); process.exit(pass?0:1);
