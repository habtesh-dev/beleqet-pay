import { StatCard } from '../../components/StatCard';

async function getOverview() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/v1/merchants/overview`, { cache: 'no-store' });
    if (!res.ok) throw new Error('bad response');
    return res.json();
  } catch {
    // Dashboard renders with placeholders if the API isn't reachable yet
    // (e.g. during local `next dev` before docker-compose is up) — it never
    // throws a raw stack trace at a merchant.
    return { totalVolume: '0.00', totalTx: 0, successRate: '0%' };
  }
}

export default async function OverviewPage() {
  const data = await getOverview();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Overview</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total volume" value={`${data.totalVolume} ETB`} />
        <StatCard label="Transactions" value={String(data.totalTx)} />
        <StatCard label="Success rate" value={data.successRate} />
      </div>
    </div>
  );
}
