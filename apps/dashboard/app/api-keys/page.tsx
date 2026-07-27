export default function ApiKeysPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">API Keys</h2>
      <p className="text-slate-600 text-sm">
        Generate keys from <code className="bg-slate-100 px-1 rounded">POST /v1/merchants/:id/api-keys</code>.
        The raw key is shown once at creation time and is never retrievable again — only its hash is stored.
      </p>
    </div>
  );
}
