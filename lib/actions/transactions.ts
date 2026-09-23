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

export interface TransactionDTO {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  transactionDate: string;
  notes: string | null;
  createdAt: string;
}

/**
 * FR-09: Melihat daftar seluruh transaksi pengguna
 * Aturan Bisnis & Validasi:
 * - BR-02: Terikat mutlak pada user_id pengguna aktif
 * - Urutan kronologis terbalik (transaksi terbaru di atas)
 * - BR-08: Sanitasi query via Prisma ORM
 */
export async function getTransactions(): Promise<ActionResponse<TransactionDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return {
        success: false,
        error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
        status: 401,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { transactionDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const formatted: TransactionDTO[] = transactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      title: t.title,
      amount: Number(t.amount),
      type: t.type as 'income' | 'expense',
      transactionDate: t.transactionDate.toISOString().split('T')[0],
      notes: t.notes,
      createdAt: t.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: formatted,
      status: 200,
    };
  } catch (err) {
    console.error('Error getTransactions:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan saat memuat daftar transaksi.',
      status: 500,
    };
  }
}

export interface UpdateTransactionInput {
  title: string;
  amount: number | string;
  type: 'income' | 'expense';
  transactionDate: string;
  notes?: string | null;
}

/**
 * FR-10: Melihat detail data transaksi
 * Aturan Bisnis & Validasi:
 * - BR-02: Isolasi kepemilikan data (hanya pemilik yang dapat melihat)
 * - Section 10: 404 jika tidak ditemukan, 403 jika milik orang lain
 */
export async function getTransactionById(
  id: string
): Promise<ActionResponse<TransactionDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return {
        success: false,
        error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
        status: 401,
      };
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return {
        success: false,
        error: 'Transaksi tidak ditemukan.',
        status: 404,
      };
    }

    if (transaction.userId !== user.id) {
      return {
        success: false,
        error: 'Akses ditolak. Anda tidak memiliki izin untuk melihat transaksi ini.',
        status: 403,
      };
    }

    return {
      success: true,
      data: {
        id: transaction.id,
        userId: transaction.userId,
        title: transaction.title,
        amount: Number(transaction.amount),
        type: transaction.type as 'income' | 'expense',
        transactionDate: transaction.transactionDate.toISOString().split('T')[0],
        notes: transaction.notes,
        createdAt: transaction.createdAt.toISOString(),
      },
      status: 200,
    };
  } catch (err) {
    console.error('Error getTransactionById:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan saat memuat detail transaksi.',
      status: 500,
    };
  }
}

/**
 * FR-10: Mengubah (update) data transaksi
 * Aturan Bisnis & Validasi:
 * - BR-02: Isolasi kepemilikan data (verifikasi transaction.user_id == auth.user_id)
 * - BR-03: Validasi atribut transaksi (judul max 255, amount > 0, tipe valid, tanggal valid)
 * - Section 10: 404 jika tidak ditemukan, 403 jika milik orang lain, 422 jika validasi gagal
 * - BR-08: Sanitasi query via Prisma ORM
 */
export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
): Promise<ActionResponse<TransactionDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return {
        success: false,
        error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
        status: 401,
      };
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return {
        success: false,
        error: 'Transaksi tidak ditemukan.',
        status: 404,
      };
    }

    if (existingTransaction.userId !== user.id) {
      return {
        success: false,
        error: 'Akses ditolak. Anda tidak memiliki izin untuk mengubah transaksi ini.',
        status: 403,
      };
    }

    const fieldErrors: Record<string, string[]> = {};

    // 1. Validasi Judul
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title) {
      fieldErrors.title = ['Judul transaksi wajib diisi.'];
    } else if (title.length > 255) {
      fieldErrors.title = ['Judul transaksi maksimal 255 karakter.'];
    }

    // 2. Validasi Nominal
    const rawAmount = typeof input.amount === 'string' ? parseFloat(input.amount) : input.amount;
    if (rawAmount === undefined || rawAmount === null || isNaN(rawAmount) || rawAmount <= 0) {
      fieldErrors.amount = ['Nominal harus berupa angka positif lebih dari 0.'];
    }

    // 3. Validasi Tipe Transaksi
    const validTypes: TransactionType[] = ['income', 'expense'];
    if (!validTypes.includes(input.type as TransactionType)) {
      fieldErrors.type = ["Tipe transaksi hanya boleh 'income' atau 'expense'."];
    }

    // 4. Validasi Tanggal Transaksi
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!input.transactionDate || !dateRegex.test(input.transactionDate)) {
      fieldErrors.transactionDate = ['Format tanggal harus valid (YYYY-MM-DD).'];
    } else {
      const parsedDate = new Date(input.transactionDate);
      if (isNaN(parsedDate.getTime())) {
        fieldErrors.transactionDate = ['Tanggal transaksi tidak valid.'];
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: 'Validasi input transaksi gagal.',
        errors: fieldErrors,
        status: 422,
      };
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
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
        id: updated.id,
        userId: updated.userId,
        title: updated.title,
        amount: Number(updated.amount),
        type: updated.type as 'income' | 'expense',
        transactionDate: updated.transactionDate.toISOString().split('T')[0],
        notes: updated.notes,
        createdAt: updated.createdAt.toISOString(),
      },
      status: 200,
    };
  } catch (err) {
    console.error('Error updateTransaction:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan saat memperbarui transaksi.',
      status: 500,
    };
  }
}

/**
 * FR-10: Menghapus data transaksi (hard delete)
 * Aturan Bisnis & Validasi:
 * - BR-02: Verifikasi kepemilikan (transaction.user_id == auth.user_id)
 * - Section 10: 404 jika tidak ada, 403 jika bukan pemilik
 * - Hard delete eksekusi langsung pada baris data tabel transactions
 */
export async function deleteTransaction(
  id: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return {
        success: false,
        error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
        status: 401,
      };
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return {
        success: false,
        error: 'Transaksi tidak ditemukan.',
        status: 404,
      };
    }

    if (existingTransaction.userId !== user.id) {
      return {
        success: false,
        error: 'Akses ditolak. Anda tidak memiliki izin untuk menghapus transaksi ini.',
        status: 403,
      };
    }

    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { id },
      status: 200,
    };
  } catch (err) {
    console.error('Error deleteTransaction:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan saat menghapus transaksi.',
      status: 500,
    };
  }
}


