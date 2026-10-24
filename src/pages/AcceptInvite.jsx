import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, setAccessToken } from '../lib/api';
import AuthShell from '../components/auth/AuthShell';
import styles from './Auth.module.css';

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const token = hash.get('access_token');
      if (!token) throw new Error('This invitation link is missing its access token');
      const response = await fetch(`${API_URL}/auth/set-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ password }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || 'Unable to set password');
      setAccessToken(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell title="Accept your invitation" subtitle="Choose a password for your Lotnis dashboard account.">
      <form onSubmit={submit} className={styles.form}>
        <label className={styles.field}>Password
          <input className={styles.input} type="password" minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <div role="alert" className={`${styles.alert} ${styles.error}`}>{error}</div>}
        <button className={styles.submit} disabled={busy}>{busy ? 'Saving…' : 'Set password and continue'}</button>
      </form>
    </AuthShell>
  );
}
