import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { api, Button, isEmail, setCurrentUser, useAuth, useDocumentTitle } from '@mini-agoda/shared';
import { safeRedirect } from '../lib/redirect';
import styles from '../components/account.module.css';

export function LoginPage() {
  useDocumentTitle('Sign in');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const redirect = safeRedirect(params.get('redirect'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && !submitting) return <Navigate to={redirect} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isEmail(email) || !password) {
      setError('Enter your email and password');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      const user = await api.login(email, password);
      setCurrentUser(user);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <form className={`ma-card ${styles.authCard}`} onSubmit={submit} noValidate>
        <h1 className={styles.authTitle}>Sign in</h1>
        <p className="ma-muted">Access your trips, saved properties and member prices.</p>

        <div className={styles.demo}>
          <span>
            Demo account: <code>demo@miniagoda.com</code> / <code>password123</code>
          </span>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => {
              setEmail('demo@miniagoda.com');
              setPassword('password123');
            }}
          >
            Fill in
          </button>
        </div>

        <div>
          <label className="ma-label" htmlFor="login-email">
            Email
          </label>
          <input id="login-email" type="email" className="ma-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="ma-label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className="ma-input"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" block loading={submitting}>
          Sign in
        </Button>
        <p className={styles.switch}>
          New to Mini Agoda? <Link to={`/account/signup?redirect=${encodeURIComponent(redirect)}`}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}
