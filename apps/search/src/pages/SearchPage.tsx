import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  api,
  Button,
  EmptyState,
  ErrorState,
  filtersToParams,
  formatDateRange,
  parseCriteria,
  parseFilters,
  useAsync,
  useDocumentTitle,
  type SearchFilters,
  type SortOption,
} from '@mini-agoda/shared';
import { FiltersPanel } from '../components/FiltersPanel';
import { HotelCard, HotelCardSkeleton } from '../components/HotelCard';
import { Pagination } from '../components/Pagination';
import { SearchForm } from '../components/SearchForm';
import styles from './SearchPage.module.css';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Lowest price first' },
  { value: 'price_desc', label: 'Highest price first' },
  { value: 'rating', label: 'Top reviewed' },
  { value: 'stars', label: 'Star rating' },
  { value: 'distance', label: 'Distance to centre' },
];

/**
 * Exposed as `search/SearchPage`. Mounted by the shell at `/search`.
 * The URL is the single source of truth for criteria, filters, sort and page,
 * so results are shareable and survive a reload.
 */
export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const criteria = useMemo(() => parseCriteria(new URLSearchParams(query)), [query]);
  const filters = useMemo(() => parseFilters(new URLSearchParams(query)), [query]);
  const [showFilters, setShowFilters] = useState(false);

  useDocumentTitle(criteria.destination ? `Hotels in ${criteria.destination}` : 'Search hotels');

  const { data, error, loading, reload } = useAsync(() => api.searchHotels({ ...criteria, ...filters }), [criteria, filters]);

  const updateFilters = (patch: Partial<SearchFilters & { sort: SortOption; page: number }>) => {
    // Any filter change resets to page 1 unless the patch is a page change itself.
    const next = { ...filters, page: 1, ...patch };
    setParams(filtersToParams(next, params), { replace: false });
    if (patch.page) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setParams(filtersToParams({ sort: filters.sort }, new URLSearchParams(query)));
  };

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <div className="ma-container">
          <SearchForm initial={criteria} variant="compact" />
        </div>
      </div>

      <div className={`ma-container ${styles.layout}`}>
        <div className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
          <FiltersPanel filters={filters} priceRange={data?.priceRange ?? { min: 0, max: 600 }} onChange={updateFilters} onClear={clearFilters} />
        </div>

        <section className={styles.results} aria-live="polite" aria-busy={loading}>
          <div className={styles.resultsHeader}>
            <div>
              <h1 className={styles.title}>{criteria.destination ? `${criteria.destination}` : 'All destinations'}</h1>
              <span className="ma-muted">
                {data ? `${data.total} properties found` : 'Searching…'} · {formatDateRange(criteria.checkIn, criteria.checkOut)} · {criteria.adults + criteria.children}{' '}
                guests
              </span>
            </div>
            <div className={styles.sort}>
              <Button variant="secondary" size="sm" className={styles.filterToggle} onClick={() => setShowFilters((s) => !s)}>
                {showFilters ? 'Hide filters' : 'Filters'}
              </Button>
              <label htmlFor="sort" className="ma-muted">
                Sort by
              </label>
              <select id="sort" className={styles.sortSelect} value={filters.sort} onChange={(e) => updateFilters({ sort: e.target.value as SortOption })}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <div className="ma-card">
              <ErrorState error={error} onRetry={reload} />
            </div>
          ) : loading && !data ? (
            <div className={styles.list}>
              {Array.from({ length: 4 }, (_, i) => (
                <HotelCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.hotels.length === 0 ? (
            <div className="ma-card">
              <EmptyState
                title="No properties match your filters"
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              >
                Try removing some filters or searching a different destination.
              </EmptyState>
            </div>
          ) : (
            <>
              <div className={`${styles.list} ${loading ? styles.stale : ''}`}>
                {data?.hotels.map((hotel) => <HotelCard key={hotel.id} hotel={hotel} criteria={criteria} />)}
              </div>
              {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={(page) => updateFilters({ page })} />}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
