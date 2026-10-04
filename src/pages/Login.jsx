import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL, setAccessToken } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
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
    if (!email) { setError('Enter your email above first, then click "Forgot password".'); return; }
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/dashboard-password-reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error('Unable to request a password reset');
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return <main style={{ maxWidth: 420, margin: '10vh auto', padding: 32 }}><h1>Lotnis Dashboard</h1><p>Sign in with your manager invitation account.</p><form onSubmit={submit} style={{ display: 'grid', gap: 16 }}><label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p role="alert">{error}</p>}{resetSent && <p>If that email has dashboard access, a reset link has been sent.</p>}<button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button><button type="button" onClick={requestReset} disabled={busy} style={{ background: 'transparent', color: 'inherit', textDecoration: 'underline' }}>Forgot password?</button></form></main>;
}
