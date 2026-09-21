import fs from 'node:fs';
const src=fs.readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8');
const checks=[['NotificationsInbox',src.includes('function NotificationsInbox')],['single read',src.includes('/notifications/${id}/read')],['read all',src.includes('/notifications/read-all')],['unread counter',src.includes('notifikasi belum dibaca')],['IN_APP scope',src.includes("item.channel==='IN_APP'")],['generic exclusion',src.includes("'announcements','notifications','settings'")]];
for(const [n,ok] of checks){if(!ok){console.error('FAIL',n);process.exit(1)}}console.log('RC57 notification lifecycle contract: 6/6 PASS');
