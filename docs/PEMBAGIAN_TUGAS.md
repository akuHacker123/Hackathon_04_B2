# Pembagian Tugas Expense Tracker

Tim implementasi terdiri dari **Abhi, Agil, Daniel, dan Galang**; **AL adalah PM**. Pembagian memakai kepemilikan berkas yang tegas agar fitur dapat dikerjakan paralel. Galang mengambil alih dashboard dan anggaran. AL secara khusus memegang schema, migration, dan seeder agar kontrak database hanya memiliki satu pemilik.

## Pembagian kepemilikan

| Anggota | Tanggung jawab | Berkas milik utama |
|---|---|---|
| **Abhi** | Autentikasi, sesi, dan proteksi rute. Hapus fallback akun mock agar identitas diambil dari sesi nyata. Jangan mengubah schema, migration, atau seeder milik AL. | `app/(auth)/*`, `lib/auth/*`, `middleware.ts` |
| **Agil** | CRUD transaksi per pemilik dan filter Semua/Pemasukan/Pengeluaran yang bekerja tanpa reload penuh. Pertahankan validasi dan otorisasi pada semua aksi transaksi. | `app/(app)/transactions/*`, `components/transactions/*`, `lib/actions/transactions.ts` |
| **Daniel** | Design system, landing page, shell navigasi, dan preferensi cookie filter. Terapkan palet monokrom hitam putih serta hapus kode requirement dari teks antarmuka yang ia miliki. Sediakan komponen UI yang sudah ada untuk dipakai anggota lain tanpa mengubah berkas milik mereka. | `app/page.tsx`, `components/ui/*`, `components/layout/*`, `components/common/FilterTabs.tsx`, `lib/cookies.ts` |
| **Galang** | Dashboard saldo/transaksi terbaru dan fitur anggaran sebagai satu alur: pemilih bulan, set/perbarui anggaran, total anggaran, pengeluaran bulan itu, sisa, indikator penggunaan, dan alert saat terlampaui. Gunakan request asinkron agar filter bulan dan simpan anggaran memperbarui tampilan tanpa reload penuh. | `app/(app)/dashboard/*`, `components/dashboard/*`, `lib/actions/dashboard.ts`, `lib/actions/budget.ts` |
| **AL (PM)** | Pemilik tunggal schema, migration, dan seeder; menetapkan baseline database untuk tim. Selain pekerjaan database tersebut, koordinasi prioritas, komunikasi kontrak, review hasil, dan penerimaan. Tidak mengerjakan fitur aplikasi lain. | `prisma/schema.prisma`, `prisma/migrations/*`, konfigurasi seeder |

## Kontrak agar pekerjaan paralel

1. **AL membuat schema/migration/seeder sebagai fondasi database dan satu-satunya yang mengubah berkas Prisma.** Setelah baseline dipush ke origin, anggota lain pull perubahan tersebut sebelum integrasi. Anggota lain tidak mengedit `prisma/schema.prisma`, `prisma/migrations/*`, atau konfigurasi seeder; usulan perubahan diajukan ke AL untuk dikerjakan secara terpusat. Anggota lain boleh mengerjakan UI dan validasi lokal memakai kontrak di bawah.
2. **Spesifikasi tabel `monthly_budgets`** (nama fisik PostgreSQL): `id UUID PRIMARY KEY`; `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`; `month DATE NOT NULL` selalu tanggal pertama bulan (`YYYY-MM-01`); `amount DECIMAL(15,2) NOT NULL CHECK (amount > 0)`; `created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`; `updated_at TIMESTAMP(3) NOT NULL`. Tambahkan `UNIQUE(user_id, month)`. Prisma model bernama `MonthlyBudget`, field camelCase dipetakan ke snake_case (`userId @map("user_id")`, dst.), tabel `@@map("monthly_budgets")`.
3. **Migrasi hanya additive:** AL membuat migrasi baru yang hanya menambah tabel/indeks/constraint anggaran. Dilarang `DROP`, `TRUNCATE`, reset database, menghapus/mengganti tabel atau kolom lama, dan mengedit migrasi yang sudah diterapkan. Sebelum menerapkan, cek status migrasi dan target `DATABASE_URL`; jangan menjalankan seeder ke production.
4. **Seeder tidak menimpa data:** AL menggunakan fixture dengan identitas stabil khusus development; insert-if-absent/`skipDuplicates`, tanpa update/upsert yang menulis ulang akun atau transaksi yang sudah ada. Jika ID/email fixture bertabrakan dengan data berbeda, hentikan dengan error yang jelas dan jangan ubah data. Jalankan fixture dalam transaksi; jangan menghapus data untuk mengulang seed.
5. Identitas dibaca dari sesi di server. Query dan mutasi transaksi/anggaran selalu membatasi `userId` dari sesi. Jangan menerima `userId` sebagai otorisasi dari input klien.
6. **Batas berkas:** Abhi tidak mengubah `prisma/*`; Agil tidak mengubah `lib/actions/budget.ts` atau dashboard; Galang tidak mengubah halaman/aksi transaksi; Daniel tidak mengubah halaman fitur milik Agil/Galang. Jika butuh perubahan kontrak bersama, ajukan ke pemilik berkas dan sepakati sebelum perubahan. AL hanya mengubah schema, migration, dan seeder; tidak mengerjakan source code fitur.
7. Kontrak aksi Galang: `getMonthlyBudget(month)` mengembalikan nominal anggaran (atau `null`), total pengeluaran, sisa, dan persentase; `saveMonthlyBudget(month, amount)` menyimpan berdasarkan pengguna aktif dan bulan. Pengeluaran dihitung dari transaksi bertipe `expense` pada bulan kalender tersebut. `income` tidak dihitung. Sisa dapat negatif, persentase dapat melebihi 100%, dan alert bersifat informatif: transaksi tetap diizinkan.
8. Agil menjaga daftar transaksi responsif lewat Server Actions; filter harus benar-benar mengubah daftar tanpa muat ulang penuh dan preferensinya tetap disimpan di cookie. Perubahan transaksi terlihat saat dashboard dimuat atau diperbarui kembali.
9. Daniel menyediakan komponen dan pola monokrom hitam putih yang stabil. Anggota lain menerapkannya hanya di berkas masing-masing; seluruh teks UI memakai label untuk pengguna, tanpa `BR-`, `FR-`, `UC-`, atau `AC-`.

## Peta route dan pemilik

| Route | Fungsi | Pemilik route/halaman | Autentikasi dan sumber data |
|---|---|---|---|
| `/` | Landing page | Daniel | Publik; tautan login/registrasi mengarah ke route yang sudah ada. |
| `/login`, `/register` | Masuk dan daftar | Abhi | Publik untuk guest; pengguna yang sudah login diarahkan ke dashboard. |
| `/dashboard` | Saldo, transaksi terbaru, anggaran bulan terpilih | Galang | Wajib sesi; query selalu memakai ID pengguna dari sesi. |
| `/transactions` | Daftar, filter, tambah transaksi | Agil | Wajib sesi; route dan aksi hanya mengakses transaksi pengguna aktif. |
| `/transactions/[id]/edit` | Edit transaksi | Agil | Wajib sesi; cek pemilik di server, pengguna lain tidak boleh melihat/mengubah data. |
| API internal yang sudah ada | Mis. `/api/csrf` | Abhi | Pertahankan endpoint yang ada; jangan buat route kedua untuk fungsi sama. |

Gunakan App Router yang sudah ada, jangan menambah alias route atau membuat salinan halaman. Link navbar milik Daniel harus menunjuk tepat ke `/dashboard` dan `/transactions`; form auth tetap ke `/login` dan `/register`. Jangan ubah `middleware.ts` kecuali Abhi. Setiap Server Action tetap memeriksa sesi dan otorisasi karena proteksi UI/middleware saja tidak cukup. Jika satu route membutuhkan aksi anggota lain, gunakan kontrak Server Action yang disepakati; jangan memindahkan kepemilikan halaman.

## Urutan integrasi

1. AL menyiapkan dan mem-push baseline schema, migration, dan seeder; anggota lain menarik baseline yang sama. Perubahan schema lanjutan tetap lewat AL.
2. Daniel menyelesaikan komponen bersama; Agil menyelesaikan transaksi/filter; Galang menyelesaikan dashboard/anggaran secara paralel pada berkas masing-masing.
3. AL menjalankan/memeriksa migrasi dan seeder pada database development. Galang dan Agil menghubungkan aksi mereka ke schema, lalu masing-masing memeriksa isolasi pemilik.
4. AL sebagai PM memeriksa hasil gabungan: seeder, akses dua akun, filter/AJAX, kalkulasi bulanan, alert, route/link, dan konsistensi tampilan monokrom.

## Kondisi repo saat pembagian ini dibuat

| Area | Kondisi teramati | Pemilik tindak lanjut |
|---|---|---|
| Database anggaran | Model, migrasi, dan seeder anggaran belum tersedia. | AL; berkas Prisma dilindungi dari edit anggota lain |
| CRUD transaksi | Sudah memanggil Server Actions dan menyegarkan daftar tanpa reload penuh. Filter belum terpasang pada halaman transaksi. | Agil |
| Dashboard | Kalkulasi saldo sudah ada di server; anggaran dan pilihan bulan belum tersedia. | Galang |
| Identitas development | `getCurrentUser()` masih mengembalikan akun mock di development, sehingga uji isolasi pengguna belum mewakili sesi nyata. | Abhi |
| Tampilan | Laman awal memakai aksen hijau; masih ada kode `BR-` yang terlihat dan tombol transaksi berwarna biru. | Daniel untuk laman awal/shared UI; Agil dan Galang untuk berkas fitur masing-masing |

## Kriteria penerimaan

- Seeder pengembangan dapat dijalankan ulang dengan aman dan menghasilkan kasus uji untuk dua pengguna serta beberapa status anggaran.
- Pengguna tidak bisa membaca atau mengubah transaksi maupun anggaran pengguna lain, termasuk dengan request langsung.
- Filter transaksi dan pemilih/simpan anggaran memperbarui tampilan tanpa reload penuh.
- Untuk bulan terpilih, anggaran, pengeluaran, sisa, dan persentase cocok dengan transaksi pengeluaran milik pengguna. Pengeluaran di atas anggaran memunculkan alert.
- Route dashboard, transaksi, auth, dan link navigasi menuju halaman yang benar tanpa route duplikat; akses terlindungi tetap memeriksa sesi.
- Halaman awal, transaksi, dan dashboard memakai palet monokrom hitam putih yang konsisten; tidak ada kode requirement pada UI.
