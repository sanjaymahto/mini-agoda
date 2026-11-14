import { useParams } from 'react-router-dom';
import {
  api,
  Button,
  EmptyState,
  formatDate,
  hotelUrl,
  Money,
  SmartImage,
  Spinner,
  useAsync,
  useAuth,
  useDocumentTitle,
} from '@mini-agoda/shared';
import { Steps } from '../components/Steps';
import styles from './ConfirmationPage.module.css';

/** `/booking/confirmation/:bookingId` */
export function ConfirmationPage() {
  const { bookingId = '' } = useParams();
  const { isAuthenticated } = useAuth();
  const { data: booking, error, loading } = useAsync(() => api.getBooking(bookingId), [bookingId]);
  useDocumentTitle(booking ? `Booking ${booking.id} confirmed` : 'Booking confirmation');

  if (loading) return <Spinner label="Loading your booking…" />;
  if (error || !booking) {
    return (
      <div className="ma-container" style={{ padding: '40px 20px' }}>
        <div className="ma-card">
          <EmptyState icon="🔎" title="Booking not found" action={<Button to="/">Back to home</Button>}>
            We couldn&apos;t find booking <code>{bookingId}</code> on this device.
          </EmptyState>
        </div>
      </div>
    );
  }

  const { guest, price } = booking;

  return (
    <div className={`ma-container ${styles.page}`}>
      <Steps current={3} />

      <div className={`ma-card ${styles.hero}`}>
        <div className={styles.check}>✓</div>
        <div>
          <h1 className={styles.title}>{booking.status === 'cancelled' ? 'This booking was cancelled' : 'Your booking is confirmed!'}</h1>
          <p className={styles.subtitle}>
            We&apos;ve sent the confirmation to <strong>{guest.email}</strong>. Booking ID: <strong className={styles.id}>{booking.id}</strong>
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={`ma-card ${styles.card}`}>
          <div className={styles.hotel}>
            <div className={styles.image}>
              <SmartImage src={booking.hotelImage} alt={booking.hotelName} seed={booking.hotelId} />
            </div>
            <div>
              <h2 className={styles.hotelName}>{booking.hotelName}</h2>
              <div className="ma-muted">{booking.city}</div>
              <div style={{ marginTop: 6 }}>
                {booking.rooms} × {booking.roomName}
              </div>
            </div>
          </div>

          <dl className={styles.details}>
            <dt>Check-in</dt>
            <dd>{formatDate(booking.checkIn)}</dd>
            <dt>Check-out</dt>
            <dd>{formatDate(booking.checkOut)}</dd>
            <dt>Guests</dt>
            <dd>
              {booking.adults} adult{booking.adults === 1 ? '' : 's'}
              {booking.children > 0 && `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}`}
            </dd>
            <dt>Lead guest</dt>
            <dd>
              {guest.firstName} {guest.lastName} · {guest.phone}
            </dd>
            {guest.specialRequests && (
              <>
                <dt>Requests</dt>
                <dd>{guest.specialRequests}</dd>
              </>
            )}
            <dt>Cancellation</dt>
            <dd>{booking.freeCancellation ? 'Free cancellation before check-in' : 'Non-refundable'}</dd>
          </dl>
        </div>

        <div className={`ma-card ${styles.card}`}>
          <h3 className={styles.cardTitle}>Payment</h3>
          <div className={styles.line}>
            <span>Room price</span>
            <Money amount={price.roomTotal} />
          </div>
          {price.discount > 0 && (
            <div className={styles.line}>
              <span>Promo {booking.promoCode}</span>
              <span>
                −<Money amount={price.discount} />
              </span>
            </div>
          )}
          <div className={styles.line}>
            <span>Taxes & fees</span>
            <Money amount={price.taxesAndFees} />
          </div>
          <div className={`${styles.line} ${styles.total}`}>
            <span>{booking.paymentMethod === 'card' ? 'Paid' : 'Pay at hotel'}</span>
            <Money amount={price.total} />
          </div>
          <div className="ma-muted" style={{ fontSize: 13 }}>
            {booking.paymentMethod === 'card' ? `Charged to card ending ${booking.cardLast4}` : 'Payment is collected by the property during your stay.'}
          </div>

          <div className={styles.actions}>
            {isAuthenticated ? <Button to="/account/trips">View my trips</Button> : <Button to="/account/login?redirect=/account/trips">Sign in to manage</Button>}
            <Button variant="secondary" onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="ghost" to={hotelUrl(booking.hotelId)}>
              View property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
