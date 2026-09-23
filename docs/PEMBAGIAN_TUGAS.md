# Pembagian Tugas Pengembang (Task Distribution)
## Aplikasi Expense Tracker

Dokumen ini mengatur pembagian tugas untuk 4 programmer: **Abhi**, **Agil**, **Al**, dan **Daniel** dengan prinsip **Less Dependency** (meminimalkan saling ketergantungan dan mencegah konflik berkas/Git merge conflict).

---

## 1. Prinsip Kerja "Less Dependency"

Agar setiap programmer dapat mulai bekerja secara paralel tanpa saling menunggu (*blocking*):

1. **Isolasi Berkas (*File Ownership Isolation*)**: Setiap programmer memiliki direktori kerja eksklusif masing-masing. Tidak ada dua programmer yang mengedit rute/halaman atau komponen yang sama pada fase pengembangan awal.
2. **Kontrak Interface Sederhana (*Shared Contracts*)**: Fungsi otentikasi menggunakan kontrak sederhana (`getCurrentUser()`). Programmer fitur lain dapat menggunakan *dummy/mock user ID* saat proses pembangunan tanpa perlu menunggu modul otentikasi rampung 100%.
3. **Database Skema Terpusat**: Skema database Prisma ([prisma/schema.prisma](file:///D:/Expense_Tracker/prisma/schema.prisma)) sudah selesai dan termigrasi, sehingga semua programmer langsung memiliki akses ke tipe data yang sama (`User`, `Transaction`, `Session`, `TransactionType`).

---

## 2. Matriks Pembagian Tugas & Tanggung Jawab

| Programmer | Area Spesialisasi | Fokus Fungsional (SRS) | Direktori Kerja Eksklusif |
|---|---|---|---|
| **Abhi** | **Autentikasi, Sesi, & Security Middleware** | FR-01, FR-02, FR-03, FR-04, FR-05, BR-01, BR-05, BR-07, AC-01, AC-02, AC-03, AC-04, AC-10, AC-11 | `app/(auth)/*`<br>`lib/auth/*`<br>`middleware.ts` |
| **Agil** | **Manajemen Transaksi Keuangan (CRUD & Isolasi)** | FR-08, FR-09, FR-10, FR-11, BR-02, BR-03, BR-08, BR-09, AC-06, AC-07 | `app/(app)/transactions/*`<br>`lib/actions/transactions.ts`<br>`components/transactions/*` |
| **Al** | **Dashboard Finansial & Kalkulasi Agregasi Saldo** | FR-06, FR-07, BR-04, AC-05, UC-02 | `app/(app)/dashboard/*`<br>`lib/actions/dashboard.ts`<br>`components/dashboard/*` |
| **Daniel** | **UI Design System, Landing Page, & Cookie Preferences** | FR-12, FR-13, FR-14, BR-06, AC-08, AC-09, Landing Page | `app/page.tsx`<br>`components/ui/*`<br>`components/layout/*`<br>`lib/cookies.ts` |

---

## 3. Rincian Tugas Programmer

### 👨‍💻 Programmer 1: Abhi
**Fokus**: Autentikasi Pengguna, Manajemen Sesi Server, & Proteksi Rute (Middleware)

* **Tugas & Tanggung Jawab**:
  1. Membuat halaman registrasi (`/register`) dan formulir registrasi dengan validasi (nama, format email valid & unik, password min 8 karakter, konfirmasi password cocok).
  2. Mengimplementasikan password hashing (bcrypt / Argon2) sebelum menyimpan ke tabel `users`.
  3. Membuat halaman login (`/login`) dengan verifikasi kredensial.
  4. Membangun manajemen sesi server: membuat record sesi di tabel `sessions`, meregenerasi session token, dan menuliskannya ke `HttpOnly`, `SameSite=Lax`, `Secure` cookie.
  5. Membuat fitur Logout (menghapus record sesi di DB dan membersihkan cookie peramban).
  6. Mengonfigurasi `middleware.ts` Next.js untuk mencegat guest agar tidak bisa membuka `/dashboard` atau `/transactions` (redirect ke `/login`), serta mencegah pengguna login mengakses `/login`/`/register`.
  7. Menyediakan fungsi shared contract: `getCurrentUser(): Promise<{ id: string, name: string, email: string } | null>`.

* **Berkas yang Dimiliki**:
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/register/page.tsx`
  - `lib/auth/session.ts`
  - `lib/auth/password.ts`
  - `lib/auth/get-user.ts` (fungsi `getCurrentUser`)
  - `middleware.ts`

* **Cara Bekerja Independen**:
  - Abhi dapat langsung bekerja menggunakan tabel `users` dan `sessions` yang sudah ada di database.

---

### 👨‍💻 Programmer 2: Agil
**Fokus**: Manajemen Transaksi Keuangan (CRUD, Validasi Input, & Otorisasi Kepemilikan)

* **Tugas & Tanggung Jawab**:
  1. Membuat halaman daftar transaksi pengguna (`/transactions`) dengan urutan kronologis terbalik (terbaru di atas).
  2. Membuat formulir/modal penambahan transaksi baru (judul max 255 karakter, nominal desimal > 0, tipe `income`/`expense`, tanggal valid `YYYY-MM-DD`, catatan opsional).
  3. Membuat fitur edit transaksi dan hapus transaksi (*hard delete*).
  4. Mengimplementasikan proteksi otorisasi mutasi: memastikan setiap transaksi terikat pada `user_id` aktif dan melempar respon HTTP 403 Forbidden bila pengguna mencoba mengubah/menghapus transaksi milik pengguna lain.
  5. Menghubungkan mutasi transaksi via Server Actions dengan sanitasi query Prisma.

* **Berkas yang Dimiliki**:
  - `app/(app)/transactions/page.tsx`
  - `components/transactions/TransactionFormModal.tsx`
  - `components/transactions/TransactionTable.tsx`
  - `components/transactions/TransactionItem.tsx`
  - `components/transactions/DeleteTransactionDialog.tsx`
  - `lib/actions/transactions.ts`

* **Cara Bekerja Independen (Tanpa Tunggu Abhi)**:
  - Sebelum modul auth Abhi selesai, Agil dapat membuat *helper mock* di `lib/actions/transactions.ts`:
    ```typescript
    // Gunakan fungsi import getCurrentUser, dengan fallback dummy user untuk testing lokal:
    import { getCurrentUser } from '@/lib/auth/get-user';
    
    // Agil bisa memakai seed user id tetap di database saat dev
    ```

---

### 👨‍💻 Programmer 3: Al
**Fokus**: Dashboard Keuangan, Kalkulasi Real-Time, & Indikator Saldo

* **Tugas & Tanggung Jawab**:
  1. Membuat halaman dashboard (`/dashboard`) yang menyajikan:
     - Salam sapaan nama pengguna yang sedang aktif.
     - Kartu Ringkasan: **Saldo Saat Ini**, **Total Pemasukan**, **Total Pengeluaran**.
     - Indikator visual bila saldo bernilai negatif/defisit (*hedon/warning alert*).
     - Widget Tabel/List: Daftar beberapa transaksi terbaru (*Recent Transactions*).
  2. Membangun query kalkulasi agregasi di server:
     - `SUM(amount)` untuk transaksi bertipe `income`.
     - `SUM(amount)` untuk transaksi bertipe `expense`.
     - `Saldo = Total Pemasukan - Total Pengeluaran`.
  3. Memastikan performa query membaca indeks komposit `(user_id, transaction_date DESC)` yang telah dibuat di basis data.

* **Berkas yang Dimiliki**:
  - `app/(app)/dashboard/page.tsx`
  - `components/dashboard/BalanceCard.tsx`
  - `components/dashboard/SummaryCards.tsx`
  - `components/dashboard/RecentTransactions.tsx`
  - `components/dashboard/DeficitAlert.tsx`
  - `lib/actions/dashboard.ts`

* **Cara Bekerja Independen (Tanpa Tunggu Agil/Abhi)**:
  - Al hanya menjalankan query *read-only* dari tabel `transactions` dan `users`.
  - Al dapat mengisikan beberapa baris dummy ke tabel `transactions` melalui Prisma Studio (`npx prisma studio`) untuk menguji variasi saldo (positif, nol, negatif/defisit) dan daftar transaksi terbaru.

---

### 👨‍💻 Programmer 4: Daniel
**Fokus**: UI Design System, Public Landing Page, & Persistensi Preferensi Cookie

* **Tugas & Tanggung Jawab**:
  1. Membangun fondasi UI components (reusable components) dengan Tailwind CSS: Button, Input, Modal, Badge, Card, Select/Dropdown, EmptyState.
  2. Membuat tata letak aplikasi umum (*App Shell*): Navbar terproteksi (logo, navigasi dashboard/transaksi, profil pengguna, tombol logout).
  3. Membangun halaman publik Landing Page (`app/page.tsx`) untuk Guest dengan ringkasan fitur aplikasi dan tombol CTA menuju Login/Register.
  4. Mengimplementasikan modul utilitas **Cookie Preferensi** (`lib/cookies.ts`):
     - Membaca dan menulis cookie peramban untuk preferensi pengguna (misal: filter jenis transaksi terakhir `pref_filter_type`: `'all' | 'income' | 'expense'`).
     - Menyediakan sanitasi server-side: jika nilai cookie dirusak/tidak valid, kembali ke default secara otomatis (*graceful fallback*).
  5. Membuat komponen Bar Filter Transaksi (*Filter Tabs/Buttons*) yang terhubung dengan pembacaan cookie tersebut.

* **Berkas yang Dimiliki**:
  - `app/page.tsx` (Public Landing Page)
  - `components/ui/Button.tsx`, `components/ui/Input.tsx`, `components/ui/Modal.tsx`, `components/ui/Card.tsx`, `components/ui/Badge.tsx`
  - `components/layout/Navbar.tsx`
  - `components/layout/AppLayout.tsx`
  - `components/common/FilterTabs.tsx`
  - `lib/cookies.ts`

* **Cara Bekerja Independen**:
  - Daniel bekerja murni di sisi antarmuka (UI/UX) dan modul cookie murni. Tidak bergantung pada data transaksi spesifik atau sistem login backend.

---

## 4. Standar Kontrak Antar-Programmer (Mock Contracts)

Agar tidak terjadi *mismatch* saat integrasi, gunakan kontrak berikut:

### Kontrak Auth (`lib/auth/get-user.ts`)
```typescript
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// Selama masa pengembangan lokal belum rampung:
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Abhi akan mengganti ini dengan pengecekan sesi DB + cookies aktual
  // Agil & Al dapat mengembalikan mock user sementara jika Abhi belum selesai
  return null;
}
```

### Kontrak Cookie Filter (`lib/cookies.ts`)
```typescript
export type FilterPreference = 'all' | 'income' | 'expense';

export const FILTER_COOKIE_NAME = 'pref_filter_type';
export const DEFAULT_FILTER: FilterPreference = 'all';

export function parseFilterCookie(value: string | undefined): FilterPreference {
  if (value === 'income' || value === 'expense' || value === 'all') {
    return value;
  }
  return DEFAULT_FILTER; // Graceful fallback jika cookie tidak valid
}
```

---

## 5. Rencana Integrasi & Pengujian Bersama

Setelah masing-masing programmer menyelesaikan modulnya di branch masing-masing:

1. **Integrasi 1 (Abhi + Daniel)**: Pasang `Navbar` buatan Daniel dengan tombol Logout dan info nama pengguna dari `lib/auth/get-user.ts` buatan Abhi.
2. **Integrasi 2 (Agil + Daniel)**: Hubungkan komponen `FilterTabs` buatan Daniel ke tabel transaksi buatan Agil dengan membaca nilai `pref_filter_type` dari cookie.
3. **Integrasi 3 (Semua Programmer)**:
   - Jalankan skenario Acceptance Criteria AC-01 s/d AC-11.
   - Uji isolasi data (User A tidak bisa melihat atau mengedit data User B).
   - Uji alur Logout dan proteksi Middleware (Guest diarahkan ke login).
