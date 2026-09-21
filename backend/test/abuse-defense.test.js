import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyInputRisk, safeRedirectTarget } from '../src/abuse-defense.js';

test('flags common injection and XSS payloads', () => {
  for (const payload of ["' OR '1'='1", '<script>alert(1)</script>', 'UNION SELECT password FROM users', '../../etc/passwd']) {
    assert.equal(classifyInputRisk(payload).suspicious, true, payload);
  }
});

test('normal pastoral text is not classified suspicious', () => {
  assert.equal(classifyInputRisk('Mohon verifikasi dokumen Baptis Dewasa').suspicious, false);
});

test('redirect target rejects external and CRLF values', () => {
  assert.equal(safeRedirectTarget('https://evil.example'), '/');
  assert.equal(safeRedirectTarget('//evil.example'), '/');
  assert.equal(safeRedirectTarget('/dashboard\r\nX-Test: 1'), '/');
  assert.equal(safeRedirectTarget('/dashboard'), '/dashboard');
});
