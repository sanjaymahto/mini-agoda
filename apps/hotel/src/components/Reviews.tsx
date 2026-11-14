import { useState } from 'react';
import { api, Button, ErrorState, formatDate, ScoreBadge, scoreLabel, Spinner, useAsync, type TravelerType } from '@mini-agoda/shared';
import styles from './Reviews.module.css';

const TRAVELER_TYPES: TravelerType[] = ['Solo', 'Couple', 'Family', 'Business', 'Group'];

export function Reviews({ hotelId }: { hotelId: string }) {
  const [page, setPage] = useState(1);
  const [travelerType, setTravelerType] = useState<TravelerType | undefined>();
  const { data, error, loading, reload } = useAsync(() => api.getReviews(hotelId, { page, travelerType }), [hotelId, page, travelerType]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return <Spinner label="Loading reviews…" />;

  const { summary } = data;

  return (
    <div>
      <div className={styles.summary}>
        <div className={styles.overall}>
          <span className={styles.bigScore}>{summary.average.toFixed(1)}</span>
          <div>
            <strong>{scoreLabel(summary.average)}</strong>
            <div className="ma-muted">{summary.count.toLocaleString()} verified reviews</div>
          </div>
        </div>
        <div className={styles.categories}>
          {summary.categories.map((category) => (
            <div key={category.label} className={styles.category}>
              <span>{category.label}</span>
              <div className={styles.bar}>
                <div className={styles.fill} style={{ width: `${category.score * 10}%` }} />
              </div>
              <strong>{category.score.toFixed(1)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.filters} role="group" aria-label="Filter reviews by traveller type">
        {[undefined, ...TRAVELER_TYPES].map((type) => (
          <button
            key={type ?? 'all'}
            className={`${styles.chip} ${travelerType === type ? styles.chipActive : ''}`}
            aria-pressed={travelerType === type}
            onClick={() => {
              setTravelerType(type);
              setPage(1);
            }}
          >
            {type ?? 'All travellers'}
          </button>
        ))}
      </div>

      <div className={`${styles.list} ${loading ? styles.stale : ''}`}>
        {data.reviews.length === 0 && <p className="ma-muted">No reviews from this traveller type yet.</p>}
        {data.reviews.map((review) => (
          <article key={review.id} className={styles.review}>
            <div className={styles.author}>
              <div className={styles.avatar}>{review.author[0]}</div>
              <div>
                <strong>{review.author}</strong>
                <div className={styles.authorMeta}>
                  {review.country} · {review.travelerType} traveller
                </div>
              </div>
            </div>
            <div>
              <div className={styles.reviewHeader}>
                <ScoreBadge score={review.score} compact />
                <strong>“{review.title}”</strong>
              </div>
              <p className={styles.comment}>{review.comment}</p>
              <div className={styles.date}>Reviewed {formatDate(review.date)}</div>
            </div>
          </article>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className={styles.pager}>
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ‹ Newer
          </Button>
          <span className="ma-muted">
            Page {data.page} of {data.totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
            Older ›
          </Button>
        </div>
      )}
    </div>
  );
}
