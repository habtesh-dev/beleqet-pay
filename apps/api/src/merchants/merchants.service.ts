import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from './prisma.service';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  createMerchant(data: { businessName: string; email: string; tinNumber?: string; country?: string }) {
    return this.prisma.merchant.create({ data });
  }

  /** Generates a new API key, returning the RAW key exactly once (never again retrievable). */
  async issueApiKey(merchantId: string, mode: 'test' | 'live') {
    const rawKey = `blq_${mode}_${randomBytes(24).toString('hex')}`;
    const keyHash = createHash('sha256')
      .update(rawKey + (process.env.API_KEY_HASH_SALT ?? ''))
      .digest('hex');

    await this.prisma.apiKey.create({
      data: {
        merchantId,
        keyHash,
        keyPrefix: rawKey.slice(0, 14),
        mode,
      },
    });

    return { rawKey }; // caller must display-once and discard
  }

  revokeApiKey(apiKeyId: string) {
    return this.prisma.apiKey.update({ where: { id: apiKeyId }, data: { revoked: true } });
  }
}
