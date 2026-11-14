import type { CurrencyCode } from '../types';

/** Static mock FX rates relative to USD (the base currency of all prices). */
export const CURRENCIES: Record<CurrencyCode, { rate: number; label: string; locale: string }> = {
  USD: { rate: 1, label: 'US Dollar', locale: 'en-US' },
  INR: { rate: 83.2, label: 'Indian Rupee', locale: 'en-IN' },
  EUR: { rate: 0.92, label: 'Euro', locale: 'de-DE' },
  THB: { rate: 35.8, label: 'Thai Baht', locale: 'th-TH' },
  SGD: { rate: 1.34, label: 'Singapore Dollar', locale: 'en-SG' },
  JPY: { rate: 151, label: 'Japanese Yen', locale: 'ja-JP' },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export function convertFromUSD(amountUSD: number, currency: CurrencyCode): number {
  return amountUSD * CURRENCIES[currency].rate;
}

export function formatPrice(amountUSD: number, currency: CurrencyCode = 'USD'): string {
  const { locale } = CURRENCIES[currency];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(convertFromUSD(amountUSD, currency));
}
