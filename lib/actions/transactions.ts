'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/get-user';
import { TransactionType } from '@/lib/generated/prisma/client';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface CreateTransactionInput {
  title: string;
  amount: number | string;
  type: 'income' | 'expense';
  transactionDate: string;
  notes?: string | null;
}

/**
 * FR-08: Menambahkan transaksi baru
 * Aturan Bisnis & Validasi:
 * - BR-02: Terikat mutlak pada user_id pengguna aktif
 * - BR-03:
 *   - Judul wajib string max 255 karakter
 *   - Nominal (amount) wajib angka positif (> 0)
 *   - Tipe hanya 'income' atau 'expense'
 *   - Tanggal format valid YYYY-MM-DD
 *   - Catatan opsional
 * - Section 10: Gagal validasi mengembalikan pesan error per field (status 422)
 * - BR-08: Sanitasi query via Prisma ORM
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return {
        success: false,
        error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
        status: 401,
      };
    }

    const fieldErrors: Record<string, string[]> = {};

    // 1. Validasi Judul (Title)
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title) {
      fieldErrors.title = ['Judul transaksi wajib diisi.'];
    } else if (title.length > 255) {
      fieldErrors.title = ['Judul transaksi maksimal 255 karakter.'];
    }

    // 2. Validasi Nominal (Amount)
    const rawAmount = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;
    if (rawAmount === undefined || rawAmount === null || isNaN(rawAmount) || rawAmount <= 0) {
      fieldErrors.amount = ['Nominal harus berupa angka positif lebih dari 0.'];
    }

    // 3. Validasi Tipe Transaksi (Type)
    const validTypes: TransactionType[] = ['income', 'expense'];
    if (!validTypes.includes(input.type as TransactionType)) {
      fieldErrors.type = ["Tipe transaksi hanya boleh 'income' atau 'expense'."];
    }

    // 4. Validasi Tanggal Transaksi (Date)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!input.transactionDate || !dateRegex.test(input.transactionDate)) {
      fieldErrors.transactionDate = ['Format tanggal harus valid (YYYY-MM-DD).'];
    } else {
      const parsedDate = new Date(input.transactionDate);
      if (isNaN(parsedDate.getTime())) {
        fieldErrors.transactionDate = ['Tanggal transaksi tidak valid.'];
      }
    }

    // Jika terdapat kesalahan validasi atribut (BR-03 / Section 10: HTTP 422)
    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: 'Validasi input transaksi gagal.',
        errors: fieldErrors,
        status: 422,
      };
    }

    // BR-02 & BR-08: Simpan transaksi terikat dengan user_id aktif via Prisma ORM
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        title,
        amount: rawAmount,
        type: input.type as TransactionType,
        transactionDate: new Date(`${input.transactionDate}T00:00:00.000Z`),
        notes: input.notes ? input.notes.trim() : null,
      },
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        id: transaction.id,
        userId: transaction.userId,
        title: transaction.title,
        amount: transaction.amount.toString(),
        type: transaction.type,
        transactionDate: transaction.transactionDate.toISOString().split('T')[0],
        notes: transaction.notes,
        createdAt: transaction.createdAt.toISOString(),
      },
      status: 201,
    };
  } catch (err) {
    console.error('Error createTransaction:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan pada server saat menambahkan transaksi.',
      status: 500,
    };
  }
}
