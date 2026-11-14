import { Link } from 'react-router-dom';
import {
  api,
  Button,
  EmptyState,
  hotelUrl,
  Price,
  ScoreBadge,
  Skeleton,
  SmartImage,
  StarRating,
  useAsync,
  useDocumentTitle,
  useWishlist,
  WishlistButton,
} from '@mini-agoda/shared';
import styles from '../components/account.module.css';

export function WishlistPage() {
  useDocumentTitle('Wishlist');
  const { hotelIds } = useWishlist();
  const key = hotelIds.join(',');
  const { data, loading } = useAsync(() => api.getHotelsByIds(hotelIds), [key]);
  // Hide hearts that were just un-saved without waiting for a refetch.
  const hotels = (data ?? []).filter((hotel) => hotelIds.includes(hotel.id));

  return (
    <div>
      <h1 className={styles.pageTitle}>Wishlist</h1>
      {hotelIds.length === 0 ? (
        <div className="ma-card">
          <EmptyState icon="♡" title="No saved properties yet" action={<Button to="/search">Find places to stay</Button>}>
            Tap the heart on any property to save it here for later.
          </EmptyState>
        </div>
      ) : loading && !data ? (
        <div className={styles.wishGrid}>
          {hotelIds.map((id) => (
            <Skeleton key={id} height={260} />
          ))}
        </div>
      ) : (
        <div className={styles.wishGrid}>
          {hotels.map((hotel) => (
            <Link key={hotel.id} to={hotelUrl(hotel.id)} className={`ma-card ${styles.wish}`}>
              <div className={styles.wishImage}>
                <SmartImage src={hotel.images[0]} alt={hotel.name} seed={hotel.id} />
                <span className={styles.wishHeart}>
                  <WishlistButton hotelId={hotel.id} hotelName={hotel.name} />
                </span>
              </div>
              <div className={styles.wishBody}>
                <strong>{hotel.name}</strong>
                <StarRating stars={hotel.stars} />
                <span className="ma-muted">
                  {hotel.city}, {hotel.country}
                </span>
                <div className={styles.wishFooter}>
                  <ScoreBadge score={hotel.reviewScore} compact />
                  <Price amount={hotel.pricePerNight} originalAmount={hotel.originalPrice} suffix="per night" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
