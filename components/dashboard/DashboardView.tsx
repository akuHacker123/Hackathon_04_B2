type Transaction = {
  id: string;
  title: string;
  amount: string;
  type: 'income' | 'expense';
  transactionDate: Date;
};

type DashboardViewProps = {
  name: string;
  balance: string;
  totalIncome: string;
  totalExpense: string;
  isDeficit: boolean;
  recentTransactions: Transaction[];
};

function rupiah(amount: string) {
  const [integer, fraction = ''] = amount.split('.');
  const negative = integer.startsWith('-');
  const decimals = fraction.replace(/0+$/, '');
  const formattedInteger = new Intl.NumberFormat('id-ID').format(BigInt(negative ? integer.slice(1) : integer));
  return `${negative ? '-' : ''}Rp ${formattedInteger}${decimals ? `,${decimals}` : ''}`;
}

export default function DashboardView({
  name,
  balance,
  totalIncome,
  totalExpense,
  isDeficit,
  recentTransactions,
}: DashboardViewProps) {
  const summaries = [
    { label: 'Saldo saat ini', value: balance, color: 'text-slate-950' },
    { label: 'Total pemasukan', value: totalIncome, color: 'text-emerald-700' },
    { label: 'Total pengeluaran', value: totalExpense, color: 'text-rose-700' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-medium text-slate-500">Ringkasan keuangan</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Halo, {name}</h1>
          <p className="mt-2 text-slate-600">Pantau kondisi keuanganmu hari ini.</p>
        </header>

        {isDeficit && (
          <aside role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
            <p className="font-semibold">Saldo kamu sedang defisit</p>
            <p className="mt-1 text-sm">Pengeluaran lebih besar daripada pemasukan. Periksa kembali transaksi terbaru.</p>
          </aside>
        )}

        <section aria-label="Ringkasan saldo" className="grid gap-4 sm:grid-cols-3">
          {summaries.map(({ label, value, color }) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-medium text-slate-500">{label}</h2>
              <p className={`mt-3 text-2xl font-semibold tracking-tight ${color}`}>{rupiah(value)}</p>
            </article>
          ))}
        </section>

        <section aria-labelledby="recent-transactions" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 id="recent-transactions" className="font-semibold">Transaksi terbaru</h2>
            <p className="mt-1 text-sm text-slate-500">Lima transaksi terakhir milikmu.</p>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">Belum ada transaksi.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{transaction.title}</p>
                    <time className="mt-1 block text-sm text-slate-500" dateTime={transaction.transactionDate.toISOString().slice(0, 10)}>
                      {transaction.transactionDate.toLocaleDateString('id-ID', { timeZone: 'UTC', dateStyle: 'medium' })}
                    </time>
                  </div>
                  <p className={`shrink-0 font-semibold ${transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{rupiah(transaction.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
