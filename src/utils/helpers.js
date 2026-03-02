import { createInquiry } from '../services/inquiryService';

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export async function submitInquiry(formData) {
  await createInquiry(formData);
}
