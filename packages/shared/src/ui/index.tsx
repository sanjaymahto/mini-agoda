import { useEffect, useState, type ButtonHTMLAttributes, type CSSProperties, type ImgHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { fallbackImage } from '../data/images';
import { toast } from '../events';
import { toggleWishlist, useCurrency, useWishlist } from '../store';
import { formatPrice } from '../utils/currency';
import styles from './ui.module.css';

const cx = (...classes: (string | false | undefined | null)[]) => classes.filter(Boolean).join(' ');

/* -------------------------------------------------------------- Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  /** Render as a router link instead of a <button>. */
  to?: string;
}

export function Button({ variant = 'primary', size = 'md', block, loading, to, className, children, disabled, ...rest }: ButtonProps) {
  const classes = cx(styles.button, styles[variant], size !== 'md' && styles[size], block && styles.block, className);
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}

/* --------------------------------------------------------- StarRating */

export function StarRating({ stars }: { stars: number }) {
  return (
    <span className={styles.stars} aria-label={`${stars} star property`} title={`${stars} stars`}>
      {'★'.repeat(stars)}
    </span>
  );
}

/* ---------------------------------------------------------- ScoreBadge */

export function scoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional';
  if (score >= 8.5) return 'Excellent';
  if (score >= 8) return 'Very good';
  if (score >= 7) return 'Good';
  if (score >= 6) return 'Pleasant';
  return 'Review score';
}

export function ScoreBadge({ score, count, compact }: { score: number; count?: number; compact?: boolean }) {
  return (
    <span className={styles.score}>
      <span className={styles.scoreValue}>{score.toFixed(1)}</span>
      {!compact && (
        <span>
          <span className={styles.scoreLabel}>{scoreLabel(score)}</span>
          {count !== undefined && <span className={styles.scoreCount}> · {count.toLocaleString()} reviews</span>}
        </span>
      )}
    </span>
  );
}

/* --------------------------------------------------------------- Price */

/** Currency-aware price. Re-renders automatically when the user switches currency in the header. */
export function Price({ amount, originalAmount, suffix, className }: { amount: number; originalAmount?: number; suffix?: string; className?: string }) {
  const currency = useCurrency();
  return (
    <span className={cx(styles.price, className)}>
      {originalAmount && originalAmount > amount && <span className={styles.priceOriginal}>{formatPrice(originalAmount, currency)}</span>}
      <span className={styles.priceCurrent}>{formatPrice(amount, currency)}</span>
      {suffix && <span className={styles.priceSuffix}>{suffix}</span>}
    </span>
  );
}

/** Plain-text formatted amount in the active currency. */
export function Money({ amount }: { amount: number }) {
  const currency = useCurrency();
  return <>{formatPrice(amount, currency)}</>;
}

/* ---------------------------------------------------------- SmartImage */

/** <img> with lazy loading and a two-step fallback so a broken CDN never breaks the layout. */
export function SmartImage({ src, alt, seed, className, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { seed?: string }) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(0);
  useEffect(() => {
    setCurrent(src);
    setFailed(0);
  }, [src]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt ?? ''}
      loading="lazy"
      className={cx(styles.image, className)}
      onError={() => {
        if (failed === 0) setCurrent(fallbackImage(seed ?? String(src)));
        else setCurrent(undefined);
        setFailed((n) => n + 1);
      }}
    />
  );
}

/* ------------------------------------------------------ Spinner etc. */

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className={styles.spinnerWrap} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', style }: { height?: number | string; width?: number | string; style?: CSSProperties }) {
  return <div className={styles.skeleton} style={{ height, width, ...style }} aria-hidden />;
}

export function EmptyState({ icon = '🔍', title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      {children && <div className={styles.emptyText}>{children}</div>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return (
    <EmptyState icon="⚠️" title="Something went wrong" action={onRetry && <Button onClick={onRetry}>Try again</Button>}>
      {error?.message ?? 'Please try again in a moment.'}
    </EmptyState>
  );
}

/* --------------------------------------------------------------- Badge */

export function Badge({ tone = 'info', children }: { tone?: 'info' | 'success' | 'deal' | 'muted'; children: ReactNode }) {
  const toneClass = { info: undefined, success: styles.badgeSuccess, deal: styles.badgeDeal, muted: styles.badgeMuted }[tone];
  return <span className={cx(styles.badge, toneClass)}>{children}</span>;
}

/* ------------------------------------------------------ WishlistButton */

export function WishlistButton({ hotelId, hotelName }: { hotelId: string; hotelName?: string }) {
  const { isSaved } = useWishlist();
  const saved = isSaved(hotelId);
  return (
    <button
      type="button"
      className={cx(styles.heart, saved && styles.heartActive)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const added = toggleWishlist(hotelId);
        toast.info(added ? `${hotelName ?? 'Property'} saved to your wishlist` : `${hotelName ?? 'Property'} removed from your wishlist`);
      }}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

/* --------------------------------------------------------------- Modal */

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

export { cx };
