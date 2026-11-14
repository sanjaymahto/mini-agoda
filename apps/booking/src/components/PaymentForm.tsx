import { useState, type FormEvent } from 'react';
import { Button, formatCardExpiry, formatCardNumber, isCardExpiry, isCardNumber, isCvv, Money, type PaymentMethod } from '@mini-agoda/shared';
import styles from './components.module.css';

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

type Errors = Partial<Record<keyof CardDetails, string>>;

interface Props {
  total: number;
  payAtHotelAvailable: boolean;
  submitting: boolean;
  error?: string;
  onBack: () => void;
  onSubmit: (method: PaymentMethod, card?: CardDetails) => void;
}

export function PaymentForm({ total, payAtHotelAvailable, submitting, error, onBack, onSubmit }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [card, setCard] = useState<CardDetails>({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [agreed, setAgreed] = useState(false);

  const validate = (): Errors => {
    if (method !== 'card') return {};
    const result: Errors = {};
    if (!isCardNumber(card.number)) result.number = 'Enter a valid card number';
    if (!card.name.trim()) result.name = 'Enter the name on the card';
    if (!isCardExpiry(card.expiry)) result.expiry = 'Enter a valid expiry (MM/YY)';
    if (!isCvv(card.cvv)) result.cvv = 'Enter the 3-4 digit CVV';
    return result;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = validate();
    setErrors(result);
    if (Object.keys(result).length === 0 && agreed) onSubmit(method, method === 'card' ? card : undefined);
  };

  const brand = /^4/.test(card.number) ? 'VISA' : /^5[1-5]/.test(card.number) ? 'Mastercard' : /^3[47]/.test(card.number) ? 'AMEX' : '';

  return (
    <form className={`ma-card ${styles.panel}`} onSubmit={submit} noValidate>
      <h2 className={styles.panelTitle}>How would you like to pay?</h2>

      <div className={styles.methods} role="radiogroup">
        <label className={`${styles.method} ${method === 'card' ? styles.methodActive : ''}`}>
          <input type="radio" name="method" checked={method === 'card'} onChange={() => setMethod('card')} />
          💳 Credit / debit card
        </label>
        <label className={`${styles.method} ${method === 'pay_at_hotel' ? styles.methodActive : ''} ${!payAtHotelAvailable ? styles.methodDisabled : ''}`}>
          <input type="radio" name="method" disabled={!payAtHotelAvailable} checked={method === 'pay_at_hotel'} onChange={() => setMethod('pay_at_hotel')} />
          🏨 Pay at the hotel {!payAtHotelAvailable && <span className="ma-muted">(not available for this room)</span>}
        </label>
      </div>

      {method === 'card' ? (
        <div className={styles.grid2}>
          <div className={styles.full}>
            <label className="ma-label" htmlFor="card-number">
              Card number {brand && <span className={styles.brand}>{brand}</span>}
            </label>
            <input
              id="card-number"
              className="ma-input"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              aria-invalid={Boolean(errors.number)}
            />
            {errors.number && <div className="ma-field-error">{errors.number}</div>}
          </div>
          <div className={styles.full}>
            <label className="ma-label" htmlFor="card-name">
              Name on card
            </label>
            <input
              id="card-name"
              className="ma-input"
              autoComplete="cc-name"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <div className="ma-field-error">{errors.name}</div>}
          </div>
          <div>
            <label className="ma-label" htmlFor="card-expiry">
              Expiry date
            </label>
            <input
              id="card-expiry"
              className="ma-input"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(e) => setCard({ ...card, expiry: formatCardExpiry(e.target.value) })}
              aria-invalid={Boolean(errors.expiry)}
            />
            {errors.expiry && <div className="ma-field-error">{errors.expiry}</div>}
          </div>
          <div>
            <label className="ma-label" htmlFor="card-cvv">
              CVV
            </label>
            <input
              id="card-cvv"
              className="ma-input"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              placeholder="123"
              value={card.cvv}
              onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
              aria-invalid={Boolean(errors.cvv)}
            />
            {errors.cvv && <div className="ma-field-error">{errors.cvv}</div>}
          </div>
          <div className={`${styles.full} ${styles.notice}`}>🔒 Demo only - use test card 4242 4242 4242 4242 with any future expiry. Nothing is charged.</div>
        </div>
      ) : (
        <div className={styles.notice}>You won&apos;t be charged now. Pay the property directly during your stay.</div>
      )}

      <label className={styles.agree}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        I agree to the booking conditions, cancellation policy and privacy policy.
      </label>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
          ‹ Back to details
        </Button>
        <Button type="submit" size="lg" loading={submitting} disabled={!agreed}>
          {method === 'card' ? (
            <>
              Pay <Money amount={total} /> now
            </>
          ) : (
            'Complete booking'
          )}
        </Button>
      </div>
    </form>
  );
}
