# Software Requirements Specification (SRS)
# Aplikasi Expense Tracker

## 1. Tujuan dan Ruang Lingkup

**Expense Tracker** adalah aplikasi web manajemen keuangan pribadi yang dirancang untuk membantu individu—termasuk pengguna dengan perputaran dana tinggi atau gaya hidup konsumtif/hedon—agar dapat melacak pemasukan dan pengeluaran secara terstruktur, sederhana, dan disiplin.

Sistem mencakup:
* Pendaftaran akun pengguna (*register*), autentikasi (*login* & *logout*), dan pengelolaan sesi (*session-based authentication*).
* Proteksi rute/halaman dan pembatasan hak akses berbasis kepemilikan data (*authorization isolation*).
* Dashboard ringkasan kondisi keuangan pengguna (saldo saat ini, total pemasukan, total pengeluaran, dan daftar transaksi terbaru).
* Manajemen transaksi keuangan lengkap (operasi CRUD: tambah, lihat, ubah, dan hapus) dengan klasifikasi pemasukan (*income*) dan pengeluaran (*expense*).
* Fitur penyaringan (*filtering*) daftar transaksi berdasarkan jenis transaksi.
* Anggaran bulanan per pengguna, beserta total anggaran, pengeluaran bulan terpilih, sisa anggaran, indikator penggunaan, dan peringatan saat terlampaui.
* Pembaruan daftar/filter transaksi dan pengaturan anggaran tanpa memuat ulang halaman melalui request asinkron (AJAX/Server Actions).
* Penggunaan **cookies** untuk menyimpan preferensi pengguna di sisi peramban (misalnya filter transaksi terakhir atau preferensi tampilan).

**Batasan Luar Lingkup (Out of Scope):**  
Sistem tidak mencakup integrasi *open banking* / mutasi bank otomatis, integrasi *payment gateway*, konversi multi-mata uang (*multi-currency*), pemblokiran transaksi saat anggaran terlampaui, manajemen utang-piutang lanjutan, ekspor/impor berkas (PDF/Excel), serta audit log lanjutan.

---

## 2. Aktor dan Hak Utama

| Aktor | Hak |
|---|---|
| **Guest** | Mengakses halaman publik (landing page), melakukan registrasi akun baru, dan melakukan login ke dalam sistem. Tidak memiliki akses ke data keuangan atau halaman internal. |
| **Pengguna Terautentikasi (User)** | Mengakses dashboard pribadi, mengelola transaksi dan anggaran bulanan miliknya sendiri, memfilter transaksi, mengatur preferensi via cookie, dan melakukan logout. Tidak dapat melihat atau mengelola data milik pengguna lain. |

---

## 3. Requirement Fungsional

| ID | Requirement |
|---|---|
| **FR-01** | Guest dapat mendaftarkan akun baru dengan menginput nama, email, password, dan konfirmasi password. |
| **FR-02** | Pengguna terdaftar dapat login menggunakan email dan password yang valid. |
| **FR-03** | Sistem harus membentuk sesi autentikasi (*session*) yang aman setelah login berhasil dan meregenerasi Session ID untuk mencegah *session fixation*. |
| **FR-04** | Pengguna dapat melakukan logout yang mengakhiri sesi pengguna di server dan menghapus sesi di peramban. |
| **FR-05** | Sistem wajib memblokir akses pengguna yang belum terautentikasi (Guest) dari halaman terproteksi (Dashboard, Manajemen Transaksi) dan mengarahkannya ke halaman login. |
| **FR-06** | Dashboard menampilkan informasi utama keuangan pengguna: Nama pengguna yang sedang login, Saldo Saat Ini (*Current Balance*), Total Pemasukan (*Total Income*), Total Pengeluaran (*Total Expense*), dan daftar transaksi terbaru. |
| **FR-07** | Saldo saat ini dihitung secara dinamis dan real-time dari: `Total Pemasukan - Total Pengeluaran` milik pengguna yang sedang login. |
| **FR-08** | Pengguna dapat menambahkan transaksi baru dengan memasukkan: judul/keterangan transaksi, nominal (jumlah uang), tipe transaksi (`income` / `expense`), tanggal transaksi, dan catatan opsional. |
| **FR-09** | Pengguna dapat melihat daftar seluruh transaksi miliknya dengan urutan kronologis terbalik (transaksi terbaru di atas). |
| **FR-10** | Pengguna dapat melihat detail, mengubah (*update*), dan menghapus (*delete*) data transaksi yang berelasi dengan akun miliknya. |
| **FR-11** | Sistem menolak setiap upaya akses, modifikasi, atau penghapusan transaksi milik pengguna lain dengan memunculkan respon HTTP 403 Forbidden. |
| **FR-12** | Pengguna dapat memfilter daftar transaksi berdasarkan jenis: Semua (*All*), Pemasukan (*Income*), atau Pengeluaran (*Expense*). |
| **FR-13** | Sistem menggunakan **cookies** pada peramban pengguna untuk menyimpan minimal satu preferensi pengguna (misalnya: filter transaksi terakhir yang dipilih atau preferensi tema antarmuka). |
| **FR-14** | Saat pengguna membuka kembali halaman transaksi, sistem membaca nilai preferensi dari cookie untuk menerapkan filter secara otomatis. |
| **FR-15** | Seluruh skema database dapat dibangun ulang melalui *migration* otomatis tanpa manipulasi tabel manual. |
| **FR-16** | Pengguna dapat menetapkan atau memperbarui satu nominal anggaran positif untuk setiap bulan kalender (`YYYY-MM`). Bulan yang belum diatur ditampilkan sebagai belum memiliki anggaran. |
| **FR-17** | Pengguna dapat memilih bulan dan melihat anggaran, total transaksi pengeluaran pada bulan tersebut, sisa anggaran, serta persentase penggunaannya. Dashboard juga menampilkan ringkasan anggaran bulan terpilih. |
| **FR-18** | Sistem menampilkan indikator penggunaan anggaran dan peringatan ketika pengeluaran bulan terpilih melampaui anggaran. Peringatan hanya informatif; transaksi tetap dapat dicatat. |
| **FR-19** | Filter daftar transaksi dan penyimpanan anggaran memperbarui tampilan tanpa reload penuh. Preferensi filter tetap tersimpan untuk kunjungan berikutnya. |
| **FR-20** | Halaman publik dan internal menggunakan palet monokrom hitam putih yang konsisten; label UI memakai bahasa pengguna dan tidak menampilkan kode requirement seperti `BR-`, `FR-`, `UC-`, atau `AC-`. |

---

## 4. Aturan Bisnis dan Validasi

| ID | Aturan |
|---|---|
| **BR-01** | **Kredensial Akun**: Email wajib diisi, berformat email valid, dan unik pada basis data. Password minimal 8 karakter, wajib dikonfirmasi saat pendaftaran, dan wajib disimpan dalam bentuk hash (bcrypt/Argon2). |
| **BR-02** | **Isolasi Kepemilikan Data**: Setiap transaksi terikat secara mutlak pada satu `user_id`. Pengguna hanya dapat mengakses dan mengelola transaksi yang memiliki `transactions.user_id` sama dengan ID pengguna yang sedang login. |
| **BR-03** | **Validasi Atribut Transaksi**: <br>• Judul transaksi wajib string maksimal 255 karakter.<br>• Nominal (*amount*) wajib berupa angka positif numerik (`amount > 0`).<br>• Tipe transaksi hanya diizinkan bernilai `income` (pemasukan) atau `expense` (pengeluaran).<br>• Tanggal transaksi wajib berformat tanggal yang valid (`YYYY-MM-DD`). |
| **BR-04** | **Kalkulasi Saldo**: Saldo saat ini diperbolehkan bernilai negatif apabila total pengeluaran melebihi total pemasukan, untuk secara realistis merefleksikan kondisi defisit keuangan pengguna. |
| **BR-05** | **Manajemen Sesi**: Sesi disimpan di sisi server dengan cookie identifier yang aman (`HttpOnly`, `SameSite=Lax/Strict`, dan `Secure` pada HTTPS). Sesi diakhiri saat logout atau setelah masa tenggang *inactivity*. |
| **BR-06** | **Manajemen Cookie Preferensi**: Cookie preferensi (misal `pref_filter_type`) disimpan di klien dengan masa aktif panjang (misal 30 hari). Nilai cookie wajib divalidasi/disanitasi di server; jika nilai tidak valid, sistem kembali ke nilai default (*fallback*). |
| **BR-07** | **Proteksi Form Mutasi**: Semua form mutasi (POST/PUT/PATCH/DELETE) wajib menyertakan proteksi terhadap serangan Cross-Site Request Forgery (CSRF token). |
| **BR-08** | **Sanitasi Query**: Semua query ke basis data wajib menggunakan ORM/Query Builder dengan prepared statements berparameter untuk mencegah SQL Injection. |
| **BR-09** | **Penghapusan Bersih (Cascade)**: Jika akun pengguna dihapus, seluruh data transaksi milik pengguna tersebut ikut terhapus otomatis melalui foreign key cascade. |
| **BR-10** | **Kepemilikan Anggaran**: Setiap anggaran terikat pada `user_id` sesi aktif. Kombinasi pengguna dan bulan unik; pengguna hanya boleh membaca dan mengubah anggarannya sendiri. Anggaran ikut terhapus saat akun dihapus. |
| **BR-11** | **Perhitungan Anggaran**: Pemakaian bulan terpilih adalah jumlah `amount` transaksi `expense` milik pengguna dengan `transaction_date` dalam bulan itu. Transaksi `income` tidak dihitung. Sisa = anggaran - pemakaian; nilainya boleh negatif. Persentase = pemakaian / anggaran x 100 dan boleh di atas 100%. |
| **BR-12** | **Validasi Anggaran**: Bulan harus valid dalam format `YYYY-MM`; nominal wajib angka positif dengan paling banyak dua angka desimal dan muat dalam `DECIMAL(15,2)`. Semua perhitungan moneter di server memakai desimal, bukan `float`. |
| **BR-13** | **Migrasi Aman**: Perubahan skema harus memakai migrasi baru yang additive. Dilarang menghapus, mereset, atau menimpa tabel/kolom/data yang sudah ada. Migrasi tidak boleh mengedit migrasi yang telah diterapkan. Seeder hanya untuk development, idempotent dengan insert-if-absent, tidak memperbarui record lama, dan harus gagal dengan aman jika identitas fixture bertabrakan dengan data lain. |

---

## 5. Kebutuhan Atomisitas dan Integritas Transaksi

Setiap operasi mutasi transaksi keuangan dan autentikasi pengguna dijalankan dengan prinsip integritas basis data (*database transaction*):

| Proses | Unit Atomik |
|---|---|
| **Registrasi Akun Baru** | Validasi input unik -> hash password -> buat record `users`. Jika terjadi kegagalan, batalkan proses tanpa menyimpan akun setengah jadi. |
| **Penambahan Transaksi** | Validasi input transaksi -> ikat dengan `user_id` sesi aktif -> simpan baris `transactions`. |
| **Pembaruan Transaksi** | Verifikasi otorisasi kepemilikan (`transaction.user_id == auth.user_id`) -> validasi input baru -> simpan perubahan pada `transactions`. |
| **Penghapusan Transaksi** | Verifikasi otorisasi kepemilikan (`transaction.user_id == auth.user_id`) -> eksekusi hard delete pada baris transaksi. |
| **Penetapan Anggaran** | Validasi sesi, bulan, dan nominal -> simpan/perbarui anggaran berdasarkan pasangan `user_id` dan bulan secara atomik. |
| **Penghapusan Akun Pengguna** | Hapus baris `users`; Foreign Key constraint dengan `ON DELETE CASCADE` secara otomatis dan atomik membersihkan seluruh data transaksi terkait. |

---

## 6. Model Data Minimum

### Struktur Entitas

| Entitas | Kolom Penting | Deskripsi & Relasi |
|---|---|---|
| **`users`** | `id` (PK, BigInt/UUID)<br>`name` (VARCHAR 255)<br>`email` (VARCHAR 255, UNIQUE)<br>`password` (VARCHAR 255 - hashed)<br>`remember_token` (VARCHAR 100, nullable)<br>`created_at`, `updated_at` (TIMESTAMP) | Menyimpan identitas akun pengguna. Satu pengguna memiliki banyak transaksi (1:N). |
| **`transactions`** | `id` (PK, BigInt/UUID)<br>`user_id` (FK -> `users.id`)<br>`title` (VARCHAR 255)<br>`amount` (DECIMAL(15, 2))<br>`type` (ENUM: `'income'`, `'expense'`)<br>`transaction_date` (DATE)<br>`notes` (TEXT, nullable)<br>`created_at`, `updated_at` (TIMESTAMP) | Menyimpan riwayat pemasukan dan pengeluaran. Terikat mutlak pada satu akun pengguna. |
| **`monthly_budgets`** | `id` (UUID, PK)<br>`user_id` (UUID, FK -> `users.id`, NOT NULL)<br>`month` (DATE, wajib hari pertama bulan)<br>`amount` (DECIMAL(15,2), NOT NULL, CHECK > 0)<br>`created_at`, `updated_at` (TIMESTAMP(3)) | Satu anggaran untuk satu pengguna dan satu bulan. Constraint unik `(user_id, month)`. Nominal anggaran disimpan; pemakaian dan sisa dihitung dari transaksi, bukan disimpan ulang. |

### Foreign Key dan Indexing:
* **Foreign Key**: `transactions.user_id -> users.id` dengan konfigurasi `ON DELETE CASCADE` dan `ON UPDATE CASCADE`.
* **Foreign Key anggaran**: `monthly_budgets.user_id -> users.id` dengan `ON DELETE CASCADE` dan `ON UPDATE CASCADE`.
* **Indeks Performa**:
  * Indeks gabungan `(user_id, transaction_date DESC)` untuk mempercepat sortir kronologis dan agregasi saldo.
  * Indeks pada kolom `transactions.type` untuk optimasi filter jenis transaksi.
  * Constraint unik `(user_id, month)` pada `monthly_budgets`; indeks transaksi pengguna dan tanggal dipakai untuk pengeluaran bulan terpilih.

---

## 7. Matriks Otorisasi

| Aksi Sistem | Guest | Pengguna Terautentikasi (Pemilik Data) | Pengguna Terautentikasi (Bukan Pemilik) |
|---|:---:|:---:|:---:|
| Akses Registrasi & Login | Ya | Dialihkan ke Dashboard | Dialihkan ke Dashboard |
| Mengakses Dashboard | Tidak (Redirect Login) | Ya | Tidak (Hanya data miliknya) |
| Menambahkan Transaksi | Tidak | Ya | Tidak |
| Melihat Daftar Transaksi Sendiri | Tidak | Ya | Tidak |
| Mengubah Transaksi Sendiri | Tidak | Ya | Tidak |
| Menghapus Transaksi Sendiri | Tidak | Ya | Tidak |
| Mengakses / Ubah Transaksi Orang Lain | Tidak | Tidak | **Tidak (HTTP 403 Forbidden)** |
| Melihat / Mengatur Anggaran Bulanan | Tidak | Ya | Tidak (hanya anggaran sendiri) |
| Mengatur Cookie Preferensi (Filter/Tema) | Tidak | Ya | Ya (Di browser masing-masing) |
| Melakukan Logout | Tidak | Ya | Ya |

---

## 8. Acceptance Criteria (Given - When - Then)

| ID | Skenario Pengujian (Given - When - Then) |
|---|---|
| **AC-01** | **Given** form registrasi diakses oleh guest, **when** guest mengisi nama, email valid belum terdaftar, password minimal 8 karakter, dan konfirmasi cocok, **then** akun pengguna tersimpan dengan password ter-hash dan pengguna dialihkan ke login. |
| **AC-02** | **Given** form registrasi, **when** email sudah digunakan akun lain atau konfirmasi password tidak cocok, **then** sistem menolak registrasi, menampilkan pesan error spesifik, dan tidak ada akun baru yang tersimpan. |
| **AC-03** | **Given** kredensial login valid, **when** pengguna submit login, **then** sistem membuat sesi server baru, meregenerasi session ID, dan mengarahkan pengguna ke Dashboard. |
| **AC-04** | **Given** kredensial login tidak cocok, **when** pengguna submit login, **then** sistem menolak akses, tidak membuat sesi aktif, dan menampilkan pesan error kredensial tidak valid. |
| **AC-05** | **Given** pengguna dalam sesi login aktif, **when** membuka Dashboard, **then** sistem menampilkan nama pengguna, saldo akurat (`total income - total expense`), total pemasukan, total pengeluaran, dan transaksi terbaru milik pengguna. |
| **AC-06** | **Given** pengguna login, **when** menginput transaksi dengan nominal positif (`amount > 0`), judul terisi, dan tipe valid (`income` / `expense`), **then** transaksi tersimpan dengan `user_id` aktif dan saldo dashboard terbarui. |
| **AC-07** | **Given** transaksi milik User A, **when** User B yang sedang login mencoba mengakses rute edit atau mengirim request update/delete terhadap ID transaksi User A, **then** sistem mengembalikan HTTP 403 Forbidden dan data tidak berubah. |
| **AC-08** | **Given** pengguna berada di halaman transaksi, **when** memilih opsi filter "Pemasukan", **then** hanya transaksi bertipe `income` yang ditampilkan, dan preferensi filter disimpan pada cookie browser. |
| **AC-09** | **Given** cookie preferensi filter telah ada di browser, **when** pengguna membuka kembali halaman transaksi pada kunjungan berikutnya, **then** sistem otomatis menerapkan filter berdasarkan nilai cookie yang tersimpan. |
| **AC-10** | **Given** pengguna dalam sesi aktif, **when** menekan tombol Logout, **then** data sesi di server dihapus, cookie sesi di browser dibersihkan, dan pengguna dialihkan ke halaman login. |
| **AC-11** | **Given** guest yang belum login, **when** mencoba mengakses langsung URL `/dashboard` atau `/transactions`, **then** sistem mencegat request dan mengarahkan guest ke halaman login. |
| **AC-12** | **Given** pengguna login, **when** menetapkan anggaran positif untuk bulan terpilih, **then** anggaran tersimpan untuk pengguna dan bulan tersebut; penyimpanan ulang memperbarui baris yang sama tanpa duplikat. |
| **AC-13** | **Given** transaksi pengeluaran pada bulan terpilih, **when** pengguna melihat dashboard, **then** total anggaran, pemakaian, sisa, dan indikator dihitung hanya dari transaksinya pada bulan itu; saat pemakaian melampaui anggaran, alert terlihat. |
| **AC-14** | **Given** dua pengguna memiliki transaksi dan anggaran, **when** salah satu membaca atau mengirim aksi dengan ID pengguna lain, **then** data pengguna lain tidak terlihat dan tidak berubah. |
| **AC-15** | **Given** pengguna memilih filter transaksi, bulan anggaran, atau menyimpan anggaran, **when** hasil tersedia, **then** bagian terkait berubah tanpa reload penuh; pilihan filter tersimpan di cookie. |
| **AC-16** | **Given** pengguna membuka laman awal, dashboard, dan transaksi, **then** tampilan memakai palet monokrom hitam putih dan tidak ada kode requirement yang tampak. |

---

## 9. Use Case Utama

### UC-01 Registrasi dan Autentikasi Sesi
Guest membuka halaman registrasi, mengisi data formulir pendaftaran. Sistem memvalidasi kelayakan data (format email, keunikan, panjang password, konfirmasi password). Jika valid, sistem membuat akun dengan password terenkripsi. Pengguna kemudian login menggunakan email dan password; sistem memvalidasi hash password, membuat sesi server baru, menulis identifier sesi ke cookie peramban, dan membuka halaman Dashboard.

### UC-02 Memantau Dashboard Keuangan
Pengguna terautentikasi membuka halaman Dashboard. Sistem mengambil ID pengguna dari sesi aktif, lalu mengeksekusi kalkulasi agregasi:
1. Menghitung `SUM(amount)` untuk transaksi bertipe `income`.
2. Menghitung `SUM(amount)` untuk transaksi bertipe `expense`.
3. Menghitung Saldo Saat Ini: `Total Pemasukan - Total Pengeluaran`.
4. Mengambil daftar transaksi paling mutakhir milik pengguna.  
Pengguna dapat langsung mengevaluasi kondisi likuiditas keuangannya secara seketika (*real-time*).

### UC-03 Pengelolaan Transaksi Personal (CRUD)
Pengguna membuka menu transaksi untuk mencatat transaksi baru. Sistem menampilkan formulir yang divalidasi ketat di sisi server (nominal harus > 0, tipe valid). Pengguna juga dapat memilih transaksi miliknya untuk diperbarui rinciannya atau dihapus. Pada setiap operasi mutasi, sistem selalu memastikan bahwa transaksi yang dimanipulasi adalah milik pengguna yang sedang login.

### UC-04 Penerapan Filter dan Persistensi Preferensi via Cookies
Pada halaman daftar transaksi, pengguna memilih opsi filter "Pengeluaran". Sistem memperbarui daftar yang tampil dan mengirimkan response cookie (misal: `pref_filter=expense; max-age=2592000; path=/; SameSite=Lax`). Ketika pengguna menutup browser dan kembali membuka halaman tersebut, sistem membaca cookie request dan langsung menyajikan daftar transaksi sesuai preferensi filter terakhir tanpa perlu dipilih ulang.

### UC-05 Pengakhiran Sesi (Logout)
Pengguna menekan tombol "Logout". Sistem mengirimkan request POST (dengan token CSRF) ke endpoint logout. Server menghapus sesi dari penyimpanan sesi, menginvalidasi cookie sesi di peramban pengguna, dan mengarahkan pengguna kembali ke halaman login.

### UC-06 Menetapkan dan Memantau Anggaran Bulanan

Pengguna memilih bulan, menetapkan nominal anggaran, lalu melihat total pengeluaran dari transaksi miliknya pada bulan tersebut. Sistem menghitung sisa dan persentase penggunaan secara dinamis. Jika pengeluaran melampaui anggaran, sistem menampilkan peringatan tanpa menolak transaksi. Pergantian bulan dan penyimpanan anggaran memperbarui tampilan secara asinkron tanpa reload penuh.

---

## 10. Perilaku Error dan Penanganan Anomali

* **Validasi Form Gagal**: Jika input form tidak memenuhi aturan (email duplikat, nominal <= 0, tipe tidak valid), sistem mengembalikan HTTP 422 dengan pesan error per field dan mempertahankan isian formulir sebelumnya (*old input*) kecuali password.
* **Akses Tanpa Sesi (Unauthenticated)**: Akses langsung ke rute terproteksi akan dialihkan ke halaman login.
* **Akses Tanpa Otorisasi (Forbidden)**: Akses atau manipulasi terhadap ID transaksi milik orang lain akan ditolak dengan respon **HTTP 403 Forbidden**.
* **Resource Tidak Ditemukan**: Request terhadap ID transaksi yang tidak ada mengembalikan respon **HTTP 404 Not Found**.
* **Manipulasi / Kerusakan Nilai Cookie**: Jika nilai cookie preferensi diubah secara manual di klien menjadi nilai yang tidak valid (misal `pref_filter=xyz`), sistem otomatis beralih ke pengaturan default tanpa memunculkan error aplikasi (*graceful fallback*).
* **Kegagalan Database**: Terjadi rollback transaksi secara otomatis, menampilkan pesan error umum yang aman bagi pengguna, dan detail teknis dicatat ke dalam log server.

---

## 11. Kebutuhan Nonfungsional dan Keamanan

* **Arsitektur**: Aplikasi dibangun dengan pola arsitektur MVC (*Model-View-Controller*) yang memisahkan logika data, tampilan antarmuka, dan kontrol alur bisnis.
* **Keamanan Sesi & Password**:
  * Password disimpan menggunakan algoritma hashing satu arah yang kuat (bcrypt/Argon2).
  * Session ID diacak dengan entropi tinggi dan diregenerasi saat login untuk mencegah *session fixation*.
  * Cookie sesi wajib dilengkapi atribut `HttpOnly` untuk mencegah serangan XSS, serta `SameSite` untuk mitigasi CSRF.
* **Proteksi Mutasi**: Seluruh request mutasi data (POST/PUT/PATCH/DELETE) diwajibkan melewati proteksi CSRF token. Operasi GET bersifat *read-only*.
* **Keamanan Basis Data**: Menggunakan query berparameter / ORM untuk mencegah serangan SQL Injection.
* **Performa**: Agregasi saldo dan filtering data transaksi dioptimalkan menggunakan indeks gabungan `(user_id, transaction_date)`.

---

## 12. Asumsi yang Dikunci

1. **Mata Uang Tunggal**: Seluruh nominal transaksi menggunakan satu mata uang (IDR / Rupiah).
2. **Kondisi Saldo Defisit**: Sistem mengizinkan saldo bernilai negatif jika pengeluaran melebihi pemasukan, disertai indikator visual untuk menyadarkan pengguna akan kondisi keuangannya yang sedang defisit.
3. **Penyimpanan Preferensi**: Cookie preferensi pengguna digunakan murni untuk kenyamanan antarmuka (seperti filter riwayat terakhir atau tema tampilan) dan tidak menyimpan data sensitif seperti nominal uang, password, atau ID pengguna.
4. **Presisi Nominal**: Nominal transaksi menggunakan tipe data moneter desimal (`DECIMAL(15, 2)`) untuk menjamin akurasi perhitungan keuangan tanpa galat *floating point*.
