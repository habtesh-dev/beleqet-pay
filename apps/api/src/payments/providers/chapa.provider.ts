import { Injectable, BadGatewayException } from '@nestjs/common';
import axios from 'axios';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  PaymentProvider,
  InitializeChargeInput,
  InitializeChargeResult,
  VerifyChargeResult,
} from './payment-provider.interface';

/**
 * Chapa handles the local ETB rails: Telebirr, CBE Birr, Amole, HelloCash,
 * and local card networks. Docs: https://developer.chapa.co
 */
@Injectable()
export class ChapaProvider implements PaymentProvider {
  readonly name = 'CHAPA' as const;
  private readonly baseUrl = process.env.CHAPA_BASE_URL ?? 'https://api.chapa.co/v1';
  private readonly secretKey = process.env.CHAPA_SECRET_KEY ?? '';

  async initializeCharge(input: InitializeChargeInput): Promise<InitializeChargeResult> {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount: input.amount,
          currency: input.currency,
          email: input.customerEmail,
          tx_ref: input.txRef,
          callback_url: input.successRedirectUrl,
          customization: { title: 'Beleqet Pay', description: 'Secure checkout' },
        },
        { headers: { Authorization: `Bearer ${this.secretKey}` } },
      );

      return { checkoutUrl: data.data.checkout_url, providerRef: input.txRef };
    } catch (err: any) {
      throw new BadGatewayException(`Chapa initialize failed: ${err.response?.data?.message ?? err.message}`);
    }
  }

  async verifyCharge(txRef: string): Promise<VerifyChargeResult> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/transaction/verify/${txRef}`, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });

      const status = data.data.status === 'success' ? 'SUCCESS' : 'FAILED';
      return {
        status,
        amount: String(data.data.amount),
        currency: data.data.currency,
        providerRef: txRef,
      };
    } catch (err: any) {
      throw new BadGatewayException(`Chapa verify failed: ${err.response?.data?.message ?? err.message}`);
    }
  }

  /**
   * Chapa signs webhooks with HMAC-SHA256 over the raw body using your
   * secret key, sent in the `x-chapa-signature` header. We recompute and
   * compare with a constant-time check to avoid timing side-channels.
   */
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;
    const secret = process.env.CHAPA_WEBHOOK_SECRET ?? '';
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
}
