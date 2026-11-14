import { NavLink, Outlet } from 'react-router-dom';
import { useAuth, useWishlist } from '@mini-agoda/shared';
import styles from './account.module.css';

export function AccountLayout() {
  const { user } = useAuth();
  const { hotelIds } = useWishlist();
  const link = ({ isActive }: { isActive: boolean }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`;

  return (
    <div className={`ma-container ${styles.layout}`}>
      <aside className={`ma-card ${styles.sidebar}`}>
        {user ? (
          <div className={styles.profileCard}>
            <div className={styles.avatarLarge}>{user.firstName[0]}</div>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <span className="ma-muted">{user.email}</span>
          </div>
        ) : (
          <div className={styles.profileCard}>
            <div className={styles.avatarLarge}>👤</div>
            <strong>Guest</strong>
            <NavLink to="/account/login">Sign in for more</NavLink>
          </div>
        )}
        <nav className={styles.nav} aria-label="Account">
          <NavLink to="/account/trips" className={link}>
            🧳 My trips
          </NavLink>
          <NavLink to="/account/wishlist" className={link}>
            ♡ Wishlist {hotelIds.length > 0 && <span className={styles.pill}>{hotelIds.length}</span>}
          </NavLink>
          <NavLink to="/account/profile" className={link}>
            ⚙️ Profile
          </NavLink>
        </nav>
      </aside>
      <section className={styles.content}>
        <Outlet />
      </section>
    </div>
  );
}
