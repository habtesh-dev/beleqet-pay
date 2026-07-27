import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ChapaProvider } from './providers/chapa.provider';
import { StripeProvider } from './providers/stripe.provider';
import { PaymentProviderFactory } from './providers/provider.factory';
import { MerchantsModule } from '../merchants/merchants.module';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [MerchantsModule, AuthModule, AiModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ChapaProvider, StripeProvider, PaymentProviderFactory],
  exports: [PaymentProviderFactory, ChapaProvider, StripeProvider],
})
export class PaymentsModule {}
