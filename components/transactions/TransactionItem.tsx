'use client';

import React from 'react';
import { TransactionDTO } from '@/lib/actions/transactions';

interface TransactionItemProps {
  transaction: TransactionDTO;
  onEdit?: (transaction: TransactionDTO) => void;
  onDelete?: (transaction: TransactionDTO) => void;
}

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  // Format mata uang Rupiah sesuai SRS Bagian 12
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const isIncome = transaction.type === 'income';

  return (
    <tr className="border-b transition-colors hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        <div>{transaction.title}</div>
        {transaction.notes && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {transaction.notes}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isIncome
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
          }`}
        >
          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
        </span>
      </td>
      <td
        className={`px-4 py-3 text-sm font-semibold ${
          isIncome
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-rose-600 dark:text-rose-400'
        }`}
      >
        {isIncome ? '+' : '-'} {formatRupiah(transaction.amount)}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
        {transaction.transactionDate}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <div className="flex justify-end gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ubah
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Hapus
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
