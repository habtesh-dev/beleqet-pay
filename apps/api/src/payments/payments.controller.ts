import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { IdempotencyGuard } from '../common/guards/idempotency.guard';

@Controller('v1')
@UseGuards(ApiKeyGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('checkout/sessions')
  @UseGuards(IdempotencyGuard)
  create(
    @Req() req: any,
    @Body()
    body: {
      amount: string;
      currency: string;
      customerEmail: string;
      successRedirectUrl: string;
      preferredProvider?: 'CHAPA' | 'STRIPE';
      metadata?: Record<string, unknown>;
    },
  ) {
    return this.payments.createCheckoutSession({ merchantId: req.merchantId, ...body });
  }

  @Get('transactions/:txRef')
  get(@Param('txRef') txRef: string) {
    return this.payments.getTransaction(txRef);
  }
}
