import { Link } from 'react-router-dom';
import { CITIES } from '@mini-agoda/shared';
import styles from '../styles/Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`ma-container ${styles.grid}`}>
        <div>
          <h4>Mini Agoda</h4>
          <p className={styles.text}>A demo hotel booking site built with a micro frontend architecture. All data is mocked - no real bookings are made.</p>
        </div>
        <div>
          <h4>Popular destinations</h4>
          <ul>
            {CITIES.slice(0, 5).map((city) => (
              <li key={city.id}>
                <Link to={`/search?destination=${encodeURIComponent(city.name)}`}>Hotels in {city.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Your account</h4>
          <ul>
            <li><Link to="/account/trips">My trips</Link></li>
            <li><Link to="/account/wishlist">Wishlist</Link></li>
            <li><Link to="/account/profile">Profile</Link></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li>Demo login: demo@miniagoda.com / password123</li>
            <li>Test card: 4242 4242 4242 4242</li>
            <li>Promo codes: AGODA10, MINI20</li>
          </ul>
        </div>
      </div>
      <div className={`ma-container ${styles.bottom}`}>© {new Date().getFullYear()} Mini Agoda · Built for learning purposes</div>
    </footer>
  );
}
