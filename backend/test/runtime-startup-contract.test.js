import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('backend startup enforces runtime config validation', () => {
  const source=fs.readFileSync(new URL('../src/index.js', import.meta.url),'utf8');
  assert.match(source,/validateRuntimeConfig\(process\.env/);
  assert.match(source,/runtime_config_invalid/);
  assert.match(source,/throw new Error\(`Runtime configuration invalid:/);
});
