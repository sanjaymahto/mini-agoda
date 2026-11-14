import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  api,
  Button,
  calculatePrice,
  EmptyState,
  findPromo,
  hotelUrl,
  nightsBetween,
  parseCriteria,
  Spinner,
  toast,
  useAsync,
  useAuth,
  useDocumentTitle,
  type GuestDetails,
  type PaymentMethod,
} from '@mini-agoda/shared';
import { BookingSummary } from '../components/BookingSummary';
import { GuestForm } from '../components/GuestForm';
import { PaymentForm, type CardDetails } from '../components/PaymentForm';
import { PriceLockTimer } from '../components/PriceLockTimer';
import { Steps } from '../components/Steps';
import styles from './CheckoutPage.module.css';

type Step = 'details' | 'payment';

/** `/booking/checkout?hotelId=…&roomId=…&checkIn=…&checkOut=…&adults=…&children=…&rooms=…` */
export function CheckoutPage() {
  useDocumentTitle('Secure checkout');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hotelId = params.get('hotelId') ?? '';
  const roomId = params.get('roomId') ?? '';
  const query = params.toString();
  const criteria = useMemo(() => parseCriteria(new URLSearchParams(query)), [query]);
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);

  const { data, error, loading } = useAsync(() => api.getRoom(hotelId, roomId), [hotelId, roomId]);

  const [step, setStep] = useState<Step>('details');
  const [guest, setGuest] = useState<GuestDetails>(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    country: user?.country ?? '',
    arrivalTime: '',
    specialRequests: '',
  }));
  const [promoCode, setPromoCode] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  if (!hotelId || !roomId) {
    return (
      <div className="ma-container" style={{ padding: '40px 20px' }}>
        <div className="ma-card">
          <EmptyState icon="🛏️" title="No room selected" action={<Button to="/search">Find a hotel</Button>}>
            Choose a room on a property page to start your booking.
          </EmptyState>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ma-container" style={{ padding: '40px 20px' }}>
        <div className="ma-card">
          <EmptyState icon="😕" title="This room is no longer available" action={<Button to={hotelUrl(hotelId, criteria)}>Choose another room</Button>}>
            {error.message}
          </EmptyState>
        </div>
      </div>
    );
  }

  if (loading || !data) return <Spinner label="Preparing your booking…" />;

  const { hotel, room } = data;
  const price = calculatePrice(room.pricePerNight, nights, criteria.rooms, promoCode);

  const confirm = async (paymentMethod: PaymentMethod, card?: CardDetails) => {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const booking = await api.createBooking({
        userId: user?.id,
        hotelId,
        roomId,
        checkIn: criteria.checkIn,
        checkOut: criteria.checkOut,
        adults: criteria.adults,
        children: criteria.children,
        rooms: criteria.rooms,
        guest,
        paymentMethod,
        cardLast4: card?.number.replace(/\s/g, '').slice(-4),
        promoCode,
      });
      navigate(`/booking/confirmation/${booking.id}`, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setSubmitError(message);
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <div className={`ma-container ${styles.page}`}>
      <Link to={hotelUrl(hotel.id, criteria)} className={styles.back}>
        ‹ Back to {hotel.name}
      </Link>
      <Steps current={step === 'details' ? 1 : 2} />
      <PriceLockTimer minutes={20} />

      <div className={styles.layout}>
        <div>
          {step === 'details' ? (
            <GuestForm
              value={guest}
              onChange={setGuest}
              signedIn={Boolean(user)}
              onSubmit={() => {
                setStep('payment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : (
            <PaymentForm
              total={price.total}
              payAtHotelAvailable={room.payAtHotel}
              submitting={submitting}
              error={submitError}
              onBack={() => setStep('details')}
              onSubmit={confirm}
            />
          )}
        </div>
        <BookingSummary
          hotel={hotel}
          room={room}
          criteria={criteria}
          price={price}
          promoCode={promoCode}
          onApplyPromo={(code) => {
            const promo = findPromo(code);
            if (promo) {
              setPromoCode(promo.code);
              toast.success(`Promo ${promo.code} applied: ${promo.description}`);
              return true;
            }
            return false;
          }}
          onRemovePromo={() => setPromoCode(undefined)}
        />
      </div>
    </div>
  );
}
