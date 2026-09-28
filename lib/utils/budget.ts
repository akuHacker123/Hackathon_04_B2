/**
 * Helper dan utilitas sinkron untuk parsing & formatting bulan anggaran.
 * Tidak menggunakan direktif 'use server' agar aman diimpor oleh Server Component,
 * Client Component, maupun Server Actions.
 */

export interface MonthlyBudgetData {
  month: string; // 'YYYY-MM'
  budgetAmount: string | null;
  totalExpense: string;
  remaining: string | null;
  percentage: number | null;
  isOverBudget: boolean;
  hasBudget: boolean;
}

export interface SaveMonthlyBudgetInput {
  month: string;
  amount: number | string;
}

/**
 * Format string bulan YYYY-MM menjadi rentang Date UTC untuk hari pertama dan bulan berikutnya.
 */
export function parseMonthRange(monthStr: string): {
  startDate: Date;
  nextMonthDate: Date;
  monthKey: string;
} {
  const trimmed = typeof monthStr === 'string' ? monthStr.trim() : '';
  const match = trimmed.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (!match) {
    throw new Error('Format bulan harus valid (YYYY-MM).');
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) {
    throw new Error('Bulan harus di antara 01 dan 12.');
  }
  if (year < 1900 || year > 2100) {
    throw new Error('Tahun harus di antara 1900 dan 2100.');
  }
  const monthKey = `${match[1]}-${match[2]}`;
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const nextMonthDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { startDate, nextMonthDate, monthKey };
}

/**
 * Mendapatkan string bulan kalender saat ini dalam format YYYY-MM (UTC).
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
