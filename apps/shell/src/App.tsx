import { Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MfeInspector } from './components/MfeInspector';
import { NotFound } from './components/NotFound';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from './components/Toaster';
import { AccountApp, BookingApp, HomePage, HotelPage, SearchPage } from './federation/remotes';
import styles from './styles/App.module.css';

/**
 * The shell owns only top-level routing. Each route prefix is delegated to the
 * micro frontend that owns that part of the journey (see docs/ROUTING.md).
 */
export function App() {
  return (
    <div className={styles.app}>
      <ScrollToTop />
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/hotel/:hotelId" element={<HotelPage />} />
          <Route path="/booking/*" element={<BookingApp />} />
          <Route path="/account/*" element={<AccountApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
      <MfeInspector />
    </div>
  );
}
