INSERT INTO participants (full_name, program_name, status, progress_percent, attendance_percent)
VALUES
 ('Andreas Wijaya','Baptis Dewasa','ACTIVE',72,91),
 ('Clara Santoso','Komuni Pertama','ACTIVE',84,95),
 ('Daniel Hartono','Krisma','ACTIVE',65,88)
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, priority, status, due_at)
VALUES
 ('Verifikasi dokumen peserta baru','P0','OPEN',now() + interval '1 day'),
 ('Tinjau pembayaran masuk','P1','OPEN',now() + interval '2 days'),
 ('Kirim reminder pertemuan','P1','OPEN',now() + interval '3 days');
