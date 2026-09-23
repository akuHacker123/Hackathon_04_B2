import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-user';
import { getDashboardData } from '@/lib/actions/dashboard';
import DashboardView from '@/components/dashboard/DashboardView';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  const dashboard = await getDashboardData(user.id);

  return <DashboardView name={user.name} {...dashboard} />;
}
