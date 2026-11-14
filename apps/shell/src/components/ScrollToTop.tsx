import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top when the path changes (but not when only query params change, e.g. filters). */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}
