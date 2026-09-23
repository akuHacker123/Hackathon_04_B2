import React from "react";
import { Navbar, type NavbarUser } from "./Navbar";

export interface AppLayoutProps {
  children: React.ReactNode;
  user?: NavbarUser | null;
  className?: string;
}

/**
 * App Shell Layout
 * Digunakan sebagai layout utama untuk halaman terproteksi (Dashboard & Transaksi)
 */
export function AppLayout({ children, user, className = "" }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      <Navbar user={user} />
      <main
        className={`mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 ${className}`.trim()}
      >
        {children}
      </main>
      <footer className="mt-auto border-t border-zinc-200 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
        <p>ExpenseTracker • Hackathon 04 Kelompok B2</p>
      </footer>
    </div>
  );
}
