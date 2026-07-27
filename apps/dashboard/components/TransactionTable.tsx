type Tx = { txRef: string; amount: string; currency: string; provider: string; status: string; createdAt: string };

export function TransactionTable({ rows }: { rows: Tx[] }) {
  return (
    <table className="w-full text-sm bg-white rounded-xl overflow-hidden shadow-sm">
      <thead className="bg-slate-100 text-left">
        <tr>
          <th className="p-3">Tx Ref</th>
          <th className="p-3">Amount</th>
          <th className="p-3">Provider</th>
          <th className="p-3">Status</th>
          <th className="p-3">Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.txRef} className="border-t border-slate-100">
            <td className="p-3 font-mono text-xs">{r.txRef}</td>
            <td className="p-3">{r.amount} {r.currency}</td>
            <td className="p-3">{r.provider}</td>
            <td className="p-3">
              <span className={`px-2 py-1 rounded-full text-xs ${
                r.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                r.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>{r.status}</span>
            </td>
            <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
