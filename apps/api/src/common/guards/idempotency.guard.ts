import { CanActivate, ExecutionContext, Injectable, ConflictException } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Strict Idempotency Guard — fences duplicate processing using a Redis
 * SET NX with a 24h TTL keyed on the client's Idempotency-Key header (or
 * the tx_ref for webhook replays). First request to claim a key proceeds;
 * every subsequent request with the same key inside the window is rejected
 * with 409. This is what stops a retried webhook or a doubly-clicked "Pay"
 * button from granting credits or moving money twice.
 */
@Injectable()
export class IdempotencyGuard implements CanActivate {
  private redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] ?? req.body?.tx_ref;
    if (!key) return true;

    const claimed = await this.redis.set(`idem:${key}`, '1', 'EX', 60 * 60 * 24, 'NX');
    if (claimed === null) {
      throw new ConflictException(`Request with idempotency key "${key}" was already processed.`);
    }
    return true;
  }
}
