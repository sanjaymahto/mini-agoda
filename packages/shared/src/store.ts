import { useSyncExternalStore } from 'react';
import { eventBus } from './events';
import { storage } from './storage';
import type { CurrencyCode, User } from './types';

/**
 * A tiny global store (no Redux needed). Because @mini-agoda/shared is a Module
 * Federation singleton, every MFE reads and writes the *same* store instance.
 * Stores persist to localStorage and sync across browser tabs.
 */
export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<T>(persistKey: string, initial: T): Store<T> {
  let state = storage.get<T>(persistKey, initial);
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  window.addEventListener('storage', (event) => {
    if (event.key === storage.key(persistKey)) {
      state = storage.get<T>(persistKey, initial);
      notify();
    }
  });

  return {
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      storage.set(persistKey, state);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/* ------------------------------------------------------------------ auth */

export const authStore = createStore<{ user: User | null }>('auth', { user: null });

export function useAuth() {
  const { user } = useStore(authStore);
  return { user, isAuthenticated: Boolean(user) };
}

export function setCurrentUser(user: User | null) {
  authStore.set({ user });
  eventBus.emit('auth:changed', { user });
}

/* ------------------------------------------------------------- currency */

export const currencyStore = createStore<{ currency: CurrencyCode }>('currency', { currency: 'USD' });

export function useCurrency(): CurrencyCode {
  return useStore(currencyStore).currency;
}

export function setCurrency(currency: CurrencyCode) {
  currencyStore.set({ currency });
  eventBus.emit('currency:changed', { currency });
}

/* ------------------------------------------------------------- wishlist */

export const wishlistStore = createStore<{ hotelIds: string[] }>('wishlist', { hotelIds: [] });

export function useWishlist() {
  const { hotelIds } = useStore(wishlistStore);
  return {
    hotelIds,
    isSaved: (hotelId: string) => hotelIds.includes(hotelId),
    toggle: toggleWishlist,
  };
}

/** Returns true when the hotel was added, false when it was removed. */
export function toggleWishlist(hotelId: string): boolean {
  const saved = wishlistStore.get().hotelIds.includes(hotelId);
  wishlistStore.set(({ hotelIds }) => ({
    hotelIds: saved ? hotelIds.filter((id) => id !== hotelId) : [...hotelIds, hotelId],
  }));
  eventBus.emit('wishlist:changed', { hotelIds: wishlistStore.get().hotelIds });
  return !saved;
}
