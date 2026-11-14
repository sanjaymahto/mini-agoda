import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  Badge,
  CITIES,
  criteriaToParams,
  defaultCriteria,
  discountPercent,
  formatDateRange,
  hotelUrl,
  Price,
  ScoreBadge,
  Skeleton,
  SmartImage,
  StarRating,
  useAsync,
  useDocumentTitle,
  WishlistButton,
} from '@mini-agoda/shared';
import { SearchForm } from '../components/SearchForm';
import { getRecentSearches } from '../lib/recentSearches';
import styles from './HomePage.module.css';

const VALUE_PROPS = [
  { icon: '💸', title: 'Best price guarantee', text: 'Found it cheaper? We will refund the difference.' },
  { icon: '🛎️', title: '24/7 customer support', text: 'Real people, in your language, whenever you need help.' },
  { icon: '🔒', title: 'Secure booking', text: 'Your payment details are encrypted end to end.' },
  { icon: '✅', title: 'Free cancellation', text: 'On most rooms - plans change, we get it.' },
];

/** Exposed as `search/HomePage`. Mounted by the shell at `/`. */
export default function HomePage() {
  useDocumentTitle('Hotels, resorts & apartments');
  const initial = useMemo(defaultCriteria, []);
  const recent = useMemo(getRecentSearches, []);
  const deals = useAsync(() => api.getDeals(8), []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="ma-container">
          <h1 className={styles.heroTitle}>See the world for less</h1>
          <p className={styles.heroSubtitle}>Compare {CITIES.reduce((n, c) => n + c.propertyCount, 0)} hotels, resorts and homes across Asia and beyond.</p>
          <SearchForm initial={initial} variant="hero" />
        </div>
      </section>

      <div className="ma-container">
        {recent.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your recent searches</h2>
            <div className={styles.recentGrid}>
              {recent.map((criteria) => (
                <Link key={criteria.destination} to={`/search?${criteriaToParams(criteria)}`} className={`ma-card ${styles.recent}`}>
                  <strong>{criteria.destination}</strong>
                  <span className="ma-muted">
                    {formatDateRange(criteria.checkIn, criteria.checkOut)} · {criteria.adults + criteria.children} guests
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Popular destinations</h2>
          <div className={styles.cityGrid}>
            {CITIES.map((city) => (
              <Link key={city.id} to={`/search?${criteriaToParams({ ...initial, destination: city.name })}`} className={styles.city}>
                <SmartImage src={city.image} alt={city.name} seed={city.id} />
                <div className={styles.cityOverlay}>
                  <strong>{city.name}</strong>
                  <span>{city.propertyCount} properties</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Today&apos;s top deals</h2>
            <Link to="/search?sort=price_asc">See all deals →</Link>
          </div>
          <div className={styles.dealGrid}>
            {deals.loading && !deals.data
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={300} />)
              : deals.data?.map((hotel) => (
                  <Link key={hotel.id} to={hotelUrl(hotel.id, initial)} className={`ma-card ${styles.deal}`}>
                    <div className={styles.dealImage}>
                      <SmartImage src={hotel.images[0]} alt={hotel.name} seed={hotel.id} />
                      <span className={styles.dealBadge}>
                        <Badge tone="deal">-{discountPercent(hotel.pricePerNight, hotel.originalPrice)}%</Badge>
                      </span>
                      <span className={styles.dealHeart}>
                        <WishlistButton hotelId={hotel.id} hotelName={hotel.name} />
                      </span>
                    </div>
                    <div className={styles.dealBody}>
                      <strong className={styles.dealName}>{hotel.name}</strong>
                      <StarRating stars={hotel.stars} />
                      <span className="ma-muted">{hotel.city}</span>
                      <div className={styles.dealFooter}>
                        <ScoreBadge score={hotel.reviewScore} compact />
                        <Price amount={hotel.pricePerNight} originalAmount={hotel.originalPrice} suffix="per night" />
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.valueGrid}`}>
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className={styles.value}>
              <span className={styles.valueIcon}>{item.icon}</span>
              <strong>{item.title}</strong>
              <span className="ma-muted">{item.text}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
