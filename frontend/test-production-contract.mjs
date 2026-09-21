import assert from 'node:assert/strict';
import { NAV_GROUPS, MOBILE_NAV, ROLE_PAGE_ACCESS, canAccessPage } from './src/navigation.js';
import { PAGE_REGISTRY, missingCorePages } from './src/page-registry.js';
import { UI_STATES } from './src/ui-state.js';
import { isExpired } from './src/auth.js';

const required=['dashboard','tasks','programs','participants','meetings','documents','payments','approvals','announcements','notifications','knowledge','assistant','reports','certificates','profile','settings','ai-settings'];
assert.deepEqual(missingCorePages(required),[]);
assert.equal(Object.keys(ROLE_PAGE_ACCESS).length,6);
for(const [role,nav] of Object.entries(MOBILE_NAV)){ assert.equal(nav.length,5,`${role} mobile nav must have five items`); }
assert.equal(canAccessPage('PESERTA','payments'),true);
assert.equal(canAccessPage('PASTOR','approvals'),true);
assert.ok(UI_STATES.includes('forbidden')&&UI_STATES.includes('offline')&&UI_STATES.includes('destructive'));
assert.equal(isExpired({expiresAt:new Date(Date.now()+5000).toISOString()}),false);
assert.equal(isExpired({expiresAt:new Date(Date.now()-5000).toISOString()}),true);
assert.ok(NAV_GROUPS.length>=6);
assert.ok(PAGE_REGISTRY.dashboard.endpoint==='/dashboard');
console.log('production frontend contract: 9/9 PASS');
