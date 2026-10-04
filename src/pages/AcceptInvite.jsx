import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, setAccessToken } from '../lib/api';

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
  return <main style={{ maxWidth: 420, margin: '10vh auto', padding: 32 }}><h1>Accept Lotnis invitation</h1><p>Choose a password for your dashboard account.</p><form onSubmit={submit} style={{ display: 'grid', gap: 16 }}><label>Password<input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Saving…' : 'Set password'}</button></form></main>;
}
