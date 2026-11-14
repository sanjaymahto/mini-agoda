import { useState } from 'react';
import {
  Button,
  formatDate,
  Money,
  SmartImage,
  StarRating,
  type Hotel,
  type PriceBreakdown,
  type Room,
  type SearchCriteria,
} from '@mini-agoda/shared';
import styles from './components.module.css';

interface Props {
  hotel: Hotel;
  room: Room;
  criteria: SearchCriteria;
  price: PriceBreakdown;
  promoCode?: string;
  onApplyPromo: (code: string) => boolean;
  onRemovePromo: () => void;
}

export function BookingSummary({ hotel, room, criteria, price, promoCode, onApplyPromo, onRemovePromo }: Props) {
  const [code, setCode] = useState('');
  const [promoError, setPromoError] = useState<string>();

  return (
    <aside className={`ma-card ${styles.summary}`} aria-label="Booking summary">
      <div className={styles.summaryHotel}>
        <div className={styles.summaryImage}>
          <SmartImage src={hotel.images[0]} alt={hotel.name} seed={hotel.id} />
        </div>
        <div>
          <strong>{hotel.name}</strong>
          <div>
            <StarRating stars={hotel.stars} />
          </div>
          <div className="ma-muted" style={{ fontSize: 13 }}>
            {hotel.city}, {hotel.country}
          </div>
        </div>
      </div>

      <dl className={styles.stay}>
        <div>
          <dt>Check-in</dt>
          <dd>{formatDate(criteria.checkIn)}</dd>
          <dd className="ma-muted">from {hotel.checkInTime}</dd>
        </div>
        <div>
          <dt>Check-out</dt>
          <dd>{formatDate(criteria.checkOut)}</dd>
          <dd className="ma-muted">until {hotel.checkOutTime}</dd>
        </div>
      </dl>

      <div className={styles.roomInfo}>
        <strong>
          {criteria.rooms} × {room.name}
        </strong>
        <span className="ma-muted">
          {price.nights} night{price.nights === 1 ? '' : 's'} · {criteria.adults} adult{criteria.adults === 1 ? '' : 's'}
          {criteria.children > 0 && `, ${criteria.children} child${criteria.children === 1 ? '' : 'ren'}`}
        </span>
        <span className={room.freeCancellation ? styles.good : styles.warn}>{room.freeCancellation ? '✓ Free cancellation before check-in' : 'Non-refundable rate'}</span>
        {room.breakfastIncluded && <span className={styles.good}>✓ Breakfast included</span>}
      </div>

      <div className={styles.lines}>
        <div className={styles.line}>
          <span>
            Room price ({price.rooms} room{price.rooms === 1 ? '' : 's'} × {price.nights} night{price.nights === 1 ? '' : 's'})
          </span>
          <Money amount={price.roomTotal} />
        </div>
        {price.discount > 0 && (
          <div className={`${styles.line} ${styles.good}`}>
            <span>
              Promo {promoCode}{' '}
              <button type="button" className={styles.link} onClick={onRemovePromo}>
                remove
              </button>
            </span>
            <span>
              −<Money amount={price.discount} />
            </span>
          </div>
        )}
        <div className={styles.line}>
          <span>Taxes & service fees (15%)</span>
          <Money amount={price.taxesAndFees} />
        </div>
        <div className={`${styles.line} ${styles.totalLine}`}>
          <span>Total</span>
          <Money amount={price.total} />
        </div>
      </div>

      {!promoCode && (
        <form
          className={styles.promo}
          onSubmit={(event) => {
            event.preventDefault();
            if (onApplyPromo(code)) {
              setPromoError(undefined);
              setCode('');
            } else {
              setPromoError('This promo code is not valid');
            }
          }}
        >
          <label className="ma-visually-hidden" htmlFor="promo">
            Promo code
          </label>
          <input id="promo" className="ma-input" placeholder="Promo code (try AGODA10)" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit" variant="secondary" disabled={!code.trim()}>
            Apply
          </Button>
          {promoError && <div className={`ma-field-error ${styles.full}`}>{promoError}</div>}
        </form>
      )}
    </aside>
  );
}
