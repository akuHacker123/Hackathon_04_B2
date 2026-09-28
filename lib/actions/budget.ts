'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

import {
  MonthlyBudgetData,
  SaveMonthlyBudgetInput,
  parseMonthRange,
  getCurrentMonthKey,
} from '@/lib/utils/budget';

/**
 * Format string bulan YYYY-MM menjadi rentang Date UTC untuk hari pertama dan bulan berikutnya.
 */
function parseMonthRange(monthStr: string): {
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
 * Mendapatkan string bulan kalender saat ini dalam format YYYY-MM.
 */
export async function getCurrentMonthKey(): Promise<string> {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Menghitung anggaran dan pengeluaran untuk user dan bulan kalender tertentu.
 * Menggunakan kalkulasi Decimal untuk presisi moneter tanpa galat floating point (BR-12).
 */
export async function calculateMonthlyBudgetData(
  userId: string,
  monthKey: string
): Promise<MonthlyBudgetData> {
  const { startDate, nextMonthDate, monthKey: normalizedMonth } = parseMonthRange(monthKey);

  const [budgetRecord, expenseAggregate] = await Promise.all([
    prisma.monthlyBudget.findUnique({
      where: {
        userId_month: {
          userId,
          month: startDate,
        },
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        transactionDate: {
          gte: startDate,
          lt: nextMonthDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const totalExpenseDecimal = expenseAggregate._sum.amount ?? new Prisma.Decimal(0);
  const totalExpenseStr = totalExpenseDecimal.toFixed(2);

  if (!budgetRecord) {
    return {
      month: normalizedMonth,
      budgetAmount: null,
      totalExpense: totalExpenseStr,
      remaining: null,
      percentage: null,
      isOverBudget: false,
      hasBudget: false,
    };
  }

  const budgetAmountDecimal = budgetRecord.amount;
  const remainingDecimal = budgetAmountDecimal.minus(totalExpenseDecimal);
  const percentage = budgetAmountDecimal.isZero()
    ? 0
    : Number(totalExpenseDecimal.dividedBy(budgetAmountDecimal).mul(100).toFixed(2));
  const isOverBudget = totalExpenseDecimal.greaterThan(budgetAmountDecimal);

  return {
    month: normalizedMonth,
    budgetAmount: budgetAmountDecimal.toFixed(2),
    totalExpense: totalExpenseStr,
    remaining: remainingDecimal.toFixed(2),
    percentage,
    isOverBudget,
    hasBudget: true,
  };
}

/**
 * FR-16 & FR-17: Mengambil data anggaran bulanan untuk pengguna yang sedang aktif.
 * Mengembalikan nominal anggaran (atau null jika belum diatur), total pengeluaran, sisa, dan persentase.
 */
export async function getMonthlyBudget(
  month?: string
): Promise<ActionResponse<MonthlyBudgetData>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return {
        success: false,
        error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
        status: 401,
      };
    }

    const targetMonth = month || (await getCurrentMonthKey());
    let normalizedMonth: string;
    try {
      const parsed = parseMonthRange(targetMonth);
      normalizedMonth = parsed.monthKey;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Format bulan tidak valid.';
      return {
        success: false,
        error: message,
        errors: { month: [message] },
        status: 422,
      };
    }

    const data = await calculateMonthlyBudgetData(user.id, normalizedMonth);

    return {
      success: true,
      data,
      status: 200,
    };
  } catch (err) {
    console.error('Error getMonthlyBudget:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan saat memuat data anggaran bulanan.',
      status: 500,
    };
  }
}

/**
 * FR-16 & FR-18: Menetapkan atau memperbarui nominal anggaran bulanan untuk pengguna yang sedang aktif.
 * Aturan Bisnis & Validasi:
 * - BR-10: Terikat mutlak pada user_id sesi aktif. Unik per user dan bulan.
 * - BR-12: Format bulan YYYY-MM; nominal > 0, desimal maksimal 2 angka, muat dalam DECIMAL(15,2).
 */
export async function saveMonthlyBudget(
  monthOrInput: string | SaveMonthlyBudgetInput,
  amountArg?: number | string
): Promise<ActionResponse<MonthlyBudgetData>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return {
        success: false,
        error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
        status: 401,
      };
    }

    let monthRaw: string;
    let amountRaw: number | string | undefined;

    if (typeof monthOrInput === 'object' && monthOrInput !== null) {
      monthRaw = monthOrInput.month;
      amountRaw = monthOrInput.amount;
    } else {
      monthRaw = monthOrInput;
      amountRaw = amountArg;
    }

    const fieldErrors: Record<string, string[]> = {};

    // 1. Validasi Bulan
    let parsedMonth: { startDate: Date; nextMonthDate: Date; monthKey: string } | null = null;
    if (!monthRaw || typeof monthRaw !== 'string') {
      fieldErrors.month = ['Bulan wajib diisi.'];
    } else {
      try {
        parsedMonth = parseMonthRange(monthRaw);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Format bulan tidak valid.';
        fieldErrors.month = [message];
      }
    }

    // 2. Validasi Nominal (Amount)
    let decimalAmount: Prisma.Decimal | null = null;
    const strAmount =
      typeof amountRaw === 'number'
        ? amountRaw.toString()
        : typeof amountRaw === 'string'
          ? amountRaw.trim()
          : '';

    if (!strAmount) {
      fieldErrors.amount = ['Nominal anggaran wajib diisi.'];
    } else {
      const numericValue = Number(strAmount);
      if (isNaN(numericValue) || numericValue <= 0) {
        fieldErrors.amount = ['Nominal anggaran harus berupa angka positif lebih dari 0.'];
      } else if (!/^\d+(\.\d{1,2})?$/.test(strAmount)) {
        fieldErrors.amount = ['Nominal anggaran maksimal 2 angka di belakang koma.'];
      } else {
        try {
          decimalAmount = new Prisma.Decimal(strAmount);
          if (decimalAmount.lessThanOrEqualTo(0)) {
            fieldErrors.amount = ['Nominal anggaran harus lebih dari 0.'];
          } else if (decimalAmount.greaterThan(new Prisma.Decimal('9999999999999.99'))) {
            fieldErrors.amount = ['Nominal anggaran melebihi batas maksimal yang diizinkan.'];
          }
        } catch {
          fieldErrors.amount = ['Nominal anggaran tidak valid.'];
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0 || !parsedMonth || !decimalAmount) {
      return {
        success: false,
        error: 'Validasi input anggaran gagal.',
        errors: fieldErrors,
        status: 422,
      };
    }

    // Simpan / Perbarui secara atomik dengan upsert
    await prisma.monthlyBudget.upsert({
      where: {
        userId_month: {
          userId: user.id,
          month: parsedMonth.startDate,
        },
      },
      create: {
        userId: user.id,
        month: parsedMonth.startDate,
        amount: decimalAmount,
      },
      update: {
        amount: decimalAmount,
      },
    });

    revalidatePath('/dashboard');

    const updatedData = await calculateMonthlyBudgetData(user.id, parsedMonth.monthKey);

    return {
      success: true,
      data: updatedData,
      status: 200,
    };
  } catch (err) {
    console.error('Error saveMonthlyBudget:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan pada server saat menyimpan anggaran.',
      status: 500,
    };
  }
}
