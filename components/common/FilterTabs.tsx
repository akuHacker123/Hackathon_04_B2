"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  type FilterPreference,
  FILTER_COOKIE_NAME,
  setClientFilterCookie,
  getClientFilterCookie,
  parseFilterCookie,
} from "@/lib/cookies";
import { setFilterPreferenceAction } from "@/lib/actions/cookies";

export interface FilterTabsProps {
  /**
   * Nilai filter awal (biasanya dibaca dari cookie di Server Component dan dioper ke sini)
   */
  initialFilter?: FilterPreference;

  /**
   * Callback saat filter berubah (opsional, untuk filtering sisi klien)
   */
  onFilterChange?: (filter: FilterPreference) => void;

  /**
   * Apakah perlu menyelaraskan nilai filter ke URL search param ?type=... (default: true)
   */
  syncUrl?: boolean;

  className?: string;
}

const FILTER_OPTIONS: {
  value: FilterPreference;
  label: string;
  icon?: React.ReactNode;
}[] = [
  {
    value: "all",
    label: "Semua",
  },
  {
    value: "income",
    label: "Pemasukan",
  },
  {
    value: "expense",
    label: "Pengeluaran",
  },
];

/**
 * FilterTabs Component
 * Memenuhi FR-12, FR-13, FR-14, BR-06, AC-08, dan AC-09:
 * - Menyajikan tombol filter Semua / Pemasukan / Pengeluaran
 * - Menyimpan preferensi ke cookie (client & server action)
 * - Menerapkan filter aktif dari cookie secara otomatis
 */
export function FilterTabs({
  initialFilter,
  onFilterChange,
  syncUrl = true,
  className = "",
}: FilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Inisialisasi state filter: utamakan prop initialFilter, jika tidak ada baca dari cookie browser
  const [activeFilter, setActiveFilter] = useState<FilterPreference>(() => {
    if (initialFilter) return parseFilterCookie(initialFilter);
    return parseFilterCookie(getClientFilterCookie());
  });

  // Saat pertama kali mount, pastikan sync dengan cookie atau query param jika prop tidak diisi
  useEffect(() => {
    if (!initialFilter) {
      const savedCookie = getClientFilterCookie();
      setActiveFilter(savedCookie);
      if (onFilterChange) {
        onFilterChange(savedCookie);
      }
    }
  }, [initialFilter, onFilterChange]);

  const handleSelectFilter = (newFilter: FilterPreference) => {
    if (newFilter === activeFilter) return;

    setActiveFilter(newFilter);

    // 1. Simpan ke Cookie Browser via Client Helper (FR-13, BR-06, AC-08)
    setClientFilterCookie(newFilter);

    // 2. Simpan juga via Server Action di latar belakang untuk konsistensi server session/cookies
    startTransition(async () => {
      try {
        await setFilterPreferenceAction(newFilter);
      } catch (err) {
        console.error("Gagal sinkronisasi cookie server action:", err);
      }

      // 3. Update URL search param jika diminta agar server component otomatis re-render
      if (syncUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (newFilter === "all") {
          params.delete("type");
        } else {
          params.set("type", newFilter);
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        router.refresh();
      }
    });

    // 4. Panggil callback jika ada
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800 ${className}`.trim()}
      role="tablist"
      aria-label="Filter jenis transaksi"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value;

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            disabled={isPending}
            onClick={() => handleSelectFilter(option.value)}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-900 dark:text-emerald-400"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            } disabled:opacity-60`}
          >
            {option.value === "income" && (
              <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            )}
            {option.value === "expense" && (
              <span className="mr-1.5 h-2 w-2 rounded-full bg-rose-500 inline-block" />
            )}
            {option.value === "all" && (
              <span className="mr-1.5 h-2 w-2 rounded-full bg-zinc-400 inline-block" />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
