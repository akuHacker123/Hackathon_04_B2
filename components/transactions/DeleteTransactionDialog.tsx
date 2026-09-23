'use client';

import React, { useState } from 'react';
import { deleteTransaction, TransactionDTO } from '@/lib/actions/transactions';

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  transaction: TransactionDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteTransactionDialog({
  isOpen,
  transaction,
  onClose,
  onSuccess,
}: DeleteTransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await deleteTransaction(transaction.id);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Gagal menghapus transaksi.');
      }
    } catch {
      setError('Terjadi kesalahan saat menghapus transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Konfirmasi Hapus Transaksi
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini bersifat permanen (*hard delete*) dan data tidak dapat dikembalikan.
        </p>

        <div className="my-4 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            {transaction.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} • {formatRupiah(transaction.amount)} • {transaction.transactionDate}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
          >
            {loading ? 'Menghapus...' : 'Hapus Transaksi'}
          </button>
        </div>
      </div>
    </div>
  );
}
