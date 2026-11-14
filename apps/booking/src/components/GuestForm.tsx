import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, isEmail, isPhone, type GuestDetails } from '@mini-agoda/shared';
import styles from './components.module.css';

const COUNTRIES = ['India', 'Singapore', 'Thailand', 'Japan', 'Indonesia', 'Malaysia', 'United Arab Emirates', 'United Kingdom', 'United States', 'Australia', 'France', 'Germany'];

type Errors = Partial<Record<keyof GuestDetails, string>>;

function validate(guest: GuestDetails): Errors {
  const errors: Errors = {};
  if (!guest.firstName.trim()) errors.firstName = 'Enter your first name';
  if (!guest.lastName.trim()) errors.lastName = 'Enter your last name';
  if (!isEmail(guest.email)) errors.email = 'Enter a valid email address';
  if (!isPhone(guest.phone)) errors.phone = 'Enter a valid phone number';
  if (!guest.country) errors.country = 'Select your country of residence';
  return errors;
}

interface Props {
  value: GuestDetails;
  onChange: (value: GuestDetails) => void;
  onSubmit: () => void;
  signedIn: boolean;
}

export function GuestForm({ value, onChange, onSubmit, signedIn }: Props) {
  const location = useLocation();
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);

  const set = (field: keyof GuestDetails, fieldValue: string) => {
    const next = { ...value, [field]: fieldValue };
    onChange(next);
    if (touched) setErrors(validate(next));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    const result = validate(value);
    setErrors(result);
    if (Object.keys(result).length === 0) onSubmit();
    else document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  };

  const field = (name: keyof GuestDetails, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="ma-label" htmlFor={`guest-${name}`}>
        {label}
      </label>
      <input
        id={`guest-${name}`}
        className="ma-input"
        value={value[name] ?? ''}
        onChange={(e) => set(name, e.target.value)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `guest-${name}-error` : undefined}
        {...props}
      />
      {errors[name] && (
        <div className="ma-field-error" id={`guest-${name}-error`}>
          {errors[name]}
        </div>
      )}
    </div>
  );

  return (
    <form className={`ma-card ${styles.panel}`} onSubmit={submit} noValidate>
      <h2 className={styles.panelTitle}>Who&apos;s checking in?</h2>
      {!signedIn && (
        <div className={styles.notice}>
          <Link to={`/account/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}>Sign in</Link> to book faster and manage this
          booking in My trips - or continue as a guest.
        </div>
      )}

      <div className={styles.grid2}>
        {field('firstName', 'First name', { autoComplete: 'given-name' })}
        {field('lastName', 'Last name', { autoComplete: 'family-name' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'Your confirmation will be sent here' })}
        {field('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', placeholder: '+65 9123 4567' })}
        <div>
          <label className="ma-label" htmlFor="guest-country">
            Country of residence
          </label>
          <select
            id="guest-country"
            className="ma-input"
            value={value.country}
            onChange={(e) => set('country', e.target.value)}
            aria-invalid={Boolean(errors.country)}
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
          {errors.country && <div className="ma-field-error">{errors.country}</div>}
        </div>
        <div>
          <label className="ma-label" htmlFor="guest-arrival">
            Estimated arrival time <span className="ma-muted">(optional)</span>
          </label>
          <select id="guest-arrival" className="ma-input" value={value.arrivalTime} onChange={(e) => set('arrivalTime', e.target.value)}>
            <option value="">I don&apos;t know</option>
            {['12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00', 'After 22:00'].map((slot) => (
              <option key={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="ma-label" htmlFor="guest-requests">
          Special requests <span className="ma-muted">(optional, not guaranteed)</span>
        </label>
        <textarea
          id="guest-requests"
          className="ma-input"
          rows={3}
          maxLength={500}
          placeholder="e.g. high floor, late check-in, airport pickup"
          value={value.specialRequests}
          onChange={(e) => set('specialRequests', e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" size="lg">
          Next: payment
        </Button>
      </div>
    </form>
  );
}
