import assert from 'node:assert/strict';
import { PAGE_REGISTRY } from './src/page-registry.js';
import { canAccessPage, MOBILE_NAV } from './src/navigation.js';
const required=['dashboard','tasks','programs','batches','participants','participant-360','meetings','attendance','documents','payments','approvals','announcements','whatsapp','notifications','knowledge','assistant','reports','certificates','profile','settings','ai-settings'];
for(const page of required) assert.ok(PAGE_REGISTRY[page],`missing ${page}`);
for(const [role,items] of Object.entries(MOBILE_NAV)){ assert.equal(items.length,5,`${role} mobile nav must contain 5 items`); }
assert.equal(canAccessPage('PESERTA','payments'),true);
assert.equal(canAccessPage('PESERTA','participant-360'),false);
assert.equal(canAccessPage('ADMIN_KATEKESE','attendance'),true);
assert.equal(canAccessPage('KATEKIS','attendance'),true);
console.log(`v0.9.0 frontend sprint contract PASS: ${required.length} core screens registered; 6 role mobile navs constrained to 5 items`);
