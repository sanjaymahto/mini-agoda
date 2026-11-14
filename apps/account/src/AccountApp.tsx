import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@mini-agoda/shared';
import type { ReactNode } from 'react';
import { AccountLayout } from './components/AccountLayout';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { SignupPage } from './pages/SignupPage';
import { TripsPage } from './pages/TripsPage';
import { WishlistPage } from './pages/WishlistPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={`/account/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return <>{children}</>;
}

/**
 * Exposed as `account/AccountApp`. The shell mounts it at `/account/*`.
 * Wishlist is device-based so it works signed-out; trips and profile need a user.
 */
export default function AccountApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route element={<AccountLayout />}>
        <Route path="wishlist" element={<WishlistPage />} />
        <Route
          path="trips"
          element={
            <RequireAuth>
              <TripsPage />
            </RequireAuth>
          }
        />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="trips" replace />} />
    </Routes>
  );
}
