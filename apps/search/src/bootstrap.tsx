import '@mini-agoda/shared/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ForeignRoute, StandaloneLayout } from '@mini-agoda/shared';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';

/** Standalone entry - only used when this MFE is opened directly on :3001. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StandaloneLayout
        name="search"
        links={[
          { to: '/', label: 'Home' },
          { to: '/search?destination=Bangkok', label: 'Results' },
        ]}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/hotel/*" element={<ForeignRoute owner="hotel" />} />
          <Route path="*" element={<ForeignRoute owner="shell" />} />
        </Routes>
      </StandaloneLayout>
    </BrowserRouter>
  </StrictMode>,
);
