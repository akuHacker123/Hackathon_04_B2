import { notFound, forbidden } from 'next/navigation';
import { getTransactionById } from '@/lib/actions/transactions';
import EditTransactionClient from './EditTransactionClient';

interface EditTransactionPageProps {
  params: Promise<{ id: string }>;
}

/**
 * FR-11 & AC-07: Proteksi akses rute edit
 * Given transaksi milik User A, when User B mencoba mengakses rute edit terhadap
 * ID transaksi User A, then sistem mengembalikan HTTP 403 Forbidden.
 */
export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const res = await getTransactionById(id);

  if (res.status === 404) {
    notFound();
  }

  // AC-07: Sistem menolak dengan respon HTTP 403 Forbidden bila bukan milik pengguna aktif
  if (res.status === 403) {
    forbidden();
  }

  if (!res.success || !res.data) {
    throw new Error(res.error || 'Gagal memuat transaksi.');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <EditTransactionClient transaction={res.data} />
    </div>
  );
}
