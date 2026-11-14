import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  eventBus,
  formatDateRange,
  hotelUrl,
  Modal,
  Money,
  SmartImage,
  Spinner,
  toast,
  today,
  useAsync,
  useAuth,
  useDocumentTitle,
  type Booking,
} from '@mini-agoda/shared';
import styles from '../components/account.module.css';

type Tab = 'upcoming' | 'past' | 'cancelled';

function categorize(booking: Booking): Tab {
  if (booking.status === 'cancelled') return 'cancelled';
  return booking.checkOut >= today() ? 'upcoming' : 'past';
}

export function TripsPage() {
  useDocumentTitle('My trips');
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [toCancel, setToCancel] = useState<Booking>();
  const [cancelling, setCancelling] = useState(false);
  const { data, error, loading, reload } = useAsync(() => api.getBookings(user!.id), [user?.id]);

  // Stay in sync with bookings made/cancelled by other MFEs (or other tabs).
  useEffect(() => {
    const offs = [eventBus.on('booking:created', reload), eventBus.on('booking:cancelled', reload)];
    return () => offs.forEach((off) => off());
  }, [reload]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !data) return <Spinner label="Loading your trips…" />;

  const bookings = (data ?? []).filter((b) => categorize(b) === tab).sort((a, b) => (tab === 'past' ? b.checkIn.localeCompare(a.checkIn) : a.checkIn.localeCompare(b.checkIn)));
  const count = (t: Tab) => (data ?? []).filter((b) => categorize(b) === t).length;

  const cancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      await api.cancelBooking(toCancel.id);
      toast.success(`Booking ${toCancel.id} cancelled - your refund is on its way`);
      setToCancel(undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>My trips</h1>
      <div className={styles.tabs} role="tablist">
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)} ({count(t)})
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="ma-card">
          <EmptyState icon="🧳" title={tab === 'upcoming' ? 'No upcoming trips' : `No ${tab} bookings`} action={<Button to="/">Start exploring</Button>}>
            {tab === 'upcoming' ? 'Where to next? Your bookings will appear here.' : 'Nothing to show here yet.'}
          </EmptyState>
        </div>
      ) : (
        <div className={styles.tripList}>
          {bookings.map((booking) => (
            <article key={booking.id} className={`ma-card ${styles.trip}`}>
              <div className={styles.tripImage}>
                <SmartImage src={booking.hotelImage} alt={booking.hotelName} seed={booking.hotelId} />
              </div>
              <div className={styles.tripBody}>
                <div className={styles.tripHeader}>
                  <Link to={hotelUrl(booking.hotelId)} className={styles.tripName}>
                    {booking.hotelName}
                  </Link>
                  <Badge tone={booking.status === 'cancelled' ? 'muted' : 'success'}>{booking.status}</Badge>
                </div>
                <div className="ma-muted">
                  {booking.city} · {formatDateRange(booking.checkIn, booking.checkOut)} · {booking.price.nights} night{booking.price.nights === 1 ? '' : 's'}
                </div>
                <div>
                  {booking.rooms} × {booking.roomName} · {booking.adults + booking.children} guests
                </div>
                <div className={styles.tripFooter}>
                  <span>
                    Booking ID <code>{booking.id}</code> · <strong><Money amount={booking.price.total} /></strong>
                  </span>
                  <span className={styles.tripActions}>
                    <Button variant="ghost" size="sm" to={`/booking/confirmation/${booking.id}`}>
                      Details
                    </Button>
                    {tab === 'upcoming' &&
                      (booking.freeCancellation ? (
                        <Button variant="danger" size="sm" onClick={() => setToCancel(booking)}>
                          Cancel
                        </Button>
                      ) : (
                        <span className="ma-muted" style={{ fontSize: 12 }}>
                          Non-refundable
                        </span>
                      ))}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal title="Cancel booking?" open={Boolean(toCancel)} onClose={() => !cancelling && setToCancel(undefined)}>
        {toCancel && (
          <div style={{ display: 'grid', gap: 16 }}>
            <p style={{ margin: 0 }}>
              You&apos;re about to cancel your stay at <strong>{toCancel.hotelName}</strong> ({formatDateRange(toCancel.checkIn, toCancel.checkOut)}). This booking has free
              cancellation, so you will receive a full refund of <Money amount={toCancel.price.total} />.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setToCancel(undefined)} disabled={cancelling}>
                Keep booking
              </Button>
              <Button variant="danger" onClick={cancel} loading={cancelling}>
                Yes, cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
