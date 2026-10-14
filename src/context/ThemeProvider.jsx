import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ThemeContext } from './themeContext';
import { prefersDark, readPreference, savePreference } from './themePreferences';

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference);
  const [systemIsDark, setSystemIsDark] = useState(prefersDark);

  useLayoutEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return undefined;
    const update = (event) => setSystemIsDark(event.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const resolvedTheme = preference === 'system' ? (systemIsDark ? 'dark' : 'light') : preference;

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const setPreference = useCallback((nextPreference) => {
    if (!['light', 'dark', 'system'].includes(nextPreference)) return;
    setPreferenceState(nextPreference);
    savePreference(nextPreference);
  }, []);

  const value = useMemo(() => ({ preference, resolvedTheme, setPreference }), [preference, resolvedTheme, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
