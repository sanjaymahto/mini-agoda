import { storage, type SearchCriteria } from '@mini-agoda/shared';

const KEY = 'search:recent';
const MAX = 4;

export function getRecentSearches(): SearchCriteria[] {
  return storage.get<SearchCriteria[]>(KEY, []);
}

export function saveRecentSearch(criteria: SearchCriteria) {
  if (!criteria.destination) return;
  const rest = getRecentSearches().filter((c) => c.destination.toLowerCase() !== criteria.destination.toLowerCase());
  storage.set(KEY, [criteria, ...rest].slice(0, MAX));
}
