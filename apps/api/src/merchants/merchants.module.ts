import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';

@Module({
  providers: [PrismaService, MerchantsService],
  controllers: [MerchantsController],
  exports: [PrismaService, MerchantsService],
})
export class MerchantsModule {}
