import assert from 'node:assert/strict';
import { resolveListState, stateCopy, UI_STATES } from './src/ui-state.js';

const cases = [
  [{loading:true,items:[]},'loading'],
  [{forbidden:true,items:[]},'forbidden'],
  [{offline:true,items:[]},'offline'],
  [{error:new Error('x'),items:[]},'error'],
  [{items:[]},'empty'],
  [{items:[1]},'ready'],
];
for (const [input, expected] of cases) assert.equal(resolveListState(input), expected);
for (const state of ['loading','empty','error','forbidden','offline','success','confirm','destructive']) assert.ok(UI_STATES.includes(state));
assert.match(stateCopy('error'),/belum dapat dimuat/i);
console.log('frontend state contracts: 15/15 PASS');
