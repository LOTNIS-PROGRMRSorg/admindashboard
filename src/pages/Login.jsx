import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';
import styles from './Auth.module.css';
import { API_URL, setAccessToken } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(() => {
    try {
      if (sessionStorage.getItem('lotnis_admin_expired')) {
        sessionStorage.removeItem('lotnis_admin_expired');
        return 'Your session expired, so you were signed out. Please sign in again.';
      }
    } catch {
      /* ignore */
    }
    return '';
  });
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || 'Unable to sign in');
      const session = body.data?.session;
      setAccessToken(session.access_token, session.refresh_token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const requestReset = async () => {
    if (!email) {
      setError('Enter your email above first, then click "Forgot password".');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/dashboard-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Unable to request a password reset');
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell title="Welcome back" subtitle="Sign in with your Lotnis dashboard account.">
      <form onSubmit={submit} className={styles.form}>
        <label className={styles.field}>
          Email
          <input
            className={styles.input}
            type="email"
            required
            autoComplete="email"
            placeholder="you@lotnis.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={styles.field}>
          Password
          <span className={styles.inputWrap}>
            <input
              className={`${styles.input} ${styles.hasReveal}`}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className={styles.reveal}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        {error && (
          <div role="alert" className={`${styles.alert} ${styles.error}`}>
            {error}
          </div>
        )}
        {resetSent && (
          <div className={`${styles.alert} ${styles.success}`}>
            If that email has dashboard access, a reset link has been sent.
          </div>
        )}
        <button className={styles.submit} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" className={styles.link} onClick={requestReset} disabled={busy}>
          Forgot password?
        </button>
      </form>
    </AuthShell>
  );
}
