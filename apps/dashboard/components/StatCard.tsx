export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {sub && <p className="text-xs text-emerald-600 mt-1">{sub}</p>}
    </div>
  );
}
