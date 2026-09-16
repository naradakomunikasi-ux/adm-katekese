export const NAV_GROUPS = [
  ['Utama',[['dashboard','Dashboard'],['tasks','Tugas Saya']]],
  ['Pelayanan',[['programs','Program & Batch'],['registrations','Pendaftaran Masuk'],['participants','Peserta'],['meetings','Pertemuan & Kehadiran']]],
  ['Administrasi',[['documents','Dokumen'],['payments','Pembayaran'],['approvals','Persetujuan Pastoral'],['certificates','Sertifikat']]],
  ['Komunikasi & Pengetahuan',[['announcements','Pengumuman'],['notifications','Pesan & Reminder'],['library','Perpustakaan Digital'],['assistant','Ask Miyu']]],
  ['Analisis',[['reports','Laporan']]],
  ['Pengaturan',[['settings','Pengaturan']]],
];

export const ROLE_PAGE_ACCESS = {
  SUPER_ADMIN: ['*'],
  ADMIN_KATEKESE: ['dashboard','tasks','programs','batches','registrations','participants','participant-360','meetings','attendance','documents','payments','approvals','certificates','announcements','notifications','whatsapp','library','knowledge','assistant','reports','profile','settings','ai-settings'],
  ADMIN_PROGRAM: ['dashboard','tasks','programs','batches','participants','participant-360','meetings','attendance','documents','announcements','notifications','library','knowledge','assistant','profile','settings'],
  KATEKIS: ['dashboard','tasks','participants','participant-360','meetings','attendance','certificates','announcements','notifications','library','knowledge','assistant','profile'],
  PASTOR: ['dashboard','participants','participant-360','meetings','approvals','certificates','announcements','notifications','library','knowledge','assistant','reports','profile'],
  PESERTA: ['dashboard','programs','meetings','documents','payments','certificates','announcements','notifications','library','assistant','profile'],
};

export const MOBILE_NAV = {
  SUPER_ADMIN: [['dashboard','Dashboard'],['programs','Program'],['participants','Peserta'],['notifications','Pesan'],['more','Menu']],
  ADMIN_KATEKESE: [['dashboard','Dashboard'],['programs','Program'],['participants','Peserta'],['notifications','Pesan'],['more','Menu']],
  ADMIN_PROGRAM: [['dashboard','Beranda'],['programs','Program'],['participants','Peserta'],['meetings','Jadwal'],['more','Lainnya']],
  KATEKIS: [['dashboard','Beranda'],['meetings','Jadwal'],['attendance','Kehadiran'],['participants','Peserta'],['more','Lainnya']],
  PASTOR: [['dashboard','Beranda'],['approvals','Persetujuan'],['meetings','Jadwal'],['participants','Peserta'],['more','Lainnya']],
  PESERTA: [['dashboard','Beranda'],['programs','Program'],['meetings','Jadwal'],['documents','Dokumen'],['more','Lainnya']],
};

export function canAccessPage(role,page){ const allow=ROLE_PAGE_ACCESS[role]||[]; return allow.includes('*')||allow.includes(page); }
