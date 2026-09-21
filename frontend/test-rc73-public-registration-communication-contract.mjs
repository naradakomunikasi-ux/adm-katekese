import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('./src/App.jsx',import.meta.url),'utf8'),css=readFileSync(new URL('./src/styles.css',import.meta.url),'utf8');
for(const token of ['PublicRegistration','Daftar Program Katekese','/public/programs','/public/registrations','Kirim Pendaftaran','belum otomatis membuat akun atau enrollment aktif','consentCheck','/communications','recipient mapping','delivery_status'])assert.ok(app.includes(token),`missing ${token}`);
for(const token of ['.publicRegistrationPage','.publicRegistrationIntro','.publicRegistrationForm','.consentCheck'])assert.ok(css.includes(token),`missing ${token}`);
console.log('RC73 public registration + participant communication contract: 14/14 PASS');

