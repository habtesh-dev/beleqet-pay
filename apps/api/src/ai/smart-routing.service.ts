import { Injectable } from '@nestjs/common';

/**
 * SmartRoutingAiService — rule-based provider selection today (ETB -> Chapa,
 * everything else -> Stripe), structured so a real success-rate-tracking
 * router (per-provider rolling success rate, latency, cost) can replace the
 * `chooseProvider` body later without touching any caller.
 */
@Injectable()
export class SmartRoutingAiService {
  chooseProvider(input: { currency: string }): 'CHAPA' | 'STRIPE' {
    return input.currency.toUpperCase() === 'ETB' ? 'CHAPA' : 'STRIPE';
  }
}
