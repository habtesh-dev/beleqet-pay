import { TransactionTable } from '../../components/TransactionTable';

async function getTransactions() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/v1/merchants/transactions`, { cache: 'no-store' });
    if (!res.ok) throw new Error('bad response');
    return res.json();
  } catch {
    return [];
  }
}

export default async function TransactionsPage() {
  const rows = await getTransactions();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Transactions</h2>
      <TransactionTable rows={rows} />
    </div>
  );
}
