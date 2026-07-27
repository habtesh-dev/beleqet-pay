import { Body, Controller, Post, Param } from '@nestjs/common';
import { MerchantsService } from './merchants.service';

@Controller('v1/merchants')
export class MerchantsController {
  constructor(private merchants: MerchantsService) {}

  @Post()
  create(@Body() body: { businessName: string; email: string; tinNumber?: string; country?: string }) {
    return this.merchants.createMerchant(body);
  }

  @Post(':id/api-keys')
  issueKey(@Param('id') id: string, @Body('mode') mode: 'test' | 'live' = 'test') {
    return this.merchants.issueApiKey(id, mode);
  }
}
