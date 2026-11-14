import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  discountPercent,
  hotelUrl,
  Money,
  nightsBetween,
  Price,
  ScoreBadge,
  SmartImage,
  StarRating,
  WishlistButton,
  type Hotel,
  type SearchCriteria,
} from '@mini-agoda/shared';
import styles from './HotelCard.module.css';

export function HotelCard({ hotel, criteria }: { hotel: Hotel; criteria: SearchCriteria }) {
  const url = hotelUrl(hotel.id, criteria);
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const discount = discountPercent(hotel.pricePerNight, hotel.originalPrice);

  return (
    <article className={`ma-card ${styles.card}`}>
      <Link to={url} className={styles.imageWrap} aria-label={hotel.name}>
        <SmartImage src={hotel.images[0]} alt={hotel.name} seed={hotel.id} />
        {discount > 0 && (
          <span className={styles.deal}>
            <Badge tone="deal">-{discount}% today</Badge>
          </span>
        )}
        <span className={styles.heart}>
          <WishlistButton hotelId={hotel.id} hotelName={hotel.name} />
        </span>
      </Link>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <Link to={url} className={styles.name}>
            {hotel.name}
          </Link>
        </div>
        <div className={styles.meta}>
          <StarRating stars={hotel.stars} />
          <Badge tone="muted">{hotel.propertyType}</Badge>
        </div>
        <div className={styles.location}>
          📍 {hotel.city}, {hotel.country} · {hotel.distanceToCenterKm} km from centre
        </div>
        <ul className={styles.amenities}>
          {hotel.amenities.slice(0, 4).map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
        <div className={styles.perks}>
          {hotel.freeCancellation && <span className={styles.perk}>✓ Free cancellation</span>}
          {hotel.payAtHotel && <span className={styles.perk}>✓ Pay at the hotel</span>}
        </div>
      </div>

      <div className={styles.side}>
        <ScoreBadge score={hotel.reviewScore} count={hotel.reviewCount} />
        <div className={styles.priceBlock}>
          <Price amount={hotel.pricePerNight} originalAmount={hotel.originalPrice} suffix="per night, before taxes" />
          {nights > 1 && (
            <div className={styles.total}>
              <Money amount={hotel.pricePerNight * nights * criteria.rooms} /> for {nights} nights
            </div>
          )}
          <Button to={url} size="sm">
            View deal
          </Button>
        </div>
      </div>
    </article>
  );
}

export function HotelCardSkeleton() {
  return <div className={`ma-card ${styles.skeleton}`} aria-hidden />;
}
