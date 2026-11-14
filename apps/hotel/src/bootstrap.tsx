import '@mini-agoda/shared/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ForeignRoute, StandaloneLayout } from '@mini-agoda/shared';
import HotelPage from './pages/HotelPage';

/** Standalone entry - only used when this MFE is opened directly on :3002. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StandaloneLayout
        name="hotel"
        links={[
          { to: '/hotel/h001', label: 'Riverside Orchid (h001)' },
          { to: '/hotel/h008', label: 'Marina Bay Vista (h008)' },
          { to: '/hotel/does-not-exist', label: '404 hotel' },
        ]}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/hotel/h001" replace />} />
          <Route path="/hotel/:hotelId" element={<HotelPage />} />
          <Route path="/booking/*" element={<ForeignRoute owner="booking" />} />
          <Route path="*" element={<ForeignRoute owner="search" />} />
        </Routes>
      </StandaloneLayout>
    </BrowserRouter>
  </StrictMode>,
);
