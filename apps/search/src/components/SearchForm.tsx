import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addDays,
  api,
  Button,
  criteriaToParams,
  eventBus,
  hotelUrl,
  nightsBetween,
  today,
  useClickOutside,
  useDebouncedValue,
  type Destination,
  type SearchCriteria,
} from '@mini-agoda/shared';
import { saveRecentSearch } from '../lib/recentSearches';
import styles from './SearchForm.module.css';

interface Props {
  initial: SearchCriteria;
  variant?: 'hero' | 'compact';
}

export function SearchForm({ initial, variant = 'hero' }: Props) {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState(initial);
  const [error, setError] = useState<string>();

  useEffect(() => setCriteria(initial), [initial]);

  const update = (patch: Partial<SearchCriteria>) => {
    setError(undefined);
    setCriteria((prev) => {
      const next = { ...prev, ...patch };
      // Keep check-out after check-in when the user moves check-in forward.
      if (patch.checkIn && nightsBetween(next.checkIn, next.checkOut) < 1) next.checkOut = addDays(next.checkIn, 1);
      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nightsBetween(criteria.checkIn, criteria.checkOut) < 1) {
      setError('Check-out must be after check-in');
      return;
    }
    if (nightsBetween(criteria.checkIn, criteria.checkOut) > 30) {
      setError('Stays are limited to 30 nights');
      return;
    }
    saveRecentSearch(criteria);
    eventBus.emit('search:submitted', { criteria });
    navigate(`/search?${criteriaToParams(criteria)}`);
  };

  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);

  return (
    <form className={`${styles.form} ${styles[variant]}`} onSubmit={submit} role="search">
      <DestinationInput
        value={criteria.destination}
        onChange={(destination) => update({ destination })}
        onSelectHotel={(destination) => navigate(hotelUrl(destination.id, criteria))}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${variant}-checkin`}>
          Check-in
        </label>
        <input
          id={`${variant}-checkin`}
          type="date"
          className={styles.input}
          min={today()}
          value={criteria.checkIn}
          onChange={(event) => event.target.value && update({ checkIn: event.target.value })}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${variant}-checkout`}>
          Check-out {nights > 0 && <span className={styles.nights}>· {nights} night{nights > 1 ? 's' : ''}</span>}
        </label>
        <input
          id={`${variant}-checkout`}
          type="date"
          className={styles.input}
          min={addDays(criteria.checkIn, 1)}
          value={criteria.checkOut}
          onChange={(event) => event.target.value && update({ checkOut: event.target.value })}
          required
        />
      </div>

      <GuestsPicker criteria={criteria} onChange={update} />

      <Button type="submit" size="lg" className={styles.submit}>
        Search
      </Button>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
    </form>
  );
}

/* -------------------------------------------------- destination search */

function DestinationInput({
  value,
  onChange,
  onSelectHotel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectHotel: (destination: Destination) => void;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const [active, setActive] = useState(-1);
  const query = useDebouncedValue(value, 200);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  useEffect(() => {
    let current = true;
    api.searchDestinations(query).then((results) => current && setSuggestions(results));
    return () => {
      current = false;
    };
  }, [query]);

  const choose = (destination: Destination) => {
    setOpen(false);
    if (destination.type === 'hotel') onSelectHotel(destination);
    else onChange(destination.label);
  };

  return (
    <div className={`${styles.field} ${styles.destination}`} ref={ref}>
      <label className={styles.label} htmlFor="destination">
        Destination or property
      </label>
      <input
        id="destination"
        className={styles.input}
        placeholder="Where are you going? e.g. Bangkok"
        autoComplete="off"
        value={value}
        role="combobox"
        aria-expanded={open}
        aria-controls="destination-suggestions"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={(event) => {
          if (!open || !suggestions.length) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
          } else if (event.key === 'Enter' && active >= 0) {
            event.preventDefault();
            choose(suggestions[active]);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && suggestions.length > 0 && (
        <ul className={styles.suggestions} id="destination-suggestions" role="listbox">
          {!value && <li className={styles.suggestionHeading}>Popular destinations</li>}
          {suggestions.map((s, i) => (
            <li
              key={`${s.type}-${s.id}`}
              role="option"
              aria-selected={i === active}
              className={`${styles.suggestion} ${i === active ? styles.suggestionActive : ''}`}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(s);
              }}
            >
              <span className={styles.suggestionIcon}>{s.type === 'city' ? '📍' : '🏨'}</span>
              <span>
                <strong>{s.label}</strong>
                <span className={styles.suggestionSub}>{s.sublabel}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------- guests picker */

function GuestsPicker({ criteria, onChange }: { criteria: SearchCriteria; onChange: (patch: Partial<SearchCriteria>) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  const summary = `${criteria.adults} adult${criteria.adults > 1 ? 's' : ''}${
    criteria.children ? `, ${criteria.children} child${criteria.children > 1 ? 'ren' : ''}` : ''
  } · ${criteria.rooms} room${criteria.rooms > 1 ? 's' : ''}`;

  return (
    <div className={`${styles.field} ${styles.guests}`} ref={ref}>
      <span className={styles.label}>Guests</span>
      <button type="button" className={`${styles.input} ${styles.guestsButton}`} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {summary}
      </button>
      {open && (
        <div className={styles.popover}>
          <Stepper label="Adults" hint="Ages 18+" value={criteria.adults} min={Math.max(1, criteria.rooms)} max={16} onChange={(adults) => onChange({ adults })} />
          <Stepper label="Children" hint="Ages 0-17" value={criteria.children} min={0} max={10} onChange={(children) => onChange({ children })} />
          <Stepper
            label="Rooms"
            value={criteria.rooms}
            min={1}
            max={8}
            onChange={(rooms) => onChange({ rooms, adults: Math.max(criteria.adults, rooms) })}
          />
          <Button type="button" size="sm" block onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.stepper}>
      <div>
        <div className={styles.stepperLabel}>{label}</div>
        {hint && <div className={styles.stepperHint}>{hint}</div>}
      </div>
      <div className={styles.stepperControls}>
        <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          −
        </button>
        <span aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          +
        </button>
      </div>
    </div>
  );
}
