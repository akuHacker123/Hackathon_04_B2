import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-user';
import { getDashboardData } from '@/lib/actions/dashboard';
import { getMonthlyBudget } from '@/lib/actions/budget';
import { getCurrentMonthKey, MonthlyBudgetData } from '@/lib/utils/budget';
import DashboardView from '@/components/dashboard/DashboardView';

import { AppLayout } from '@/components/layout/AppLayout';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  const currentMonth = getCurrentMonthKey();
  const [dashboard, budgetResult] = await Promise.all([
    getDashboardData(),
    getMonthlyBudget(currentMonth),
  ]);

  const initialBudgetData: MonthlyBudgetData = budgetResult.data ?? {
    month: currentMonth,
    budgetAmount: null,
    totalExpense: '0.00',
    remaining: null,
    percentage: null,
    isOverBudget: false,
    hasBudget: false,
  };

  return (
    <AppLayout user={{ name: user.name, email: user.email }}>
      <DashboardView
        name={user.name}
        balance={dashboard.balance}
        totalIncome={dashboard.totalIncome}
        totalExpense={dashboard.totalExpense}
        isDeficit={dashboard.isDeficit}
        recentTransactions={dashboard.recentTransactions}
        initialBudgetData={initialBudgetData}
      />
    </AppLayout>
  );
}
