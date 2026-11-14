import type { PriceBreakdown } from '../types';

export const TAX_RATE = 0.1;
export const SERVICE_FEE_RATE = 0.05;

export interface PromoCode {
  code: string;
  description: string;
  percentOff: number;
  /** Maximum discount in USD. */
  maxDiscount?: number;
}

export const PROMO_CODES: PromoCode[] = [
  { code: 'AGODA10', description: '10% off your stay', percentOff: 10 },
  { code: 'MINI20', description: '20% off, up to $100', percentOff: 20, maxDiscount: 100 },
  { code: 'WELCOME5', description: '5% off for new members', percentOff: 5 },
];

export function findPromo(code: string | undefined): PromoCode | undefined {
  if (!code) return undefined;
  return PROMO_CODES.find((promo) => promo.code === code.trim().toUpperCase());
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** All amounts are USD. Taxes are charged on the discounted room total. */
export function calculatePrice(pricePerNight: number, nights: number, rooms: number, promoCode?: string): PriceBreakdown {
  const roomTotal = round2(pricePerNight * nights * rooms);
  const promo = findPromo(promoCode);
  let discount = promo ? (roomTotal * promo.percentOff) / 100 : 0;
  if (promo?.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
  discount = round2(discount);
  const taxesAndFees = round2((roomTotal - discount) * (TAX_RATE + SERVICE_FEE_RATE));

  return {
    nights,
    rooms,
    roomTotal,
    discount,
    taxesAndFees,
    total: round2(roomTotal - discount + taxesAndFees),
  };
}

export function discountPercent(price: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}
