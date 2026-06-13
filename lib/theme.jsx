'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'ledger-web:theme-v1';

const ThemeContext = createContext({ theme: 'light', toggle: () => {}, setTheme: () => {} });

// The actual class is applied pre-paint by the inline script in layout.js (so
// there's no flash). This provider mirrors that into React state and owns
// subsequent toggles. Initial state reads what the script already set.
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    setThemeState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage disabled; class still applied for this session.
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Runs before paint to set the theme class from storage (or system preference),
// avoiding a light-mode flash on load. Injected as an inline script.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
