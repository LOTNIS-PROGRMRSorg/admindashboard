// Shared fetch helper for the admin dashboard.
// Centralizes the API base URL and bearer-token attachment so every page
// talks to the real backend the same way.

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const TOKEN_KEY = 'lotnis_admin_access_token';
const AUTH_EVENT = 'lotnis-auth-changed';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Persists the token and notifies any mounted auth listeners (e.g. the
// route guard in App.jsx) in the same tab — a plain localStorage.setItem
// does not by itself trigger a re-render anywhere.
export function setAccessToken(token, refreshToken) {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem('lotnis_admin_refresh_token', refreshToken);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('lotnis_admin_refresh_token');
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeAuthChanges(callback) {
  window.addEventListener(AUTH_EVENT, callback);
  return () => window.removeEventListener(AUTH_EVENT, callback);
}

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new Error(body?.error || `Request to ${path} failed (${response.status})`);
  }
  return body;
}
