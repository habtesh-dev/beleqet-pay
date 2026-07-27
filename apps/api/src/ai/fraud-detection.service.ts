import { Injectable } from '@nestjs/common';
import { PrismaService } from '../merchants/prisma.service';

/**
 * FraudDetectionAiService — heuristic, explainable risk scoring.
 *
 * Honest scope note: this is a transparent rules/velocity engine, not a
 * neural model trained on billions of transactions (nobody can ship that
 * without your real historical fraud-labeled data). It's the same *shape*
 * production fraud engines use — signal collection -> weighted scoring ->
 * decision — and it's a legitimate place to plug a trained model in later
 * without changing the calling code.
 */
@Injectable()
export class FraudDetectionAiService {
  constructor(private prisma: PrismaService) {}

  async assess(input: { merchantId: string; amount: string; customerEmail: string }) {
    const signals: Record<string, number> = {};
    let score = 0;

    // Velocity signal: how many transactions from this email in the last hour.
    const recentCount = await this.prisma.transaction.count({
      where: {
        metadata: { path: ['customerEmail'], equals: input.customerEmail },
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    signals.velocity = recentCount;
    if (recentCount > 5) score += 40;
    else if (recentCount > 2) score += 15;

    // Amount signal: unusually large charge relative to typical range.
    const amt = Number(input.amount);
    signals.amount = amt;
    if (amt > 100000) score += 30;
    else if (amt > 20000) score += 10;

    // Disposable / suspicious-pattern email heuristic.
    const suspiciousDomain = /\b(mailinator|tempmail|10minutemail)\b/i.test(input.customerEmail);
    signals.suspiciousEmailDomain = suspiciousDomain ? 1 : 0;
    if (suspiciousDomain) score += 25;

    const riskScore = Math.min(score, 100);
    const decision = riskScore >= 70 ? 'BLOCK' : riskScore >= 35 ? 'REVIEW' : 'ALLOW';

    await this.prisma.fraudLog.create({
      data: { txRef: `pending-${Date.now()}`, riskScore, signals, decision },
    });

    return { riskScore, decision, signals };
  }
}
