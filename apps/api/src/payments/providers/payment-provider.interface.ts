export interface InitializeChargeInput {
  txRef: string;
  amount: string;
  currency: string;
  customerEmail: string;
  successRedirectUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeChargeResult {
  checkoutUrl: string;
  providerRef: string;
}

export interface VerifyChargeResult {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: string;
  currency: string;
  providerRef: string;
}

/**
 * Every gateway (Chapa, Stripe, future rails) implements this same shape so
 * the rest of the system (webhooks, ledger, queues) never has to branch on
 * "which provider is this" outside of PaymentProviderFactory.
 */
export interface PaymentProvider {
  readonly name: 'CHAPA' | 'STRIPE';
  initializeCharge(input: InitializeChargeInput): Promise<InitializeChargeResult>;
  verifyCharge(txRef: string): Promise<VerifyChargeResult>;
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean;
}
