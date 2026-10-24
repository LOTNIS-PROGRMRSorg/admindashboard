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

const decodeExp = (token) => {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp * 1000; } catch { return Number.MAX_SAFE_INTEGER; }   // not a decodable JWT: don't guess, let the server say
};

let refreshing = null;
// Trade the refresh token for a new access token. One call at a time, however many requests wait on it.
function refreshSession() {
  if (refreshing) return refreshing;
  const refreshToken = localStorage.getItem('lotnis_admin_refresh_token');
  if (!refreshToken) return Promise.resolve(false);
  refreshing = fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) })
    .then(async (response) => {
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.data?.access_token) return false;
      localStorage.setItem(TOKEN_KEY, body.data.access_token);
      if (body.data.refresh_token) localStorage.setItem('lotnis_admin_refresh_token', body.data.refresh_token);
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

// The session is over: clear it. The route guard then shows the login form with an explanation.
function endSession() {
  try { sessionStorage.setItem('lotnis_admin_expired', '1'); } catch { /* private mode */ }
  clearAccessToken();
}

export async function apiFetch(path, options = {}, retried = false) {
  let token = getAccessToken();
  if (token && decodeExp(token) - Date.now() < 60_000) {
    if (await refreshSession()) token = getAccessToken();
    else if (decodeExp(token) < Date.now()) { endSession(); throw new Error('Your session has expired. Please sign in again.'); }
  }
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => null) : null;

  if (response.status === 401 && token && !retried) {
    if (await refreshSession()) return apiFetch(path, options, true);
    endSession();
    throw new Error('Your session has expired. Please sign in again.');
  }
  if (!response.ok) {
    throw new Error(body?.error || `Request to ${path} failed (${response.status})`);
  }
  return body;
}
