import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  api,
  ApiError,
  Badge,
  Button,
  criteriaToParams,
  EmptyState,
  ErrorState,
  hotelUrl,
  parseCriteria,
  Price,
  ScoreBadge,
  Skeleton,
  SmartImage,
  StarRating,
  useAsync,
  useDocumentTitle,
  WishlistButton,
  type Hotel,
  type SearchCriteria,
} from '@mini-agoda/shared';
import { Gallery } from '../components/Gallery';
import { Reviews } from '../components/Reviews';
import { RoomList } from '../components/RoomList';
import { StayBar } from '../components/StayBar';
import styles from './HotelPage.module.css';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'location', label: 'Location' },
  { id: 'policies', label: 'Policies' },
];

/**
 * Exposed as `hotel/HotelPage`. Mounted by the shell at `/hotel/:hotelId`.
 * Stay details (dates/guests) arrive as query params from the search MFE.
 */
export default function HotelPage() {
  const { hotelId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const criteria = useMemo(() => parseCriteria(new URLSearchParams(query)), [query]);
  const { data: hotel, error, loading, reload } = useAsync(() => api.getHotel(hotelId), [hotelId]);

  useDocumentTitle(hotel?.name);

  const updateStay = (next: SearchCriteria) => {
    const { destination: _ignored, ...stay } = next;
    setParams(criteriaToParams(stay), { replace: true });
  };

  if (error) {
    return (
      <div className="ma-container" style={{ padding: '40px 20px' }}>
        <div className="ma-card">
          {error instanceof ApiError && error.status === 404 ? (
            <EmptyState icon="🏚️" title="Property not found" action={<Button to="/search">Browse all hotels</Button>}>
              This property doesn&apos;t exist or is no longer listed.
            </EmptyState>
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )}
        </div>
      </div>
    );
  }

  if (loading || !hotel) return <HotelSkeleton />;

  return (
    <div className={styles.page}>
      <div className="ma-container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link> › <Link to={`/search?${criteriaToParams({ ...criteria, destination: hotel.country })}`}>{hotel.country}</Link> ›{' '}
          <Link to={`/search?${criteriaToParams({ ...criteria, destination: hotel.city })}`}>{hotel.city}</Link> › <span>{hotel.name}</span>
        </nav>

        <Gallery images={hotel.images} name={hotel.name} seed={hotel.id} />

        <nav className={styles.tabs} aria-label="Sections">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className={styles.tab}>
              {section.label}
            </a>
          ))}
        </nav>

        <div className={styles.layout}>
          <div className={styles.main}>
            <section id="overview" className={`ma-card ${styles.section}`}>
              <div className={styles.titleRow}>
                <div>
                  <div className={styles.badges}>
                    <Badge tone="muted">{hotel.propertyType}</Badge>
                    <StarRating stars={hotel.stars} />
                  </div>
                  <h1 className={styles.name}>{hotel.name}</h1>
                  <div className={styles.address}>📍 {hotel.address}</div>
                </div>
                <WishlistButton hotelId={hotel.id} hotelName={hotel.name} />
              </div>
              <p className={styles.description}>{hotel.description}</p>
              <ul className={styles.highlights}>
                {hotel.highlights.map((highlight) => (
                  <li key={highlight}>✨ {highlight}</li>
                ))}
              </ul>
            </section>

            <section id="rooms" className={styles.plainSection}>
              <h2 className={styles.sectionTitle}>Choose your room</h2>
              <StayBar criteria={criteria} onChange={updateStay} />
              <RoomList hotel={hotel} criteria={criteria} />
            </section>

            <section id="facilities" className={`ma-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>Facilities</h2>
              <ul className={styles.amenities}>
                {hotel.amenities.map((amenity) => (
                  <li key={amenity}>✓ {amenity}</li>
                ))}
              </ul>
            </section>

            <section id="reviews" className={`ma-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>Guest reviews</h2>
              <Reviews hotelId={hotel.id} />
            </section>

            <section id="location" className={`ma-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>Location</h2>
              <LocationInfo hotel={hotel} />
            </section>

            <section id="policies" className={`ma-card ${styles.section}`}>
              <h2 className={styles.sectionTitle}>Property policies</h2>
              <dl className={styles.policies}>
                <dt>Check-in</dt>
                <dd>From {hotel.checkInTime}</dd>
                <dt>Check-out</dt>
                <dd>Until {hotel.checkOutTime}</dd>
                <dt>Cancellation</dt>
                <dd>{hotel.freeCancellation ? 'Free cancellation available on selected rooms until 24 hours before check-in.' : 'Cancellation policies vary by room type.'}</dd>
                <dt>Children</dt>
                <dd>Children of all ages are welcome. Children under 6 stay free using existing beds.</dd>
                <dt>Payment</dt>
                <dd>{hotel.payAtHotel ? 'Pay online or at the property on selected rooms.' : 'Prepayment required at booking.'}</dd>
              </dl>
            </section>
          </div>

          <aside className={styles.aside}>
            <div className={`ma-card ${styles.summary}`}>
              <ScoreBadge score={hotel.reviewScore} count={hotel.reviewCount} />
              <div className={styles.summaryPrice}>
                <span className="ma-muted">Prices from</span>
                <Price amount={hotel.pricePerNight} originalAmount={hotel.originalPrice} suffix="per night" />
              </div>
              <Button block size="lg" onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}>
                See rooms
              </Button>
              {hotel.freeCancellation && <div className={styles.perk}>✓ Free cancellation on selected rooms</div>}
              {hotel.payAtHotel && <div className={styles.perk}>✓ Pay at the hotel available</div>}
            </div>
            <SimilarHotels hotelId={hotel.id} criteria={criteria} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function LocationInfo({ hotel }: { hotel: Hotel }) {
  const { lat, lng } = hotel.coordinates;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
  return (
    <div className={styles.location}>
      <a className={styles.mapPlaceholder} href={mapUrl} target="_blank" rel="noreferrer">
        <span>🗺️</span>
        <strong>View on map</strong>
        <span className="ma-muted">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </a>
      <div>
        <p>
          <strong>{hotel.distanceToCenterKm} km</strong> from {hotel.city} city centre
        </p>
        <h3 className={styles.subTitle}>What&apos;s nearby</h3>
        <ul className={styles.landmarks}>
          {hotel.landmarks.map((landmark) => (
            <li key={landmark.name}>
              <span>{landmark.name}</span>
              <span className="ma-muted">{landmark.distanceKm} km</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SimilarHotels({ hotelId, criteria }: { hotelId: string; criteria: SearchCriteria }) {
  const { data } = useAsync(() => api.getSimilarHotels(hotelId, 3), [hotelId]);
  if (!data?.length) return null;
  return (
    <div className={`ma-card ${styles.similar}`}>
      <h3 className={styles.subTitle}>Similar properties nearby</h3>
      {data.map((hotel) => (
        <Link key={hotel.id} to={hotelUrl(hotel.id, criteria)} className={styles.similarItem}>
          <div className={styles.similarImage}>
            <SmartImage src={hotel.images[0]} alt={hotel.name} seed={hotel.id} />
          </div>
          <div>
            <strong>{hotel.name}</strong>
            <div>
              <StarRating stars={hotel.stars} />
            </div>
            <ScoreBadge score={hotel.reviewScore} compact />
          </div>
        </Link>
      ))}
    </div>
  );
}

function HotelSkeleton() {
  return (
    <div className="ma-container" style={{ paddingTop: 20 }} aria-busy>
      <Skeleton height={16} width={280} />
      <Skeleton height={380} style={{ marginTop: 16 }} />
      <Skeleton height={44} style={{ marginTop: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 16 }}>
        <Skeleton height={300} />
        <Skeleton height={220} />
      </div>
    </div>
  );
}
