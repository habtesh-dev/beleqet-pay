import { Injectable } from '@nestjs/common';

/** ChargebackProtectionAiService — assembles a structured evidence packet for a dispute. */
@Injectable()
export class ChargebackProtectionAiService {
  buildEvidencePacket(input: {
    txRef: string;
    customerEmail: string;
    deliveryConfirmed: boolean;
    ipAddress?: string;
  }) {
    return {
      txRef: input.txRef,
      evidenceItems: [
        { type: 'customer_communication', present: true },
        { type: 'proof_of_delivery', present: input.deliveryConfirmed },
        { type: 'ip_address_match', present: Boolean(input.ipAddress) },
      ],
      recommendedAction: input.deliveryConfirmed ? 'SUBMIT_EVIDENCE' : 'GATHER_MORE_EVIDENCE',
    };
  }
}
