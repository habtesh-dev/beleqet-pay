import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { MerchantsModule } from '../merchants/merchants.module';

@Module({
  imports: [MerchantsModule],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
