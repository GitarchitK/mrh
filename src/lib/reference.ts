/**
 * Reference and token generators for Mobile Repairing House.
 * Ensures consistent human-readable references and high-entropy tracking tokens.
 */

export function generateTrackingToken(): string {
  // 32-char high-entropy hex string
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function generateJobNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MRH-${year}-${randomNum}`;
}

export function generateEnquiryReference(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `ENQ-${prefix}${numbers}`;
}

export function generateEstimateNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `EST-${year}-${randomNum}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomNum}`;
}

export function generatePaymentReference(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `PAY-${year}-${randomNum}`;
}

export function generateWarrantyReference(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `WRN-${year}-${randomNum}`;
}
