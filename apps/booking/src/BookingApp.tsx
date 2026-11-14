import { Navigate, Route, Routes } from 'react-router-dom';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

/**
 * Exposed as `booking/BookingApp`. The shell mounts it at `/booking/*` and this
 * MFE owns every route below that prefix.
 */
export default function BookingApp() {
  return (
    <Routes>
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="confirmation/:bookingId" element={<ConfirmationPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
