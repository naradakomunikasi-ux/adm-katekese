import test from 'node:test';
import assert from 'node:assert/strict';
import { withTransaction } from '../src/transaction.js';

function fakePool(log) {
  return { connect: async () => ({
    query: async (sql) => { log.push(sql); return { rows: [] }; },
    release: () => log.push('RELEASE')
  }) };
}

test('transaction commits successful work and releases client', async()=>{
  const log=[]; const result=await withTransaction(fakePool(log),async(client)=>{await client.query('SELECT 1');return 'ok';});
  assert.equal(result,'ok');
  assert.deepEqual(log,['BEGIN','SELECT 1','COMMIT','RELEASE']);
});

test('transaction rolls back failed work and releases client', async()=>{
  const log=[];
  await assert.rejects(()=>withTransaction(fakePool(log),async()=>{throw new Error('boom');}),/boom/);
  assert.deepEqual(log,['BEGIN','ROLLBACK','RELEASE']);
});
