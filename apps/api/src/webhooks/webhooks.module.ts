import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ChapaSignatureGuard } from './guards/chapa-signature.guard';
import { StripeSignatureGuard } from './guards/stripe-signature.guard';
import { PaymentsModule } from '../payments/payments.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [PaymentsModule, MerchantsModule, QueuesModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, ChapaSignatureGuard, StripeSignatureGuard],
})
export class WebhooksModule {}
