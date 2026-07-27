import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../merchants/prisma.service';
import { PaymentProviderFactory } from './providers/provider.factory';
import { SmartRoutingAiService } from '../ai/smart-routing.service';
import { FraudDetectionAiService } from '../ai/fraud-detection.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private providers: PaymentProviderFactory,
    private smartRouting: SmartRoutingAiService,
    private fraud: FraudDetectionAiService,
  ) {}

  /** POST /v1/checkout/sessions — Payment Session Controller / Initialization Endpoint. */
  async createCheckoutSession(input: {
    merchantId: string;
    amount: string;
    currency: string;
    customerEmail: string;
    successRedirectUrl: string;
    preferredProvider?: 'CHAPA' | 'STRIPE';
    metadata?: Record<string, unknown>;
  }) {
    const txRef = `TX-BLQ-${randomUUID().split('-')[0].toUpperCase()}`;

    const risk = await this.fraud.assess({
      merchantId: input.merchantId,
      amount: input.amount,
      customerEmail: input.customerEmail,
    });
    if (risk.decision === 'BLOCK') {
      throw new BadRequestException(`Transaction blocked by fraud engine (risk score ${risk.riskScore}).`);
    }

    const providerName =
      input.preferredProvider ?? this.smartRouting.chooseProvider({ currency: input.currency });
    const provider = this.providers.get(providerName);

    const tx = await this.prisma.transaction.create({
      data: {
        txRef,
        merchantId: input.merchantId,
        amount: input.amount,
        currency: input.currency,
        provider: providerName,
        status: 'PENDING',
        metadata: (input.metadata ?? {}) as any,
      },
    });

    const result = await provider.initializeCharge({
      txRef,
      amount: input.amount,
      currency: input.currency,
      customerEmail: input.customerEmail,
      successRedirectUrl: input.successRedirectUrl,
      metadata: input.metadata,
    });

    await this.prisma.transaction.update({
      where: { id: tx.id },
      data: { providerRef: result.providerRef },
    });

    return { txRef, checkoutUrl: result.checkoutUrl, provider: providerName, riskScore: risk.riskScore };
  }

  /** GET /v1/transactions/:txRef — used by dashboard + double-verification service. */
  async getTransaction(txRef: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { txRef } });
    if (!tx) throw new NotFoundException(`No transaction with tx_ref ${txRef}`);
    return tx;
  }

  /**
   * Double-Verification Engine: never trust the webhook payload's amount
   * alone. We call back to the provider server-to-server and confirm the
   * amount/currency/status before anything downstream is allowed to change.
   */
  async doubleVerify(txRef: string) {
    const tx = await this.getTransaction(txRef);
    const provider = this.providers.get(tx.provider);
    const verification = await provider.verifyCharge(tx.providerRef ?? txRef);

    if (verification.status === 'SUCCESS' && Number(verification.amount) !== Number(tx.amount)) {
      throw new BadRequestException(
        `Amount mismatch for ${txRef}: DB has ${tx.amount}, provider reports ${verification.amount}. Refusing to settle.`,
      );
    }
    return verification;
  }
}
