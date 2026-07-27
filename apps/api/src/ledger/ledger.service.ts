import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../merchants/prisma.service';
import Decimal from 'decimal.js';

interface LedgerLine {
  merchantId: string;
  account: string; // "merchant_balance" | "platform_fee_revenue" | "provider_clearing" | "payout_pending"
  direction: 'DEBIT' | 'CREDIT';
  amount: string;
  currency: string;
}

/**
 * Ledger Double-Entry Orchestrator.
 *
 * Every money movement is recorded as a balanced set of AccountLedger rows
 * (debits == credits) inside a single Postgres transaction, so the ledger
 * can never drift out of balance even under concurrent writes or partial
 * failures. This is the "Atomic DB Unit-of-Work" — either the whole set of
 * rows lands, or none do.
 */
@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async postEntries(transactionId: string, lines: LedgerLine[]) {
    const sum = lines.reduce((acc, l) => {
      const signed = l.direction === 'DEBIT' ? new Decimal(l.amount) : new Decimal(l.amount).neg();
      return acc.plus(signed);
    }, new Decimal(0));

    if (!sum.isZero()) {
      throw new BadRequestException(
        `Ledger lines for tx ${transactionId} do not balance (net ${sum.toString()}). Refusing to post.`,
      );
    }

    return this.prisma.$transaction(
      lines.map((l) =>
        this.prisma.accountLedger.create({
          data: {
            transactionId,
            merchantId: l.merchantId,
            account: l.account,
            direction: l.direction,
            amount: l.amount,
            currency: l.currency,
          },
        }),
      ),
    );
  }

  /** Records a successful sale: merchant_balance credited, platform_fee_revenue + provider_clearing debited. */
  async recordSaleSettlement(opts: {
    transactionId: string;
    merchantId: string;
    grossAmount: string;
    platformFee: string;
    currency: string;
  }) {
    const net = new Decimal(opts.grossAmount).minus(opts.platformFee).toString();

    return this.postEntries(opts.transactionId, [
      { merchantId: opts.merchantId, account: 'provider_clearing', direction: 'DEBIT', amount: opts.grossAmount, currency: opts.currency },
      { merchantId: opts.merchantId, account: 'merchant_balance', direction: 'CREDIT', amount: net, currency: opts.currency },
      { merchantId: opts.merchantId, account: 'platform_fee_revenue', direction: 'CREDIT', amount: opts.platformFee, currency: opts.currency },
    ]);
  }

  async getMerchantBalance(merchantId: string, currency: string) {
    const rows = await this.prisma.accountLedger.findMany({
      where: { merchantId, account: 'merchant_balance', currency },
    });
    return rows.reduce((acc: Decimal, r: (typeof rows)[number]) => {
      const signed = r.direction === 'CREDIT' ? new Decimal(r.amount.toString()) : new Decimal(r.amount.toString()).neg();
      return acc.plus(signed);
    }, new Decimal(0)).toFixed(2);
  }
}
