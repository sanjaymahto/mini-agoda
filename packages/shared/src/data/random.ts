/**
 * Deterministic pseudo random generator (mulberry32) so mock data is identical
 * on every reload and in every micro frontend.
 */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    float: (min: number, max: number, decimals = 1) => Number((next() * (max - min) + min).toFixed(decimals)),
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)],
    sample: <T>(items: readonly T[], count: number): T[] => {
      const copy = [...items];
      const out: T[] = [];
      while (out.length < count && copy.length) {
        out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
      }
      return out;
    },
    chance: (probability: number) => next() < probability,
  };
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
