'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SUPPORTED_CURRENCIES } from '@/lib/fx';

const STORAGE_KEY = 'ledger-web:display-currency-v1';
const DEFAULT_CURRENCY = 'THB';

const DisplayCurrencyContext = createContext({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
});

export function DisplayCurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_CURRENCIES.includes(stored)) {
        setCurrencyState(stored);
      }
    } catch {
      // localStorage disabled; stay on default.
    }
  }, []);

  const setCurrency = useCallback((next) => {
    if (!SUPPORTED_CURRENCIES.includes(next)) return;
    setCurrencyState(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage full or disabled; state still updates for this session.
    }
  }, []);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);

  return (
    <DisplayCurrencyContext.Provider value={value}>
      {children}
    </DisplayCurrencyContext.Provider>
  );
}

export function useDisplayCurrency() {
  return useContext(DisplayCurrencyContext);
}
