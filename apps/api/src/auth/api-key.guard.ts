import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../merchants/prisma.service';

/**
 * Validates the `Authorization: Bearer blq_live_...` header against the
 * hashed API key stored in Postgres. Raw keys are never persisted — only
 * sha256(rawKey + salt) — so a DB leak alone can't be replayed as a live key.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = req.headers['authorization'] as string | undefined;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing API key');
    }

    const rawKey = header.replace('Bearer ', '').trim();
    const keyHash = createHash('sha256')
      .update(rawKey + (process.env.API_KEY_HASH_SALT ?? ''))
      .digest('hex');

    const apiKey = await this.prisma.apiKey.findUnique({ where: { keyHash } });
    if (!apiKey || apiKey.revoked) {
      throw new UnauthorizedException('Invalid or revoked API key');
    }

    req.merchantId = apiKey.merchantId;
    req.apiKeyMode = apiKey.mode;
    return true;
  }
}
