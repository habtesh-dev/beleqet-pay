import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { ChapaSignatureGuard } from './guards/chapa-signature.guard';
import { StripeSignatureGuard } from './guards/stripe-signature.guard';

@Controller('v1/webhooks')
export class WebhooksController {
  constructor(private webhooks: WebhooksService) {}

  @Post('chapa')
  @UseGuards(ChapaSignatureGuard)
  chapa(@Req() req: any, @Body() body: any) {
    return this.webhooks.handleVerifiedWebhook('CHAPA', body, req.ip);
  }

  @Post('stripe')
  @UseGuards(StripeSignatureGuard)
  stripe(@Req() req: any, @Body() body: any) {
    return this.webhooks.handleVerifiedWebhook('STRIPE', body, req.ip);
  }
}
