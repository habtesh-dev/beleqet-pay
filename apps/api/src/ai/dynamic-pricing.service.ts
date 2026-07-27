import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';

/**
 * DynamicPricingAiEngine — computes the platform fee per transaction.
 * Real rate table today; "dynamic" hook (volume-tiered discounts) is
 * structured but conservatively defaults to the flat rate until a
 * merchant's tier is wired up from the Subscriptions module.
 */
@Injectable()
export class DynamicPricingAiEngine {
  private readonly baseRatePercent: Record<'CHAPA' | 'STRIPE', string> = {
    CHAPA: '2.5',
    STRIPE: '3.4',
  };

  calculateFee(input: { amount: string; provider: 'CHAPA' | 'STRIPE' }): string {
    const rate = new Decimal(this.baseRatePercent[input.provider]).div(100);
    return new Decimal(input.amount).mul(rate).toFixed(2);
  }
}
