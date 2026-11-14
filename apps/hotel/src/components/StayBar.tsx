import { useEffect, useState } from 'react';
import { addDays, Button, nightsBetween, today, type SearchCriteria } from '@mini-agoda/shared';
import styles from './StayBar.module.css';

/** Lets the guest tweak dates / occupancy without going back to search. */
export function StayBar({ criteria, onChange }: { criteria: SearchCriteria; onChange: (criteria: SearchCriteria) => void }) {
  const [draft, setDraft] = useState(criteria);
  useEffect(() => setDraft(criteria), [criteria]);

  const nights = nightsBetween(draft.checkIn, draft.checkOut);
  const dirty = JSON.stringify(draft) !== JSON.stringify(criteria);
  const valid = nights >= 1 && nights <= 30;

  const set = (patch: Partial<SearchCriteria>) =>
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (patch.checkIn && nightsBetween(next.checkIn, next.checkOut) < 1) next.checkOut = addDays(next.checkIn, 1);
      if (next.adults < next.rooms) next.adults = next.rooms;
      return next;
    });

  const number = (value: string, min: number, max: number) => Math.min(max, Math.max(min, Number(value) || min));

  return (
    <form
      className={`ma-card ${styles.bar}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onChange(draft);
      }}
    >
      <label className={styles.field}>
        <span>Check-in</span>
        <input type="date" className="ma-input" min={today()} value={draft.checkIn} onChange={(e) => e.target.value && set({ checkIn: e.target.value })} />
      </label>
      <label className={styles.field}>
        <span>Check-out</span>
        <input type="date" className="ma-input" min={addDays(draft.checkIn, 1)} value={draft.checkOut} onChange={(e) => e.target.value && set({ checkOut: e.target.value })} />
      </label>
      <label className={styles.field}>
        <span>Adults</span>
        <input type="number" className="ma-input" min={1} max={16} value={draft.adults} onChange={(e) => set({ adults: number(e.target.value, 1, 16) })} />
      </label>
      <label className={styles.field}>
        <span>Children</span>
        <input type="number" className="ma-input" min={0} max={10} value={draft.children} onChange={(e) => set({ children: number(e.target.value, 0, 10) })} />
      </label>
      <label className={styles.field}>
        <span>Rooms</span>
        <input type="number" className="ma-input" min={1} max={8} value={draft.rooms} onChange={(e) => set({ rooms: number(e.target.value, 1, 8) })} />
      </label>
      <Button type="submit" variant={dirty ? 'primary' : 'secondary'} disabled={!dirty || !valid}>
        {dirty ? 'Update' : `${nights} night${nights === 1 ? '' : 's'}`}
      </Button>
    </form>
  );
}
