import type { Amenity, PropertyType, SearchCriteria, SearchFilters, SortOption } from '../types';
import { addDays, isValidISODate, nightsBetween, today } from './dates';

/**
 * URL query params are the public contract between MFEs (search -> hotel -> booking).
 * Keep this file in sync with docs/MICRO_FRONTENDS.md#url-contracts.
 */

export function defaultCriteria(): SearchCriteria {
  const checkIn = addDays(today(), 7);
  return { destination: '', checkIn, checkOut: addDays(checkIn, 2), adults: 2, children: 0, rooms: 1 };
}

const clampInt = (value: string | null, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};

export function parseCriteria(params: URLSearchParams): SearchCriteria {
  const defaults = defaultCriteria();
  let checkIn = params.get('checkIn');
  let checkOut = params.get('checkOut');

  if (!isValidISODate(checkIn) || checkIn < today()) checkIn = defaults.checkIn;
  if (!isValidISODate(checkOut) || nightsBetween(checkIn, checkOut) < 1) checkOut = addDays(checkIn, 2);

  const rooms = clampInt(params.get('rooms'), defaults.rooms, 1, 8);
  return {
    destination: params.get('destination') ?? '',
    checkIn,
    checkOut,
    adults: clampInt(params.get('adults'), defaults.adults, rooms, 16),
    children: clampInt(params.get('children'), defaults.children, 0, 10),
    rooms,
  };
}

export function criteriaToParams(criteria: Partial<SearchCriteria>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(criteria)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  return params;
}

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : undefined);

export function parseFilters(params: URLSearchParams): SearchFilters & { sort: SortOption; page: number } {
  const num = (key: string) => {
    const value = params.get(key);
    return value !== null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : undefined;
  };
  return {
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    stars: list(params.get('stars'))?.map(Number),
    minScore: num('minScore'),
    propertyTypes: list(params.get('types')) as PropertyType[] | undefined,
    amenities: list(params.get('amenities')) as Amenity[] | undefined,
    freeCancellation: params.get('freeCancellation') === 'true' || undefined,
    sort: (params.get('sort') as SortOption) || 'recommended',
    page: clampInt(params.get('page'), 1, 1, 999),
  };
}

export function filtersToParams(filters: SearchFilters & { sort?: SortOption; page?: number }, base = new URLSearchParams()): URLSearchParams {
  const params = new URLSearchParams(base);
  const setOrDelete = (key: string, value: string | undefined) => (value ? params.set(key, value) : params.delete(key));

  setOrDelete('minPrice', filters.minPrice?.toString());
  setOrDelete('maxPrice', filters.maxPrice?.toString());
  setOrDelete('stars', filters.stars?.length ? filters.stars.join(',') : undefined);
  setOrDelete('minScore', filters.minScore?.toString());
  setOrDelete('types', filters.propertyTypes?.length ? filters.propertyTypes.join(',') : undefined);
  setOrDelete('amenities', filters.amenities?.length ? filters.amenities.join(',') : undefined);
  setOrDelete('freeCancellation', filters.freeCancellation ? 'true' : undefined);
  setOrDelete('sort', filters.sort && filters.sort !== 'recommended' ? filters.sort : undefined);
  setOrDelete('page', filters.page && filters.page > 1 ? String(filters.page) : undefined);
  return params;
}

/** Builds a link to a hotel page that carries the stay criteria along. */
export function hotelUrl(hotelId: string, criteria?: Partial<SearchCriteria>): string {
  const { destination: _destination, ...stay } = criteria ?? {};
  const query = criteriaToParams(stay).toString();
  return `/hotel/${hotelId}${query ? `?${query}` : ''}`;
}

export function checkoutUrl(hotelId: string, roomId: string, criteria: Omit<SearchCriteria, 'destination'>): string {
  const params = criteriaToParams(criteria);
  params.set('hotelId', hotelId);
  params.set('roomId', roomId);
  return `/booking/checkout?${params.toString()}`;
}
