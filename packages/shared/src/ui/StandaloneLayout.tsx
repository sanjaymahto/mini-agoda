import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CURRENCY_CODES } from '../utils/currency';
import { setCurrency, useCurrency } from '../store';
import type { CurrencyCode } from '../types';

/**
 * Minimal chrome used when a remote runs on its own (e.g. `npm run dev -w @mini-agoda/hotel`
 * then open http://localhost:3002). Lets each team develop and test in isolation.
 */
export function StandaloneLayout({ name, links, children }: { name: string; links: { to: string; label: string }[]; children: ReactNode }) {
  const currency = useCurrency();
  return (
    <>
      <div style={{ background: '#1a1a2e', color: '#fff', padding: '10px 0', fontSize: 14 }}>
        <div className="ma-container" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <strong>🧩 {name} MFE · standalone mode</strong>
          {links.map((link) => (
            <Link key={link.to} to={link.to} style={{ color: '#9cc2ff' }}>
              {link.label}
            </Link>
          ))}
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            style={{ marginLeft: 'auto', color: '#1a1a2e', borderRadius: 4 }}
            aria-label="Currency"
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code}>{code}</option>
            ))}
          </select>
        </div>
      </div>
      {children}
    </>
  );
}

/** Placeholder for routes owned by a different MFE when running standalone. */
export function ForeignRoute({ owner }: { owner: string }) {
  return (
    <div className="ma-container" style={{ padding: 40 }}>
      <div className="ma-card" style={{ padding: 24 }}>
        This route is owned by the <strong>{owner}</strong> micro frontend. Run <code>npm run dev</code> at the repo root and open{' '}
        <a href="http://localhost:3000">http://localhost:3000</a> to see the full journey.
      </div>
    </div>
  );
}
