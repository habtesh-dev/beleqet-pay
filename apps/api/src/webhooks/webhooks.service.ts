import { Injectable } from '@nestjs/common';
import { PrismaService } from '../merchants/prisma.service';
import { PaymentSettlementQueue } from '../queues/payment-settlement.queue';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService, private queue: PaymentSettlementQueue) {}

  /**
   * Fast-Ack path: log the (already signature-verified) webhook, then push
   * to BullMQ and return immediately. The 200 OK must go back to
   * Chapa/Stripe fast or they'll retry-storm us; all real business logic
   * (double-verify, ledger posting, feature unlocking, notifications)
   * happens in the async worker, not in this request/response cycle.
   */
  async handleVerifiedWebhook(provider: 'CHAPA' | 'STRIPE', payload: any, ip: string | undefined) {
    const txRef = provider === 'CHAPA' ? payload.tx_ref : payload.data?.object?.metadata?.tx_ref;

    await this.prisma.webhookAuditLog.create({
      data: { provider, txRef, ip, verified: true, rawPayload: payload },
    });

    await this.queue.enqueueSettlement({ provider, txRef, rawEvent: payload });
    return { received: true };
  }
}
