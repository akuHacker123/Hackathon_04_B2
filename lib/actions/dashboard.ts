'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client';
import { getCurrentUser } from '@/lib/auth/get-user';

export interface DashboardTransaction {
  id: string;
  title: string;
  amount: string;
  type: 'income' | 'expense';
  transactionDate: Date;
}

export interface DashboardData {
  totalIncome: string;
  totalExpense: string;
  balance: string;
  isDeficit: boolean;
  recentTransactions: DashboardTransaction[];
}

export async function getDashboardData(userId?: string): Promise<DashboardData> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    throw new Error('Tidak terautentikasi. Silakan login terlebih dahulu.');
  }

  // Selalu gunakan ID dari sesi pengguna aktif (BR-02 & Aturan 5)
  const activeUserId = user.id;

  const [income, expense, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: activeUserId, type: 'income' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: activeUserId, type: 'expense' },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId: activeUserId },
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: { id: true, title: true, amount: true, type: true, transactionDate: true },
    }),
  ]);

  const totalIncome = income._sum.amount ?? new Prisma.Decimal(0);
  const totalExpense = expense._sum.amount ?? new Prisma.Decimal(0);
  const balance = totalIncome.minus(totalExpense);

  return {
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
    balance: balance.toFixed(2),
    isDeficit: balance.isNegative(),
    recentTransactions: recentTransactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toFixed(2),
    })),
  };
}
