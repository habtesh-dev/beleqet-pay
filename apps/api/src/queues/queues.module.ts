import { Module, forwardRef } from '@nestjs/common';
import { PaymentSettlementQueue } from './payment-settlement.queue';
import { PaymentSettlementProcessor } from './payment-settlement.processor';
import { MerchantsModule } from '../merchants/merchants.module';
import { LedgerModule } from '../ledger/ledger.module';
import { AiModule } from '../ai/ai.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [MerchantsModule, LedgerModule, AiModule, forwardRef(() => PaymentsModule)],
  providers: [PaymentSettlementQueue, PaymentSettlementProcessor],
  exports: [PaymentSettlementQueue],
})
export class QueuesModule {}
