import { useEffect, useState } from 'react';
import { Money, type Amenity, type PropertyType, type SearchFilters } from '@mini-agoda/shared';
import styles from './FiltersPanel.module.css';

const PROPERTY_TYPES: PropertyType[] = ['Hotel', 'Resort', 'Apartment', 'Villa', 'Hostel'];
const AMENITIES: Amenity[] = ['Free WiFi', 'Swimming pool', 'Free breakfast', 'Parking', 'Fitness center', 'Spa', 'Airport transfer', 'Pet friendly'];
const SCORES = [
  { value: undefined, label: 'Any' },
  { value: 9, label: 'Exceptional 9+' },
  { value: 8, label: 'Very good 8+' },
  { value: 7, label: 'Good 7+' },
];

interface Props {
  filters: SearchFilters;
  priceRange: { min: number; max: number };
  onChange: (patch: Partial<SearchFilters>) => void;
  onClear: () => void;
}

function toggle<T>(list: T[] | undefined, item: T): T[] {
  const current = list ?? [];
  return current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
}

export function FiltersPanel({ filters, priceRange, onChange, onClear }: Props) {
  const activeCount =
    (filters.stars?.length ?? 0) +
    (filters.propertyTypes?.length ?? 0) +
    (filters.amenities?.length ?? 0) +
    (filters.minScore ? 1 : 0) +
    (filters.freeCancellation ? 1 : 0) +
    (filters.maxPrice !== undefined || filters.minPrice !== undefined ? 1 : 0);

  return (
    <aside className={`ma-card ${styles.panel}`} aria-label="Filters">
      <div className={styles.header}>
        <strong>Filter by</strong>
        {activeCount > 0 && (
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <PriceFilter filters={filters} range={priceRange} onChange={onChange} />

      <fieldset className={styles.group}>
        <legend>Popular filters</legend>
        <label className={styles.option}>
          <input type="checkbox" checked={Boolean(filters.freeCancellation)} onChange={(e) => onChange({ freeCancellation: e.target.checked || undefined })} />
          Free cancellation
        </label>
        <label className={styles.option}>
          <input
            type="checkbox"
            checked={Boolean(filters.amenities?.includes('Free breakfast'))}
            onChange={() => onChange({ amenities: toggle(filters.amenities, 'Free breakfast') })}
          />
          Breakfast included
        </label>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Star rating</legend>
        <div className={styles.starRow}>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.starChip} ${filters.stars?.includes(star) ? styles.chipActive : ''}`}
              aria-pressed={Boolean(filters.stars?.includes(star))}
              onClick={() => onChange({ stars: toggle(filters.stars, star) })}
            >
              {star}★
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Guest review score</legend>
        {SCORES.map((score) => (
          <label key={score.label} className={styles.option}>
            <input type="radio" name="minScore" checked={filters.minScore === score.value} onChange={() => onChange({ minScore: score.value })} />
            {score.label}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Property type</legend>
        {PROPERTY_TYPES.map((type) => (
          <label key={type} className={styles.option}>
            <input
              type="checkbox"
              checked={Boolean(filters.propertyTypes?.includes(type))}
              onChange={() => onChange({ propertyTypes: toggle(filters.propertyTypes, type) })}
            />
            {type}
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Facilities</legend>
        {AMENITIES.map((amenity) => (
          <label key={amenity} className={styles.option}>
            <input
              type="checkbox"
              checked={Boolean(filters.amenities?.includes(amenity))}
              onChange={() => onChange({ amenities: toggle(filters.amenities, amenity) })}
            />
            {amenity}
          </label>
        ))}
      </fieldset>
    </aside>
  );
}

/** Max-price slider; only commits to the URL when the user releases it. */
function PriceFilter({ filters, range, onChange }: { filters: SearchFilters; range: { min: number; max: number }; onChange: Props['onChange'] }) {
  const max = Math.max(range.max, 1);
  const [value, setValue] = useState(filters.maxPrice ?? max);
  useEffect(() => setValue(filters.maxPrice ?? max), [filters.maxPrice, max]);

  const commit = () => onChange({ maxPrice: value >= max ? undefined : value });

  return (
    <fieldset className={styles.group}>
      <legend>Your budget (per night)</legend>
      <input
        type="range"
        className={styles.range}
        min={range.min}
        max={max}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
        aria-label="Maximum price per night"
      />
      <div className={styles.rangeLabels}>
        <Money amount={range.min} />
        <span>
          up to <strong>{value >= max ? 'any price' : <Money amount={value} />}</strong>
        </span>
      </div>
    </fieldset>
  );
}
