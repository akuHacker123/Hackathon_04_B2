# Expense Tracker

Aplikasi pencatatan pemasukan, pengeluaran, dan anggaran bulanan. Dibangun dengan Next.js, Prisma, dan PostgreSQL.

## Menjalankan di komputer lokal

### Prasyarat

- Node.js yang kompatibel dengan versi Next.js di proyek ini.
- PostgreSQL yang aktif.
- Database PostgreSQL kosong untuk proyek ini, misalnya `expense_tracker`.

### 1. Pasang dependency

Buka PowerShell di folder proyek:

```powershell
cd "Hackathon_04_B2"
npm ci
```

### 2. Atur koneksi database

Salin template environment:

```powershell
Copy-Item .env.example .env
```

Edit `.env` dan isi `DATABASE_URL` sesuai konfigurasi PostgreSQL lokal. Contoh:

```env
DATABASE_URL="postgresql://postgres:password_kamu@localhost:5432/expense_tracker?schema=public"
```

Pastikan PostgreSQL aktif dan database `expense_tracker` sudah dibuat.

### 3. Jalankan semua migration

```powershell
npx prisma migrate deploy
npx prisma migrate status
```

Pastikan status menunjukkan semua migration sudah diterapkan. Repo memiliki tiga migration. Jalankan pertama kali pada database kosong khusus proyek ini; migration kedua mengganti tabel `User` awal dengan skema aplikasi.

### 4. Generate Prisma Client

```powershell
npx prisma generate
```

### 5. (Opsional) Tambahkan data demo

Seed hanya tersedia untuk development dan perlu diaktifkan secara eksplisit:

```powershell
$env:ALLOW_DEMO_SEED = "true"
npx prisma db seed
Remove-Item Env:ALLOW_DEMO_SEED
```

Akun demo:

- `expense.demo.a@example.invalid`
- `expense.demo.b@example.invalid`
- Password keduanya: `ExpenseDemo!2026`

### 6. Jalankan aplikasi

```powershell
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Biarkan terminal tetap berjalan selama aplikasi digunakan. Hentikan server dengan `Ctrl+C`.

## Catatan database

- Jangan gunakan `npx prisma migrate reset` pada database yang berisi data karena perintah tersebut menghapus data.
- Jika koneksi gagal, pastikan PostgreSQL aktif dan host, port, nama database, username, serta password pada `.env` benar.
