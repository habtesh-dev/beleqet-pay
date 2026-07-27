export interface BeleqetPayConfig {
  publicKey: string; // never the secret key — this SDK runs in the browser/app
  apiBaseUrl?: string;
}

export interface CheckoutParams {
  amount: string;
  currency: 'ETB' | 'USD';
  customerEmail: string;
  successRedirectUrl: string;
  metadata?: Record<string, unknown>;
}

/**
 * Lightweight embeddable checkout client. Mirrors how Chapa's own inline.js
 * and Stripe.js work: this SDK only ever talks to your NestJS backend
 * (which holds the real secret key) — it never touches CHAPA_SECRET_KEY or
 * STRIPE_SECRET_KEY directly, so a compromised frontend bundle can't leak
 * server credentials.
 */
export class BeleqetPay {
  private apiBaseUrl: string;

  constructor(private config: BeleqetPayConfig) {
    this.apiBaseUrl = config.apiBaseUrl ?? 'https://api.beleqet.pay';
  }

  /** Calls your backend's /v1/checkout/sessions (which itself calls Chapa/Stripe), then redirects. */
  async openCheckout(params: CheckoutParams): Promise<void> {
    const res = await fetch(`${this.apiBaseUrl}/v1/checkout/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.config.publicKey}` },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Beleqet Pay checkout session failed: ${res.status} ${await res.text()}`);
    }

    const { checkoutUrl } = await res.json();
    if (typeof window !== 'undefined') {
      window.location.href = checkoutUrl;
    }
  }

  /** Poll helper for merchants who don't want to stand up their own webhook receiver right away. */
  async pollStatus(txRef: string, { intervalMs = 3000, timeoutMs = 120000 } = {}): Promise<'SUCCESS' | 'FAILED' | 'PENDING'> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await fetch(`${this.apiBaseUrl}/v1/transactions/${txRef}`, {
        headers: { Authorization: `Bearer ${this.config.publicKey}` },
      });
      const data = await res.json();
      if (data.status !== 'PENDING') return data.status;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    return 'PENDING';
  }
}

export default BeleqetPay;
