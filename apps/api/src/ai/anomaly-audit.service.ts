import { Injectable } from '@nestjs/common';
import { PrismaService } from '../merchants/prisma.service';

/** AnomalyBehaviorAuditAi — flags a merchant's transaction volume spiking well above its own recent baseline. */
@Injectable()
export class AnomalyBehaviorAuditAi {
  constructor(private prisma: PrismaService) {}

  async checkForSpike(merchantId: string) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const baselineSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [last24h, last7d] = await Promise.all([
      this.prisma.transaction.count({ where: { merchantId, createdAt: { gte: since } } }),
      this.prisma.transaction.count({ where: { merchantId, createdAt: { gte: baselineSince } } }),
    ]);

    const dailyBaseline = last7d / 7;
    const isSpike = dailyBaseline > 0 && last24h > dailyBaseline * 3;

    return { last24h, dailyBaseline: Number(dailyBaseline.toFixed(1)), isSpike };
  }
}
