import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { StripeProvider } from '../../payments/providers/stripe.provider';

@Injectable()
export class StripeSignatureGuard implements CanActivate {
  constructor(private stripe: StripeProvider) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const rawBody: Buffer | undefined = req.rawBody;
    const signature = req.headers['stripe-signature'] as string | undefined;

    if (!rawBody || !this.stripe.verifyWebhookSignature(rawBody, signature)) {
      throw new ForbiddenException('Invalid Stripe webhook signature');
    }
    return true;
  }
}
