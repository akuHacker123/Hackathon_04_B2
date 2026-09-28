import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "ExpenseTracker - Kelola Finansial Pribadi Bebas Konsumtif",
  description:
    "Aplikasi pelacak pemasukan dan pengeluaran cerdas dengan kalkulasi saldo real-time, deteksi defisit, dan smart cookie filter.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-zinc-100 dark:selection:text-zinc-900 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm transition-transform group-hover:scale-105 dark:bg-zinc-100 dark:text-zinc-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              ExpenseTracker
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#features" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Fitur Utama
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Cara Kerja
            </a>
            <a href="#security" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
              Keamanan Data
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-black active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,0,0,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 px-3.5 py-1 font-medium text-xs">
            Solusi Finansial Pribadi Bebas Konsumtif
          </Badge>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight text-zinc-900 dark:text-white">
            Kendalikan Finansial Pribadi,{" "}
            <span className="underline decoration-zinc-400 decoration-2 underline-offset-8">
              Hentikan Kebiasaan Hedon
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl leading-relaxed">
            Lacak setiap arus kas masuk dan keluar secara disiplin. Pantau saldo seketika, deteksi potensi defisit, dan simpan preferensi penelusuran transaksi Anda secara otomatis.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 text-base font-semibold text-white shadow-lg shadow-zinc-900/15 transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Mulai Sekarang — Gratis
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-8 text-base font-semibold text-zinc-800 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>

          {/* Interactive Hero Preview Mockup */}
          <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
                <span className="h-3 w-3 rounded-full bg-zinc-400 dark:bg-zinc-600 inline-block" />
                <span className="h-3 w-3 rounded-full bg-zinc-800 dark:bg-zinc-400 inline-block" />
                <span className="ml-2 text-xs font-medium text-zinc-400">dashboard / overview</span>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono">
                Saldo Real-Time
              </Badge>
            </div>

            {/* Mock Dashboard Cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Saldo Saat Ini</span>
                <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Rp 4.250.000
                </p>
                <span className="mt-1 inline-block text-[11px] text-zinc-500 dark:text-zinc-400">Total Saldo Bersih Aktif</span>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Pemasukan</span>
                <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Rp 7.500.000
                </p>
                <span className="mt-1 inline-block text-[11px] text-zinc-500 dark:text-zinc-400">
                  + Gaji & Pendapatan
                </span>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Pengeluaran</span>
                <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Rp 3.250.000
                </p>
                <span className="mt-1 inline-block text-[11px] text-zinc-500 dark:text-zinc-400">
                  Belanja & Biaya Hidup
                </span>
              </div>
            </div>

            {/* Mock Recent Transaction Row */}
            <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Aktivitas Transaksi Terbaru
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Otomatis Terindeks</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs">
                      +
                    </span>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">Gaji Pokok Bulanan</p>
                      <p className="text-[11px] text-zinc-400">2026-09-20 • Transfer Bank</p>
                    </div>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">+Rp 7.500.000</span>
                </div>
                <div className="flex items-center justify-between py-1 text-sm border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold text-xs">
                      -
                    </span>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">Kebutuhan Bulanan & Belanja</p>
                      <p className="text-[11px] text-zinc-400">2026-09-22 • Supermarket</p>
                    </div>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">-Rp 1.250.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-3">
              Fitur Lengkap
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              Dirancang untuk Kedisiplinan Finansial Tanpa Ribet
            </h2>
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
              Semua kebutuhan pelacakan keuangan dirancang dengan cermat mengikuti standar performa dan keakuratan sistem.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Manajemen Transaksi Cepat
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Catat pemasukan dan pengeluaran dengan nominal akurat desimal, validasi tanggal ketat, dan catatan rincian transaksi untuk riwayat finansial yang rapi.
                </p>
              </div>
              <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Operasi CRUD Lengkap & Bersih
                </span>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Kalkulasi Saldo Real-Time
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Total pemasukan, total pengeluaran, dan saldo bersih dihitung otomatis oleh server secara instan. Mendukung indikator visual waspada saat terjadi defisit saldo.
                </p>
              </div>
              <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Indikator Defisit Terdeteksi
                </span>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Preferensi Filter via Cookies
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Filter transaksi (Semua, Pemasukan, Pengeluaran) tersimpan awet pada cookie browser. Saat membuka aplikasi kembali, filter favorit langsung aktif otomatis.
                </p>
              </div>
              <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Penyimpanan Filter Otomatis
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Isolation Section */}
      <section id="security" className="py-20 bg-white dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Proteksi Privasi Tingkat Tinggi
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
                Isolasi Data Penuh Antar-Pengguna
              </h2>
              <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Keamanan dan privasi keuangan adalah prioritas mutlak. Setiap transaksi terikat secara eksklusif ke akun Anda, dilengkapi proteksi multi-lapis.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Otorisasi Mutasi Terisolasi (HTTP 403 Forbidden)
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Pengguna lain tidak akan pernah bisa melihat, mengubah, atau menghapus riwayat transaksi milik Anda.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Manajemen Sesi Server Aman & Regenerasi ID
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Menggunakan token sesi aman dengan atribut HttpOnly, SameSite, dan pencegahan Session Fixation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Middleware Rute & Proteksi Akses Tamu
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Halaman keuangan hanya dapat diakses setelah login terverifikasi. Pengguna tanpa sesi otomatis diarahkan ke halaman login.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                Standar Keandalan & Keamanan Sistem
              </h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span>Enkripsi Password (Bcrypt/Argon2)</span>
                  <Badge variant="outline">Tervalidasi</Badge>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span>Isolasi Kepemilikan Data Pengguna</span>
                  <Badge variant="outline">Terisolasi</Badge>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span>Kalkulasi Saldo Real-Time & Defisit</span>
                  <Badge variant="outline">Real-Time</Badge>
                </li>
                <li className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span>Keamanan Sesi & Regenerasi ID</span>
                  <Badge variant="outline">Terproteksi</Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span>Cookie Preferensi & Fallback Otomatis</span>
                  <Badge variant="outline">Tersimpan</Badge>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-3">
            Langkah Sederhana
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
            3 Langkah Mudah Menuju Finansial Sehat
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-lg mb-4 dark:bg-zinc-100 dark:text-zinc-900">
                1
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Daftar Akun Baru</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Registrasi akun pribadi Anda dalam hitungan detik untuk mendapatkan ruang pencatatan keuangan yang sepenuhnya terisolasi.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-lg mb-4 dark:bg-zinc-100 dark:text-zinc-900">
                2
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Catat Transaksi Anda</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Input pemasukan bulanan dan pengeluaran harian dengan nominal desimal presisi serta tanggal transaksi yang akurat.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-lg mb-4 dark:bg-zinc-100 dark:text-zinc-900">
                3
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Pantau & Evaluasi</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Cek dashboard saldo real-time, saring pengeluaran menggunakan filter cookies cerdas, dan hindari defisit keuangan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-zinc-900 text-white dark:bg-black dark:border-t dark:border-b dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">
            Mulai Catat Keuangan Pribadi Hari Ini
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            Bergabunglah sekarang dan rasakan kemudahan mengontrol pengeluaran dengan sistem yang aman, cepat, dan terstruktur.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-zinc-900 shadow-md transition-all hover:bg-zinc-100 active:scale-95"
            >
              Buat Akun Sekarang
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/80 px-8 text-base font-semibold text-white backdrop-blur transition-all hover:bg-zinc-800"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">ExpenseTracker</span>
            <span>• Hackathon 04 Kelompok B2</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Login Pengguna
            </Link>
            <Link href="/register" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Registrasi Akun
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
