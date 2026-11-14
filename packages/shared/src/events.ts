import type { Booking, CurrencyCode, SearchCriteria, User } from './types';

/**
 * Typed, DOM-based event bus for loosely-coupled cross-MFE communication.
 *
 * Events travel through `window`, so they work even if two MFEs somehow end
 * up with different copies of this package. See docs/COMMUNICATION.md.
 */
export interface MfeEventMap {
  'auth:changed': { user: User | null };
  'currency:changed': { currency: CurrencyCode };
  'wishlist:changed': { hotelIds: string[] };
  'search:submitted': { criteria: SearchCriteria };
  'booking:created': { booking: Booking };
  'booking:cancelled': { bookingId: string };
  'ui:toast': { message: string; type?: 'success' | 'error' | 'info' };
}

export type MfeEventName = keyof MfeEventMap;

const PREFIX = 'mini-agoda:';

export const eventBus = {
  emit<K extends MfeEventName>(name: K, detail: MfeEventMap[K]): void {
    window.dispatchEvent(new CustomEvent(PREFIX + name, { detail }));
  },

  /** Subscribes to an event and returns an unsubscribe function. */
  on<K extends MfeEventName>(name: K, handler: (detail: MfeEventMap[K]) => void): () => void {
    const listener = (event: Event) => handler((event as CustomEvent<MfeEventMap[K]>).detail);
    window.addEventListener(PREFIX + name, listener);
    return () => window.removeEventListener(PREFIX + name, listener);
  },
};

export const toast = {
  success: (message: string) => eventBus.emit('ui:toast', { message, type: 'success' }),
  error: (message: string) => eventBus.emit('ui:toast', { message, type: 'error' }),
  info: (message: string) => eventBus.emit('ui:toast', { message, type: 'info' }),
};
