import '@mini-agoda/shared/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ForeignRoute, StandaloneLayout } from '@mini-agoda/shared';
import AccountApp from './AccountApp';
import UserMenu from './components/UserMenu';

/** Standalone entry - only used when this MFE is opened directly on :3004. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StandaloneLayout
        name="account"
        links={[
          { to: '/account/login', label: 'Login' },
          { to: '/account/trips', label: 'Trips' },
          { to: '/account/wishlist', label: 'Wishlist' },
        ]}
      >
        <div className="ma-container" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px' }}>
          <UserMenu />
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/account/login" replace />} />
          <Route path="/account/*" element={<AccountApp />} />
          <Route path="*" element={<ForeignRoute owner="shell" />} />
        </Routes>
      </StandaloneLayout>
    </BrowserRouter>
  </StrictMode>,
);
