import { execFileSync } from 'node:child_process';

const expectedTotal = Number(process.env.RC77_EXPECTED_FILE_COUNT || 730);
const expectedMin = {
  backend: 133,
  frontend: 80,
  database: 117,
  docs: 289,
  scripts: 43,
  deployment: 6,
};

const output = execFileSync('git',['ls-files'],{encoding:'utf8'});
const files = output.split(/\r?\n/).filter(Boolean);
const countPrefix = (prefix) => files.filter((file)=>file.startsWith(prefix + '/')).length;
const actual = {
  total: files.length,
  backend: countPrefix('backend'),
  frontend: countPrefix('frontend'),
  database: countPrefix('database'),
  docs: countPrefix('docs'),
  scripts: countPrefix('scripts'),
  deployment: countPrefix('deployment'),
};

const failures = [];
if (actual.total < expectedTotal) failures.push(`TOTAL_FILES_${actual.total}_LT_${expectedTotal}`);
for (const [area,minimum] of Object.entries(expectedMin)) {
  if (actual[area] < minimum) failures.push(`${area.toUpperCase()}_${actual[area]}_LT_${minimum}`);
}

const result = {
  gate:'rc77-source-completeness',
  baseline:'v1.0.0-rc77-WIP',
  expected:{total:expectedTotal,...expectedMin},
  actual,
  status:failures.length ? 'BLOCKED_INCOMPLETE_IMPORT' : 'PASS',
  failures,
};

console.log(JSON.stringify(result,null,2));
process.exit(failures.length ? 2 : 0);
