'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { getTransactions, TransactionDTO } from '@/lib/actions/transactions';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionFormModal from '@/components/transactions/TransactionFormModal';
import DeleteTransactionDialog from '@/components/transactions/DeleteTransactionDialog';
import { FilterTabs } from '@/components/common/FilterTabs';
import { type FilterPreference, getClientFilterCookie } from '@/lib/cookies';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterPreference>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal Form (Create / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionDTO | null>(null);

  // State Modal Hapus (Delete)
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionDTO | null>(null);

  const fetchWithFilter = useCallback(async (filter: FilterPreference) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransactions(filter);
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

  const handleFilterChange = (filter: FilterPreference) => {
    setCurrentFilter(filter);
    fetchWithFilter(filter);
  };

  const reloadTransactions = useCallback(async () => {
    await fetchWithFilter(currentFilter);
  }, [fetchWithFilter, currentFilter]);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      const initialCookieFilter = getClientFilterCookie();
      setCurrentFilter(initialCookieFilter);

      try {
        const res = await getTransactions(initialCookieFilter);
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

  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (tx: TransactionDTO) => {
    setEditingTransaction(tx);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (tx: TransactionDTO) => {
    setDeletingTransaction(tx);
  };

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
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-100"
        >
          + Tambah Transaksi
        </button>
      </div>

      {/* Filter Daftar Transaksi (FR-12, FR-19) */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />}>
          <FilterTabs
            initialFilter={currentFilter}
            onFilterChange={handleFilterChange}
            syncUrl={true}
          />
        </Suspense>
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
        <TransactionTable
          transactions={transactions}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteDialog}
        />
      )}

      {/* Form Modal untuk Tambah / Ubah Transaksi */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        initialData={editingTransaction}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={reloadTransactions}
      />

      {/* Dialog Konfirmasi Hapus Transaksi */}
      <DeleteTransactionDialog
        isOpen={Boolean(deletingTransaction)}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onSuccess={reloadTransactions}
      />
    </div>
  );
}
