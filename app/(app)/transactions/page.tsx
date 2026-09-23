'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getTransactions, TransactionDTO } from '@/lib/actions/transactions';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionFormModal from '@/components/transactions/TransactionFormModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reloadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransactions();
      if (res.success && res.data) {
        setTransactions(res.data);
      } else {
        setError(res.error || 'Gagal memuat transaksi.');
      }
    } catch {
      setError('Terjadi kesalahan saat memuat data transaksi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        const res = await getTransactions();
        if (!ignore) {
          if (res.success && res.data) {
            setTransactions(res.data);
          } else {
            setError(res.error || 'Gagal memuat transaksi.');
          }
        }
      } catch {
        if (!ignore) {
          setError('Terjadi kesalahan saat memuat data transaksi.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Daftar Transaksi
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola seluruh riwayat pemasukan dan pengeluaran Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          + Tambah Transaksi
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          Memuat data transaksi...
        </div>
      ) : (
        <TransactionTable transactions={transactions} />
      )}

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadTransactions}
      />
    </div>
  );
}
