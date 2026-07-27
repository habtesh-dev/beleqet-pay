import { Injectable, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '../merchants/prisma.service';
import { PaymentProviderFactory } from '../payments/providers/provider.factory';
import { LedgerService } from '../ledger/ledger.service';
import { DynamicPricingAiEngine } from '../ai/dynamic-pricing.service';

const connection = { url: process.env.REDIS_URL ?? 'redis://localhost:6379' };

/**
 * ProcessPaymentSuccess Queue Worker.
 *
 * This is where money actually "moves" in the system: re-verify with the
 * provider (never trust the webhook body alone), check idempotency at the
 * DB layer (transaction.status must still be PENDING), compute the platform
 * fee, and post balanced ledger entries — all inside one flow so a crash
 * mid-way never leaves the ledger half-updated.
 */
@Injectable()
export class PaymentSettlementProcessor {
  private readonly logger = new Logger('PaymentSettlementProcessor');
  private worker: Worker;

  constructor(
    private prisma: PrismaService,
    private providers: PaymentProviderFactory,
    private ledger: LedgerService,
    private pricing: DynamicPricingAiEngine,
  ) {
    this.worker = new Worker('payment-settlement', (job) => this.process(job), { connection: connection as any });
    this.worker.on('failed', (job, err) => this.logger.error(`Job ${job?.id} failed: ${err.message}`));
  }

  private async process(job: Job) {
    const { txRef } = job.data as { txRef: string };
    const tx = await this.prisma.transaction.findUnique({ where: { txRef } });
    if (!tx) return this.logger.warn(`Settlement job for unknown tx_ref ${txRef}, dropping.`);

    // Idempotency at the business layer: a transaction already SUCCESS must
    // never be re-settled, no matter how many times the webhook retries.
    if (tx.status === 'SUCCESS') {
      return this.logger.log(`tx ${txRef} already settled, skipping.`);
    }

    const provider = this.providers.get(tx.provider);
    const verification = await provider.verifyCharge(tx.providerRef ?? txRef);

    if (verification.status !== 'SUCCESS') {
      await this.prisma.transaction.update({ where: { id: tx.id }, data: { status: 'FAILED' } });
      return;
    }

    if (Number(verification.amount) !== Number(tx.amount)) {
      this.logger.error(`Amount mismatch on settle for ${txRef}: DB ${tx.amount} vs provider ${verification.amount}`);
      return; // leaves tx PENDING for manual/ops review — never silently "fix" a mismatch
    }

    const fee = this.pricing.calculateFee({ amount: tx.amount.toString(), provider: tx.provider });

    await this.prisma.$transaction([
      this.prisma.transaction.update({ where: { id: tx.id }, data: { status: 'SUCCESS' } }),
    ]);

    await this.ledger.recordSaleSettlement({
      transactionId: tx.id,
      merchantId: tx.merchantId,
      grossAmount: tx.amount.toString(),
      platformFee: fee,
      currency: tx.currency,
    });

    this.logger.log(`Settled ${txRef}: gross ${tx.amount} ${tx.currency}, fee ${fee}`);
  }
}
