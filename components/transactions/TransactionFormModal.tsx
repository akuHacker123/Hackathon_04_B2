'use client';

import React, { useState } from 'react';
import {
  createTransaction,
  updateTransaction,
  TransactionDTO,
} from '@/lib/actions/transactions';

interface TransactionFormModalProps {
  isOpen: boolean;
  initialData?: TransactionDTO | null;
  onClose: () => void;
  onSuccess?: () => void;
}

function TransactionFormModalInner({
  initialData,
  onClose,
  onSuccess,
}: Omit<TransactionFormModalProps, 'isOpen'>) {
  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState(initialData ? initialData.amount.toString() : '');
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [transactionDate, setTransactionDate] = useState(initialData?.transactionDate || today);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEditMode = Boolean(initialData && initialData.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError(null);
    setFieldErrors({});

    try {
      const payload = {
        title,
        amount,
        type,
        transactionDate,
        notes: notes || null,
      };

      const res = isEditMode && initialData
        ? await updateTransaction(initialData.id, payload)
        : await createTransaction(payload);

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        if (res.status === 422 && res.errors) {
          setFieldErrors(res.errors);
        } else {
          setGeneralError(res.error || 'Gagal menyimpan transaksi.');
        }
      }
    } catch {
      setGeneralError('Terjadi kesalahan yang tidak terduga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {isEditMode ? 'Ubah Transaksi' : 'Tambah Transaksi Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul Transaksi */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Judul / Keterangan Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              placeholder="Contoh: Beli Kopi, Gaji Bulanan"
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.title[0]}
              </p>
            )}
          </div>

          {/* Nominal & Tipe */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nominal (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              {fieldErrors.amount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.amount[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tipe Transaksi <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="expense">Pengeluaran (Expense)</option>
                <option value="income">Pemasukan (Income)</option>
              </select>
              {fieldErrors.type && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {fieldErrors.type[0]}
                </p>
              )}
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tanggal Transaksi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            {fieldErrors.transactionDate && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {fieldErrors.transactionDate[0]}
              </p>
            )}
          </div>

          {/* Catatan Opsional */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Catatan (Opsional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan bila diperlukan..."
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-3 border-t dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading
                ? 'Menyimpan...'
                : isEditMode
                ? 'Simpan Perubahan'
                : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TransactionFormModal(props: TransactionFormModalProps) {
  if (!props.isOpen) return null;
  const key = props.initialData?.id || 'new-transaction';
  return <TransactionFormModalInner key={key} {...props} />;
}
