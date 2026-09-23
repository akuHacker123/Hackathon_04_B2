import { cookies } from "next/headers";

/**
 * Filter Preference Type
 * FR-12: Filter transaksi berdasarkan jenis: Semua (all), Pemasukan (income), Pengeluaran (expense)
 */
export type FilterPreference = "all" | "income" | "expense";

/**
 * Nama cookie untuk preferensi filter sesuai kontrak shared docs/PEMBAGIAN_TUGAS.md
 */
export const FILTER_COOKIE_NAME = "pref_filter_type";

/**
 * Nilai default jika cookie belum diset atau rusak (fallback)
 */
export const DEFAULT_FILTER: FilterPreference = "all";

/**
 * Masa aktif cookie: 30 hari (dalam detik) sesuai BR-06
 * 30 days = 30 * 24 * 60 * 60 = 2,592,000 detik
 */
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Sanitasi & Validasi Server-Side Nilai Cookie (BR-06 & Graceful Fallback)
 * Memastikan nilai cookie aman dan valid ('all' | 'income' | 'expense').
 * Jika nilai cookie dirusak, dimanipulasi, atau undefined, otomatis fallback ke DEFAULT_FILTER ('all').
 */
export function parseFilterCookie(
  value: string | undefined | null
): FilterPreference {
  if (value === "income" || value === "expense" || value === "all") {
    return value;
  }
  // Graceful fallback jika cookie rusak/tidak valid
  return DEFAULT_FILTER;
}

/**
 * Helper Server-Side: Membaca nilai filter preferensi dari cookie request
 * Digunakan oleh Server Components (misal: halaman transaksi milik Agil atau dashboard)
 */
export async function getServerFilterPreference(): Promise<FilterPreference> {
  try {
    const cookieStore = await cookies();
    const rawValue = cookieStore.get(FILTER_COOKIE_NAME)?.value;
    return parseFilterCookie(rawValue);
  } catch {
    return DEFAULT_FILTER;
  }
}

/**
 * Helper Client-Side: Menyimpan nilai filter preferensi ke peramban (FR-13, BR-06, AC-08)
 * Format cookie: pref_filter_type=<value>; max-age=2592000; path=/; SameSite=Lax
 */
export function setClientFilterCookie(filter: FilterPreference): void {
  if (typeof document === "undefined") return;

  const validFilter = parseFilterCookie(filter);
  const secureFlag =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${FILTER_COOKIE_NAME}=${encodeURIComponent(
    validFilter
  )}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Helper Client-Side: Membaca nilai filter preferensi dari document.cookie
 */
export function getClientFilterCookie(): FilterPreference {
  if (typeof document === "undefined") return DEFAULT_FILTER;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${FILTER_COOKIE_NAME}=`));

  if (!match) return DEFAULT_FILTER;

  const rawValue = decodeURIComponent(match.split("=")[1] || "");
  return parseFilterCookie(rawValue);
}
