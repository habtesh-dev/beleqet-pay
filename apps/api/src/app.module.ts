import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { LedgerModule } from './ledger/ledger.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { QueuesModule } from './queues/queues.module';
import { AiModule } from './ai/ai.module';
import { MerchantsModule } from './merchants/merchants.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MerchantsModule,
    LedgerModule,
    QueuesModule,
    PaymentsModule,
    WebhooksModule,
    SubscriptionsModule,
    AiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
