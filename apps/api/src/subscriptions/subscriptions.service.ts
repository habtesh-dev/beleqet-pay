import { Injectable } from '@nestjs/common';
import { PrismaService } from '../merchants/prisma.service';

/** Subscription Lifecycle Service — plan tiers, renewals, cancellations for recurring billing. */
@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  private readonly plans = {
    starter: { priceEtb: '0', maxActiveJobPosts: 3 },
    growth: { priceEtb: '1499', maxActiveJobPosts: 25 },
    enterprise: { priceEtb: '4999', maxActiveJobPosts: 999 },
  } as const;

  getPlan(name: keyof typeof this.plans) {
    return this.plans[name];
  }

  listPlans() {
    return this.plans;
  }
}
