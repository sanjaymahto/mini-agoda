import { useState, type FormEvent } from 'react';
import { api, Button, formatDate, setCurrentUser, toast, useAuth, useDocumentTitle } from '@mini-agoda/shared';
import styles from '../components/account.module.css';

export function ProfilePage() {
  useDocumentTitle('Profile');
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    country: user?.country ?? '',
  });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(user.id, form);
      setCurrentUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const input = (key: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="ma-label" htmlFor={`profile-${key}`}>
        {label}
      </label>
      <input id={`profile-${key}`} type={type} className="ma-input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <form className={`ma-card ${styles.panel}`} onSubmit={submit}>
      <h1 className={styles.pageTitle}>Profile</h1>
      <p className="ma-muted">Member since {formatDate(user.memberSince, { weekday: undefined })}</p>
      <div className={styles.row2}>
        {input('firstName', 'First name')}
        {input('lastName', 'Last name')}
        <div>
          <label className="ma-label" htmlFor="profile-email">
            Email
          </label>
          <input id="profile-email" className="ma-input" value={user.email} disabled />
        </div>
        {input('phone', 'Phone', 'tel')}
        {input('country', 'Country of residence')}
      </div>
      <div>
        <Button type="submit" loading={saving}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
