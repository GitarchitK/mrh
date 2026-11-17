/**
 * Precise currency and monetary calculations using integer paise.
 * Avoids binary floating-point representation bugs (e.g. 0.1 + 0.2 !== 0.3).
 * 1 Rupee = 100 Paise.
 */

/**
 * Converts integer paise to Indian Rupee formatted string (e.g., ₹1,450.00 or ₹1,450)
 */
export function formatPaiseToINR(paise: number = 0, includeDecimals = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts Rupees (decimal or integer number) to integer Paise
 */
export function rupeesToPaise(rupees: number | string): number {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts Paise to Rupees as a number
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculates line item total in paise
 */
export function calculateLineTotalPaise(quantity: number, unitPricePaise: number): number {
  const q = Math.max(0, Math.floor(quantity));
  const p = Math.max(0, Math.round(unitPricePaise));
  return q * p;
}

/**
 * Calculates invoice or estimate totals safely in paise
 */
export function calculateTotalsPaise(
  subtotalPaise: number,
  discountPaise: number = 0,
  taxRatePercent: number = 0,
  taxEnabled: boolean = false
): {
  subtotalPaise: number;
  discountPaise: number;
  taxablePaise: number;
  taxPaise: number;
  totalPaise: number;
} {
  const subtotal = Math.max(0, Math.round(subtotalPaise));
  const discount = Math.min(subtotal, Math.max(0, Math.round(discountPaise)));
  const taxablePaise = subtotal - discount;

  let taxPaise = 0;
  if (taxEnabled && taxRatePercent > 0) {
    taxPaise = Math.round((taxablePaise * taxRatePercent) / 100);
  }

  const totalPaise = taxablePaise + taxPaise;

  return {
    subtotalPaise: subtotal,
    discountPaise: discount,
    taxablePaise,
    taxPaise,
    totalPaise,
  };
}
