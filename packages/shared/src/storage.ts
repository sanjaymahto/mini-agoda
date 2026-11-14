/** Namespaced, JSON-safe wrapper around localStorage. Never throws (private mode, quota, SSR). */
const PREFIX = 'mini-agoda:';

export const storage = {
  key: (name: string) => PREFIX + name,

  get<T>(name: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(PREFIX + name);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(name: string, value: T): void {
    try {
      window.localStorage.setItem(PREFIX + name, JSON.stringify(value));
    } catch {
      /* storage unavailable - state simply won't persist */
    }
  },

  remove(name: string): void {
    try {
      window.localStorage.removeItem(PREFIX + name);
    } catch {
      /* ignore */
    }
  },
};
