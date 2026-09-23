'use client';

import React from 'react';
import { TransactionDTO } from '@/lib/actions/transactions';
import TransactionItem from './TransactionItem';

interface TransactionTableProps {
  transactions: TransactionDTO[];
  onEdit?: (transaction: TransactionDTO) => void;
  onDelete?: (transaction: TransactionDTO) => void;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Belum ada transaksi yang tercatat.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3">Judul / Keterangan</th>
            <th className="px-4 py-3">Tipe</th>
            <th className="px-4 py-3">Nominal</th>
            <th className="px-4 py-3">Tanggal</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
