import { Injectable } from '@nestjs/common';

/**
 * SmartPayoutSchedulerAi — picks the next scheduled payout window.
 * Today: simple rule (next business day, batched to reduce per-payout rail
 * fees). Structured so "liquidity window" data from a banking partner can
 * refine `nextWindow` later.
 */
@Injectable()
export class SmartPayoutSchedulerAi {
  nextWindow(now: Date = new Date()): Date {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    // Skip weekends — most local bank rails don't settle Sat/Sun.
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }
    next.setHours(9, 0, 0, 0);
    return next;
  }
}
