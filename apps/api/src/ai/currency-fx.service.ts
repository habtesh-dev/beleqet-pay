import { Injectable, BadGatewayException } from '@nestjs/common';
import axios from 'axios';

/**
 * CurrencyFxAiEngine — fetches a live ETB<->USD rate from an external FX
 * API and caches it briefly. "Engine" here means "the rate lookup + margin
 * logic your settlement math depends on", not a prediction model — FX rates
 * are looked up, not forecast.
 */
@Injectable()
export class CurrencyFxAiEngine {
  private cache: { rate: number; fetchedAt: number } | null = null;
  private readonly ttlMs = 5 * 60 * 1000;
  private readonly marginPercent = 1.5; // platform FX margin

  async getRate(from: string, to: string): Promise<number> {
    if (this.cache && Date.now() - this.cache.fetchedAt < this.ttlMs) {
      return this.applyMargin(this.cache.rate);
    }
    try {
      const { data } = await axios.get(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}`);
      const rate = data.rates[to];
      this.cache = { rate, fetchedAt: Date.now() };
      return this.applyMargin(rate);
    } catch (err: any) {
      throw new BadGatewayException(`FX rate lookup failed: ${err.message}`);
    }
  }

  private applyMargin(rate: number): number {
    return rate * (1 - this.marginPercent / 100);
  }
}
