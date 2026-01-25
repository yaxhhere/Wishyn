/* -------------------- String Utils -------------------- */
export function capitalizeFirst(str?: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* -------------------- Currency Types -------------------- */
export type Currency = 'INR' | 'USD' | 'EUR';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  // GBP: '£',
};

/**
 * Exchange rates relative to USD (base currency)
 * NOTE: Approximate values. Replace with live API in prod.
 */
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  // GBP: 0.79,
  INR: 83.12,
};

/* -------------------- Currency Helpers -------------------- */
export const getCurrencySymbol = (currency: Currency): string => {
  return CURRENCY_SYMBOLS[currency];
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number => {
  if (!Number.isFinite(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;

  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  const converted = amountInUSD * EXCHANGE_RATES[toCurrency];

  return Math.round(converted * 100) / 100;
};

/**
 * Format currency with correct locale & symbol
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  const locale = currency === 'INR' ? 'en-IN' : 'en-US';

  const formatted = safeAmount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Symbol placement
  if (currency === 'INR') {
    return `₹ ${formatted}`;
  }

  return `${getCurrencySymbol(currency)}${formatted}`;
};
