'use client';

import React from 'react';
import Link from 'next/link';
import BudgetSection from './BudgetSection';
import { MonthlyBudgetData } from '@/lib/actions/budget';

type Transaction = {
  id: string;
  title: string;
  amount: string;
  type: 'income' | 'expense';
  transactionDate: Date | string;
};

type DashboardViewProps = {
  name: string;
  balance: string;
  totalIncome: string;
  totalExpense: string;
  isDeficit: boolean;
  recentTransactions: Transaction[];
  initialBudgetData: MonthlyBudgetData;
};

function formatRupiah(amount: string) {
  const [integer, fraction = ''] = amount.split('.');
  const negative = integer.startsWith('-');
  const cleanInt = negative ? integer.slice(1) : integer;
  const decimals = fraction.replace(/0+$/, '');
  const formattedInteger = new Intl.NumberFormat('id-ID').format(
    BigInt(cleanInt || '0')
  );
  return `${negative ? '-' : ''}Rp ${formattedInteger}${decimals ? `,${decimals}` : ''}`;
}

export default function DashboardView({
  name,
  balance,
  totalIncome,
  totalExpense,
  isDeficit,
  recentTransactions,
  initialBudgetData,
}: DashboardViewProps) {
  const summaries = [
    {
      label: 'Saldo Saat Ini',
      value: balance,
      description: isDeficit ? 'Defisit keuangan' : 'Akumulasi saldo bersih',
    },
    {
      label: 'Total Pemasukan',
      value: totalIncome,
      description: 'Seluruh riwayat pemasukan',
    },
    {
      label: 'Total Pengeluaran',
      value: totalExpense,
      description: 'Seluruh riwayat pengeluaran',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Ringkasan Keuangan
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Halo, {name}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Pantau kondisi saldo, anggaran bulanan, dan transaksi terbaru Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/transactions"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Kelola Transaksi &rarr;
          </Link>
        </div>
      </header>

      {/* Alert Saldo Defisit (BR-04) */}
      {isDeficit && (
        <aside
          role="status"
          className="rounded-2xl border border-zinc-900 bg-zinc-900 p-5 text-zinc-100 shadow-sm dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-semibold text-base">Perhatian: Saldo Anda Sedang Defisit</p>
              <p className="mt-1 text-sm text-zinc-300 dark:text-zinc-700 leading-relaxed">
                Total pengeluaran akumulatif Anda telah melampaui total pemasukan. Pertimbangkan untuk membatasi pengeluaran non-esensial dan menyesuaikan anggaran bulanan Anda.
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Summary Cards Grid */}
      <section aria-label="Ringkasan Saldo" className="grid gap-4 sm:grid-cols-3">
        {summaries.map(({ label, value, description }) => (
          <article
            key={label}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {formatRupiah(value)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
          </article>
        ))}
      </section>

      {/* Monthly Budget Management Flow (FR-16, FR-17, FR-18, FR-19) */}
      <BudgetSection initialBudgetData={initialBudgetData} />

      {/* Recent Transactions List (FR-06, FR-09) */}
      <section
        aria-labelledby="recent-transactions-heading"
        className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2
              id="recent-transactions-heading"
              className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              Transaksi Terbaru
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Lima transaksi terakhir yang dicatat pada akun Anda.
            </p>
          </div>
          <Link
            href="/transactions"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Belum ada transaksi yang dicatat.
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Mulai catat transaksi pemasukan atau pengeluaran Anda.
            </p>
            <div className="mt-4">
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-black dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                + Tambah Transaksi Pertama
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentTransactions.map((transaction) => {
              const txDate =
                typeof transaction.transactionDate === 'string'
                  ? new Date(transaction.transactionDate)
                  : transaction.transactionDate;

              return (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {transaction.title}
                    </p>
                    <time
                      className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400"
                      dateTime={
                        txDate instanceof Date && !isNaN(txDate.getTime())
                          ? txDate.toISOString().slice(0, 10)
                          : ''
                      }
                    >
                      {txDate instanceof Date && !isNaN(txDate.getTime())
                        ? txDate.toLocaleDateString('id-ID', {
                            timeZone: 'UTC',
                            dateStyle: 'medium',
                          })
                        : '-'}
                    </time>
                  </div>
                  <div className="text-right">
                    <p
                      className={`shrink-0 font-bold text-sm tracking-tight ${
                        transaction.type === 'income'
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatRupiah(transaction.amount)}
                    </p>
                    <span className="inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
