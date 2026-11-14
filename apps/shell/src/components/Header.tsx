import { NavLink, Link } from 'react-router-dom';
import { CURRENCIES, CURRENCY_CODES, setCurrency, useCurrency, useWishlist, type CurrencyCode } from '@mini-agoda/shared';
import { UserMenu } from '../federation/remotes';
import styles from '../styles/Header.module.css';

export function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="Mini Agoda home">
      <span style={{ color: '#e12d2d' }}>m</span>
      <span style={{ color: '#f5a623' }}>i</span>
      <span style={{ color: '#1f8a4c' }}>n</span>
      <span style={{ color: '#2067da' }}>i</span>
      <span className={styles.logoMain}>agoda</span>
    </Link>
  );
}

export function Header() {
  const currency = useCurrency();
  const { hotelIds } = useWishlist();

  return (
    <header className={styles.header}>
      <div className={`ma-container ${styles.inner}`}>
        <Logo />
        <nav className={styles.nav} aria-label="Primary">
          <NavLink to="/search" className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}>
            Hotels & Homes
          </NavLink>
          <NavLink to="/search?sort=price_asc" className={styles.navLink}>
            Deals
          </NavLink>
          <NavLink to="/account/trips" className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}>
            My trips
          </NavLink>
        </nav>
        <div className={styles.actions}>
          <label className="ma-visually-hidden" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            className={styles.currency}
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            title={CURRENCIES[currency].label}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <Link to="/account/wishlist" className={styles.wishlist} aria-label={`Wishlist (${hotelIds.length})`}>
            ♡{hotelIds.length > 0 && <span className={styles.count}>{hotelIds.length}</span>}
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
