import { Injectable } from '@nestjs/common';

/** SupportDisputeAiBot — templated first-response triage for common dispute reasons. */
@Injectable()
export class SupportDisputeAiBot {
  private readonly templates: Record<string, string> = {
    unrecognized_charge: 'We found the transaction linked to your account. Could you confirm the last 4 digits used?',
    product_not_received: 'We are checking the delivery/fulfillment status with the merchant now.',
    duplicate_charge: 'We are verifying whether two charges settled for a single order and will refund any duplicate.',
  };

  triage(reasonCode: string) {
    return {
      autoReply: this.templates[reasonCode] ?? 'A specialist will review your dispute within 24 hours.',
      escalateToHuman: !this.templates[reasonCode],
    };
  }
}
