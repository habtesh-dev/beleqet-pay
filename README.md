++++++++++++++++++++++++++++++++++++++++++++++++++++++# Beleqet Pay — Monorepo

A payment gateway platform scaffold: NestJS core API with a double-entry
ledger, Chapa (Telebirr/CBE Birr/Amole) + Stripe (international USD)
integrations, a Next.js merchant dashboard, an Expo merchant mobile app, a
TypeScript checkout SDK, and 10 rule-based "AI" services (fraud scoring,
smart routing, KYC checks, dispute triage, cashflow forecasting, dynamic
pricing, chargeback evidence, FX rates, anomaly detection, payout
scheduling).

## What's real here vs. what still needs your input

**Real, working logic:**
- Chapa & Stripe HMAC/SDK webhook signature verification (constant-time compare)
- Idempotency at both the HTTP layer (Redis SET NX) and the settlement worker (DB status check)
- Double-entry ledger that refuses to post unbalanced entries
- BullMQ async settlement pipeline with exponential-backoff retries
- Double-verification (never trusts a webhook body's amount — always calls the provider back)
- API key hashing (sha256+salt; raw keys are shown once, never stored)

**Explicitly a starting point, not a finished product:**
- The 10 "AI" services are transparent rule/heuristic engines, not models trained on
  real transaction data — nobody can hand you a production fraud model without your
  actual labeled history. They're built so a trained model can replace the internals
  later without touching any calling code.
- KYC is a field-validation stub — real identity verification needs a licensed vendor
  (Smile Identity, Onfido, etc.).
- Nothing here is PCI-DSS certified, bank-licensed, or legally authorized to move real
  money. That requires an actual compliance audit and banking/licensing relationships —
  no codebase can substitute for that.
- The mobile app has 3 working screens (home, wallet, QR generator); push notifications
  are wired to the same Redis Pub/Sub channel the API publishes to, but the Expo push
  token registration needs your real Expo project ID to test end-to-end.

## Running it locally

```bash
cp .env.example .env          # fill in real Chapa/Stripe TEST keys
docker compose up -d          # Postgres + Redis
npm install
npm run --workspace=apps/api prisma:migrate
npm run --workspace=apps/api start:dev     # API on :4000
npm run --workspace=apps/dashboard dev     # Dashboard on :3000
npm run --workspace=apps/mobile start      # Expo
```

## Running the e2e tests

```bash
npm run --workspace=apps/api test:e2e
```
Requires Postgres + Redis reachable (`docker compose up -d`) and
`CHAPA_WEBHOOK_SECRET` set in your environment — the signature tests
compute a real HMAC and check the guard against it.

## Directory layout

```
apps/
  api/         NestJS core: payments, webhooks, ledger, queues, ai, merchants, auth
  dashboard/   Next.js 15 merchant/admin dashboard
  mobile/      Expo merchant app (wallet, QR generator)
packages/
  checkout-sdk/  Embeddable TS checkout client
scripts/
  build-and-zip.sh
```
