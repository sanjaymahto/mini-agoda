import '@mini-agoda/shared/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { addDays, checkoutUrl, ForeignRoute, StandaloneLayout, today } from '@mini-agoda/shared';
import BookingApp from './BookingApp';

const checkIn = addDays(today(), 10);
const sampleCheckout = checkoutUrl('h001', 'h001-r2', { checkIn, checkOut: addDays(checkIn, 3), adults: 2, children: 0, rooms: 1 });

/** Standalone entry - only used when this MFE is opened directly on :3003. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StandaloneLayout name="booking" links={[{ to: sampleCheckout, label: 'Sample checkout' }]}>
        <Routes>
          <Route path="/" element={<Navigate to={sampleCheckout} replace />} />
          <Route path="/booking/*" element={<BookingApp />} />
          <Route path="/account/*" element={<ForeignRoute owner="account" />} />
          <Route path="*" element={<ForeignRoute owner="shell" />} />
        </Routes>
      </StandaloneLayout>
    </BrowserRouter>
  </StrictMode>,
);
