const THEME_STORAGE_KEY = 'lotnis_theme_preference';

export function readPreference() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function initializeTheme() {
  const preference = readPreference();
  const resolved = preference === 'system' ? (prefersDark() ? 'dark' : 'light') : preference;
  document.documentElement.dataset.theme = resolved;
}

export function savePreference(preference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // The selection still applies for this visit when storage is unavailable.
  }
}
