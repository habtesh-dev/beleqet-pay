import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { ChapaProvider } from '../../payments/providers/chapa.provider';

@Injectable()
export class ChapaSignatureGuard implements CanActivate {
  constructor(private chapa: ChapaProvider) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const rawBody: Buffer | undefined = req.rawBody;
    const signature = req.headers['x-chapa-signature'] as string | undefined;

    if (!rawBody || !this.chapa.verifyWebhookSignature(rawBody, signature)) {
      throw new ForbiddenException('Invalid Chapa webhook signature');
    }
    return true;
  }
}
