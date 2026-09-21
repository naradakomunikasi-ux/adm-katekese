import test from 'node:test'; import assert from 'node:assert/strict';
import {reciprocalRank,recallAtK,citationCoverage,evaluateRetrieval} from '../src/rag-evaluation.js';
test('reciprocal rank',()=>assert.equal(reciprocalRank(['x','b'],['b']),0.5));
test('recall at k',()=>assert.equal(recallAtK(['a','b'],['a','c'],2),0.5));
test('citation coverage grounded',()=>assert.equal(citationCoverage({grounded:true,evidence:[{id:'1'},{id:'2'}],citations:['1','2']}),1));
test('evaluation passes when each case retrieves relevant',()=>{const r=evaluateRetrieval([{id:'1',rankedIds:['a','x'],relevantIds:['a']},{id:'2',rankedIds:['x','b'],relevantIds:['b']}]); assert.equal(r.passed,true); assert.ok(r.mrr>=0.75);});
