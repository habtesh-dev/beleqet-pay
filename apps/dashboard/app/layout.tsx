import './globals.css';

export const metadata = { title: 'Beleqet Pay — Merchant Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex">
          <aside className="w-60 bg-brand-dark text-white p-6 space-y-4">
            <h1 className="text-xl font-bold">Beleqet Pay</h1>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="/overview">Overview</a>
              <a href="/transactions">Transactions</a>
              <a href="/payouts">Payouts</a>
              <a href="/api-keys">API Keys</a>
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
