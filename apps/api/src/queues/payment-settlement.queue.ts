import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

const connection = { url: process.env.REDIS_URL ?? 'redis://localhost:6379' };

/** Fast-Ack Webhook Queue Producer — pushes verified webhook events for async processing. */
@Injectable()
export class PaymentSettlementQueue {
  private queue = new Queue('payment-settlement', { connection: connection as any });

  async enqueueSettlement(job: { provider: 'CHAPA' | 'STRIPE'; txRef: string; rawEvent: any }) {
    // jobId = txRef gives BullMQ free de-duplication of identical in-flight jobs,
    // on top of the Idempotency Guard used at the HTTP layer.
    await this.queue.add('settle', job, {
      jobId: job.txRef,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}
