import { Injectable } from '@nestjs/common';

/**
 * MerchantKycAiService — validation-rule engine for onboarding documents.
 * Honest scope: real OCR/document-authenticity verification needs a
 * licensed KYC/AML vendor (Smile Identity, Onfido, etc.) — this service
 * defines the interface and business rules (which fields are required,
 * which statuses are valid) that such a vendor's result would flow into.
 */
@Injectable()
export class MerchantKycAiService {
  evaluateSubmission(input: { tinNumber?: string; businessName: string; documentUrls: string[] }) {
    const issues: string[] = [];
    if (!input.tinNumber) issues.push('Missing TIN number');
    if (input.documentUrls.length === 0) issues.push('No identity/business documents uploaded');
    if (input.businessName.trim().length < 3) issues.push('Business name too short');

    return {
      status: issues.length === 0 ? 'AUTO_APPROVED' : 'NEEDS_REVIEW',
      issues,
    };
  }
}
