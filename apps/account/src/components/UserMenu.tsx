import { useCallback, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, setCurrentUser, useAuth, useClickOutside } from '@mini-agoda/shared';
import styles from './account.module.css';

/**
 * Exposed as `account/UserMenu` - a *fragment* rendered inside the shell's header.
 * The identity team can ship changes here without a shell release.
 */
export default function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useClickOutside(ref, useCallback(() => setOpen(false), []));

  if (!user) {
    const redirect = location.pathname.startsWith('/account') ? '' : `?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return (
      <div className={styles.menuGuest}>
        <Button to={`/account/login${redirect}`} variant="secondary" size="sm">
          Sign in
        </Button>
        <Button to="/account/signup" size="sm">
          Create account
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.menu} ref={ref}>
      <button className={styles.menuButton} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
        <span className={styles.avatar}>{user.firstName[0]}</span>
        <span className={styles.menuName}>{user.firstName}</span>▾
      </button>
      {open && (
        <div className={styles.dropdown} role="menu" onClick={() => setOpen(false)}>
          <div className={styles.dropdownHeader}>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <span className="ma-muted">{user.email}</span>
          </div>
          <Link role="menuitem" to="/account/trips">
            🧳 My trips
          </Link>
          <Link role="menuitem" to="/account/wishlist">
            ♡ Wishlist
          </Link>
          <Link role="menuitem" to="/account/profile">
            ⚙️ Profile
          </Link>
          <button
            role="menuitem"
            className={styles.signOut}
            onClick={() => {
              setCurrentUser(null);
              navigate('/');
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
