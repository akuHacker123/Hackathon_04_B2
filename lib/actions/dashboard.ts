import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client';

export async function getDashboardData(userId: string) {
  const [income, expense, recentTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'income' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'expense' },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
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
