import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, Button, isEmail, setCurrentUser, useDocumentTitle } from '@mini-agoda/shared';
import { safeRedirect } from '../lib/redirect';
import styles from '../components/account.module.css';

export function SignupPage() {
  useDocumentTitle('Create account');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const redirect = safeRedirect(params.get('redirect'));

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) return setError('Enter your full name');
    if (!isEmail(form.email)) return setError('Enter a valid email address');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');

    setSubmitting(true);
    setError(undefined);
    try {
      const user = await api.signup(form);
      setCurrentUser(user);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <form className={`ma-card ${styles.authCard}`} onSubmit={submit} noValidate>
        <h1 className={styles.authTitle}>Create your account</h1>
        <p className="ma-muted">Members get exclusive deals - use code WELCOME5 on your first booking.</p>

        <div className={styles.row2}>
          <div>
            <label className="ma-label" htmlFor="su-first">
              First name
            </label>
            <input id="su-first" className="ma-input" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} />
          </div>
          <div>
            <label className="ma-label" htmlFor="su-last">
              Last name
            </label>
            <input id="su-last" className="ma-input" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} />
          </div>
        </div>
        <div>
          <label className="ma-label" htmlFor="su-email">
            Email
          </label>
          <input id="su-email" type="email" className="ma-input" autoComplete="email" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="ma-label" htmlFor="su-password">
            Password <span className="ma-muted">(min. 8 characters)</span>
          </label>
          <input id="su-password" type="password" className="ma-input" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" block loading={submitting}>
          Create account
        </Button>
        <p className={styles.switch}>
          Already a member? <Link to={`/account/login?redirect=${encodeURIComponent(redirect)}`}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}
