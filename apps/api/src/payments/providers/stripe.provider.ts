import { Injectable, BadGatewayException } from '@nestjs/common';
import Stripe from 'stripe';
import {
  PaymentProvider,
  InitializeChargeInput,
  InitializeChargeResult,
  VerifyChargeResult,
} from './payment-provider.interface';

/** Stripe handles international USD card rails and freelancer payouts (Connect). */
@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name = 'STRIPE' as const;
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });

  async initializeCharge(input: InitializeChargeInput): Promise<InitializeChargeResult> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        client_reference_id: input.txRef,
        customer_email: input.customerEmail,
        line_items: [
          {
            price_data: {
              currency: input.currency.toLowerCase(),
              product_data: { name: 'Beleqet Pay checkout' },
              unit_amount: Math.round(Number(input.amount) * 100),
            },
            quantity: 1,
          },
        ],
        success_url: input.successRedirectUrl,
        cancel_url: input.successRedirectUrl,
        metadata: { tx_ref: input.txRef, ...input.metadata },
      });

      return { checkoutUrl: session.url!, providerRef: session.id };
    } catch (err: any) {
      throw new BadGatewayException(`Stripe initialize failed: ${err.message}`);
    }
  }

  async verifyCharge(providerRef: string): Promise<VerifyChargeResult> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(providerRef);
      const status = session.payment_status === 'paid' ? 'SUCCESS' : 'PENDING';
      return {
        status,
        amount: String((session.amount_total ?? 0) / 100),
        currency: (session.currency ?? 'usd').toUpperCase(),
        providerRef,
      };
    } catch (err: any) {
      throw new BadGatewayException(`Stripe verify failed: ${err.message}`);
    }
  }

  /**
   * Uses Stripe's own SDK verifier (stripe.webhooks.constructEvent), which
   * checks the `Stripe-Signature` header against the raw body and rejects
   * timestamps outside the tolerance window (replay protection built in).
   */
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;
    try {
      this.stripe.webhooks.constructEvent(rawBody, signatureHeader, process.env.STRIPE_WEBHOOK_SECRET ?? '');
      return true;
    } catch {
      return false;
    }
  }
}
