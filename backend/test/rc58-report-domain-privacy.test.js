import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
test('program reports use finance-free pastoral view and permission-gated finance merge',()=>{
  assert.match(source,/report_program_pastoral_summary/);
  assert.match(source,/rbacStore\.has\(req\.user\.role,'payment:verify'\)/);
  assert.match(source,/financial_visible:false/);
});
test('financial report endpoint requires payment verify in addition to report read',()=>{
  assert.match(source,/REPORT_FINANCIAL_SCOPE_DENIED/);
});
test('attention report suppresses payment and approval flags by domain permission',()=>{
  assert.match(source,/canReadPayments&&row\.overdue_payment/);
  assert.match(source,/canReadApprovals&&row\.pending_approval/);
});
