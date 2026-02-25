import { createInquiry } from '../services/inquiryService';

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export async function submitInquiry(formData) {
  await createInquiry(formData);
}
