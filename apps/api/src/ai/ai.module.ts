import { Module } from '@nestjs/common';
import { MerchantsModule } from '../merchants/merchants.module';
import { FraudDetectionAiService } from './fraud-detection.service';
import { SmartRoutingAiService } from './smart-routing.service';
import { MerchantKycAiService } from './merchant-kyc.service';
import { SupportDisputeAiBot } from './support-dispute-bot.service';
import { PredictiveCashflowAiEngine } from './predictive-cashflow.service';
import { DynamicPricingAiEngine } from './dynamic-pricing.service';
import { ChargebackProtectionAiService } from './chargeback-protection.service';
import { CurrencyFxAiEngine } from './currency-fx.service';
import { AnomalyBehaviorAuditAi } from './anomaly-audit.service';
import { SmartPayoutSchedulerAi } from './smart-payout-scheduler.service';

const AI_SERVICES = [
  FraudDetectionAiService,
  SmartRoutingAiService,
  MerchantKycAiService,
  SupportDisputeAiBot,
  PredictiveCashflowAiEngine,
  DynamicPricingAiEngine,
  ChargebackProtectionAiService,
  CurrencyFxAiEngine,
  AnomalyBehaviorAuditAi,
  SmartPayoutSchedulerAi,
];

@Module({
  imports: [MerchantsModule],
  providers: [...AI_SERVICES],
  exports: [...AI_SERVICES],
})
export class AiModule {}
