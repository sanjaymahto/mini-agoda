import { useNavigate } from 'react-router-dom';
import {
  api,
  Badge,
  Button,
  checkoutUrl,
  discountPercent,
  ErrorState,
  Money,
  nightsBetween,
  Price,
  Skeleton,
  SmartImage,
  useAsync,
  type Hotel,
  type Room,
  type SearchCriteria,
} from '@mini-agoda/shared';
import styles from './RoomList.module.css';

export function RoomList({ hotel, criteria }: { hotel: Hotel; criteria: SearchCriteria }) {
  const { data: rooms, error, loading, reload } = useAsync(() => api.getRooms(hotel.id), [hotel.id]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !rooms) {
    return (
      <div className={styles.list}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={170} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {rooms.map((room) => (
        <RoomCard key={room.id} hotel={hotel} room={room} criteria={criteria} />
      ))}
    </div>
  );
}

function RoomCard({ hotel, room, criteria }: { hotel: Hotel; room: Room; criteria: SearchCriteria }) {
  const navigate = useNavigate();
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const guests = criteria.adults + criteria.children;
  const capacity = room.maxGuests * criteria.rooms;
  const tooSmall = guests > capacity;
  const soldOut = criteria.rooms > room.roomsLeft;
  const discount = discountPercent(room.pricePerNight, room.originalPrice);

  const reserve = () => {
    const { destination: _ignored, ...stay } = criteria;
    navigate(checkoutUrl(hotel.id, room.id, stay));
  };

  return (
    <article className={`ma-card ${styles.card}`}>
      <div className={styles.image}>
        <SmartImage src={room.image} alt={room.name} seed={room.id} />
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{room.name}</h3>
        <ul className={styles.specs}>
          <li>🛏️ 1 {room.bedType} bed</li>
          <li>📐 {room.sizeSqm} m²</li>
          <li>👤 Sleeps {room.maxGuests}</li>
        </ul>
        <ul className={styles.amenities}>
          {room.amenities.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
      </div>

      <div className={styles.conditions}>
        {room.breakfastIncluded ? <span className={styles.good}>🍳 Breakfast included</span> : <span className="ma-muted">Room only</span>}
        {room.freeCancellation ? <span className={styles.good}>✓ Free cancellation</span> : <span className={styles.warn}>Non-refundable</span>}
        {room.payAtHotel && <span className={styles.good}>✓ Pay at the hotel</span>}
        {room.roomsLeft <= 3 && <span className={styles.urgent}>Only {room.roomsLeft} left on our site!</span>}
      </div>

      <div className={styles.pricing}>
        {discount > 0 && <Badge tone="deal">-{discount}%</Badge>}
        <Price amount={room.pricePerNight} originalAmount={room.originalPrice} suffix="per room / night" />
        <span className={styles.total}>
          <Money amount={room.pricePerNight * nights * criteria.rooms} /> total · {nights} night{nights === 1 ? '' : 's'}, {criteria.rooms} room{criteria.rooms === 1 ? '' : 's'}
        </span>
        <Button onClick={reserve} disabled={tooSmall || soldOut} block>
          Reserve
        </Button>
        {tooSmall && <span className={styles.hint}>Fits {capacity} guests - add rooms</span>}
        {soldOut && <span className={styles.hint}>Only {room.roomsLeft} available</span>}
      </div>
    </article>
  );
}
