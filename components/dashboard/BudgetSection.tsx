'use client';

import React, { useState, useTransition } from 'react';
import {
  getMonthlyBudget,
  saveMonthlyBudget,
} from '@/lib/actions/budget';
import { MonthlyBudgetData } from '@/lib/utils/budget';


interface BudgetSectionProps {
  initialBudgetData: MonthlyBudgetData;
}

function formatRupiah(amountStr: string | null | undefined): string {
  if (amountStr === null || amountStr === undefined) return '-';
  const num = Number(amountStr);
  if (isNaN(num)) return '-';

  const [integer, fraction = ''] = amountStr.split('.');
  const isNegative = integer.startsWith('-');
  const cleanInt = isNegative ? integer.slice(1) : integer;
  const decimals = fraction.replace(/0+$/, '');

  const formattedInteger = new Intl.NumberFormat('id-ID').format(
    BigInt(cleanInt || '0')
  );
  return `${isNegative ? '-' : ''}Rp ${formattedInteger}${decimals ? `,${decimals}` : ''}`;
}

function formatMonthLabel(monthKey: string): string {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) return monthKey;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BudgetSection({ initialBudgetData }: BudgetSectionProps) {
  const [budgetData, setBudgetData] = useState<MonthlyBudgetData>(initialBudgetData);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialBudgetData.month);
  const [amountInput, setAmountInput] = useState<string>(
    initialBudgetData.budgetAmount ? Math.round(Number(initialBudgetData.budgetAmount)).toString() : ''
  );
  const [isEditing, setIsEditing] = useState<boolean>(!initialBudgetData.hasBudget);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPendingMonth, startTransitionMonth] = useTransition();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleMonthChange = (newMonth: string) => {
    if (!newMonth) return;
    setSelectedMonth(newMonth);
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);

    startTransitionMonth(async () => {
      try {
        const res = await getMonthlyBudget(newMonth);
        if (res.success && res.data) {
          setBudgetData(res.data);
          setAmountInput(
            res.data.budgetAmount
              ? Math.round(Number(res.data.budgetAmount)).toString()
              : ''
          );
          setIsEditing(!res.data.hasBudget);
        } else {
          setErrorMessage(res.error || 'Gagal memuat data anggaran untuk bulan ini.');
        }
      } catch {
        setErrorMessage('Terjadi kesalahan saat memuat anggaran.');
      }
    });
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const res = await saveMonthlyBudget(selectedMonth, amountInput);
      if (res.success && res.data) {
        setBudgetData(res.data);
        setAmountInput(
          res.data.budgetAmount
            ? Math.round(Number(res.data.budgetAmount)).toString()
            : ''
        );
        setIsEditing(false);
        setSuccessMessage('Anggaran bulanan berhasil disimpan.');
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan anggaran bulanan.');
        if (res.errors) {
          setFieldErrors(res.errors);
        }
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat menyimpan anggaran.');
    } finally {
      setIsSaving(false);
    }
  };

  const usagePercent = budgetData.percentage ?? 0;
  const progressWidth = Math.min(Math.max(usagePercent, 0), 100);

  return (
    <section aria-labelledby="budget-heading" className="space-y-6">
      {/* Alert Over Budget (Informative, sesuai FR-18) */}
      {budgetData.hasBudget && budgetData.isOverBudget && (
        <aside
          role="alert"
          aria-live="polite"
          className="rounded-2xl border border-zinc-900 bg-zinc-900 p-5 text-zinc-100 shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-semibold text-base">
                Peringatan: Pengeluaran Melampaui Anggaran
              </p>
              <p className="mt-1 text-sm text-zinc-300 dark:text-zinc-700 leading-relaxed">
                Total pengeluaran untuk bulan {formatMonthLabel(budgetData.month)} telah
                mencapai {formatRupiah(budgetData.totalExpense)}, melebihi anggaran yang
                ditetapkan ({formatRupiah(budgetData.budgetAmount)}). Peringatan ini
                bersifat informatif dan Anda tetap dapat mencatat transaksi keuangan.
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Main Budget Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-5 dark:border-zinc-800">
          <div>
            <h2 id="budget-heading" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Anggaran Bulanan
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Pantau batas pengeluaran dan kelola alokasi dana per bulan kalender.
            </p>
          </div>

          {/* Month Picker Control */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="month-select"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
            >
              Pilih Bulan:
            </label>
            <div className="relative">
              <input
                id="month-select"
                type="month"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                disabled={isPendingMonth || isSaving}
                className="h-10 rounded-lg border border-zinc-300 bg-zinc-50 px-3.5 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Global Error or Success Notifications */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-100 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            {successMessage}
          </div>
        )}

        {/* Budget Metrics Grid */}
        <div className={`mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isPendingMonth ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Card 1: Total Anggaran */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Anggaran
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {budgetData.hasBudget ? formatRupiah(budgetData.budgetAmount) : 'Belum diatur'}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Bulan {formatMonthLabel(budgetData.month)}
            </p>
          </div>

          {/* Card 2: Pengeluaran Bulan Terpilih */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Pengeluaran Bulan Ini
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {formatRupiah(budgetData.totalExpense)}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Khusus transaksi pengeluaran
            </p>
          </div>

          {/* Card 3: Sisa Anggaran */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Sisa Anggaran
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {budgetData.hasBudget ? formatRupiah(budgetData.remaining) : '-'}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {budgetData.hasBudget && Number(budgetData.remaining) < 0
                ? 'Melebihi anggaran (defisit)'
                : 'Sisa dana yang tersedia'}
            </p>
          </div>

          {/* Card 4: Persentase Penggunaan */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Penggunaan Anggaran
            </p>
            <p className="mt-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {budgetData.hasBudget ? `${budgetData.percentage}%` : '-'}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {budgetData.hasBudget && budgetData.isOverBudget
                ? 'Melampaui 100%'
                : 'Dari total alokasi'}
            </p>
          </div>
        </div>

        {/* Progress Bar Usage Indicator */}
        {budgetData.hasBudget && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <span>Indikator Penggunaan Anggaran</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {budgetData.percentage}% {budgetData.isOverBudget ? '(Terlampaui)' : ''}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  budgetData.isOverBudget
                    ? 'bg-zinc-900 dark:bg-zinc-100'
                    : 'bg-zinc-700 dark:bg-zinc-300'
                }`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        )}

        {/* Action & Budget Form Section */}
        <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          {!isEditing && budgetData.hasBudget ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Ingin mengubah anggaran untuk {formatMonthLabel(selectedMonth)}?
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Perubahan akan langsung memperbarui kalkulasi sisa dan persentase penggunaan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Ubah Nominal Anggaran
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {budgetData.hasBudget ? 'Perbarui Anggaran Bulanan' : 'Tetapkan Anggaran Bulanan'} ({formatMonthLabel(selectedMonth)})
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Masukkan nominal positif untuk menetapkan anggaran bulan ini.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-full sm:max-w-xs">
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-medium text-zinc-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="Contoh: 2000000"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      disabled={isSaving}
                      className={`h-11 w-full rounded-lg border bg-white pl-10 pr-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:bg-zinc-900 dark:text-zinc-100 ${
                        fieldErrors.amount
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100'
                      }`}
                    />
                  </div>
                  {fieldErrors.amount && (
                    <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {fieldErrors.amount[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving || !amountInput.trim()}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white cursor-pointer"
                  >
                    {isSaving
                      ? 'Menyimpan...'
                      : budgetData.hasBudget
                        ? 'Simpan Perubahan'
                        : 'Tetapkan Anggaran'}
                  </button>

                  {budgetData.hasBudget && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFieldErrors({});
                        setErrorMessage(null);
                        setAmountInput(
                          budgetData.budgetAmount
                            ? Math.round(Number(budgetData.budgetAmount)).toString()
                            : ''
                        );
                      }}
                      disabled={isSaving}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
