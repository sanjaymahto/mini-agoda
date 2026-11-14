const DAY_MS = 86_400_000;

/** Parses "YYYY-MM-DD" as a *local* date (new Date("2026-01-01") would be UTC). */
export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(value: string | Date, days: number): string {
  const date = typeof value === 'string' ? parseISODate(value) : new Date(value);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function today(): string {
  return toISODate(new Date());
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const diff = Math.round((parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime()) / DAY_MS);
  return Math.max(0, diff);
}

export function isValidISODate(value: string | null | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseISODate(value).getTime()));
}

/** "Fri, 20 Nov 2026" */
export function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}): string {
  return parseISODate(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

/** "20 Nov - 22 Nov" */
export function formatDateRange(checkIn: string, checkOut: string): string {
  const opts: Intl.DateTimeFormatOptions = { weekday: undefined, year: undefined };
  return `${formatDate(checkIn, opts)} - ${formatDate(checkOut, opts)}`;
}
