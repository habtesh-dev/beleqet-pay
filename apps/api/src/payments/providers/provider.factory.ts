import { Injectable } from '@nestjs/common';
import { ChapaProvider } from './chapa.provider';
import { StripeProvider } from './stripe.provider';
import { PaymentProvider } from './payment-provider.interface';

/**
 * Gateway Strategy Abstraction Layer. Callers ask for a provider by name and
 * get back the same PaymentProvider interface regardless of which gateway
 * backs it — this is what lets SmartRoutingAiService swap Chapa <-> Stripe
 * without the rest of the codebase caring.
 */
@Injectable()
export class PaymentProviderFactory {
  constructor(private chapa: ChapaProvider, private stripe: StripeProvider) {}

  get(name: 'CHAPA' | 'STRIPE'): PaymentProvider {
    return name === 'CHAPA' ? this.chapa : this.stripe;
  }
}
