import { Injectable } from '@nestjs/common';
import { PrismaService } from '../merchants/prisma.service';

/** PredictiveCashflowAiEngine — simple moving-average forecast off historical settlement volume. */
@Injectable()
export class PredictiveCashflowAiEngine {
  constructor(private prisma: PrismaService) {}

  async forecastNext7Days(merchantId: string) {
    const txs = await this.prisma.transaction.findMany({
      where: { merchantId, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    if (txs.length === 0) return { forecastedDailyAverage: '0.00', confidence: 'LOW' };

    const total = txs.reduce((s: number, t: (typeof txs)[number]) => s + Number(t.amount), 0);
    const avg = total / txs.length;
    return {
      forecastedDailyAverage: avg.toFixed(2),
      confidence: txs.length >= 20 ? 'MEDIUM' : 'LOW',
    };
  }
}
