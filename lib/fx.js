// Phase 2: live FX from open.er-api.com.
// Picked open.er-api.com because the /v6/latest/<BASE> endpoint needs no
// API key and returns a flat { rates: { USD: ..., JPY: ..., ... } } object
// with the chosen base. exchangerate.host would also work but recently
// shifted to a paid tier for non-trivial usage.

export const SUPPORTED_CURRENCIES = ['THB', 'USD', 'JPY'];

const FALLBACK_RATES_TO_THB = {
  THB: 1,
  USD: 32.7,
  JPY: 0.22,
};
const FALLBACK_THB_TO_USD = 0.0306;

const CACHE_KEY = 'ledger-web:fx-rates-v1';
const CACHE_TTL_MS = 60 * 60 * 1000;
const ENDPOINT = 'https://open.er-api.com/v6/latest/THB';

let inMemoryCache = null;

function readCache() {
  if (inMemoryCache) return inMemoryCache;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.fetched_at || !parsed?.rates) return null;
    inMemoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  inMemoryCache = payload;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage full or disabled; in-memory cache still applies.
  }
}

function isFresh(payload) {
  if (!payload?.fetched_at) return false;
  const age = Date.now() - new Date(payload.fetched_at).getTime();
  return age >= 0 && age < CACHE_TTL_MS;
}

function fallbackPayload() {
  return {
    fetched_at: new Date(0).toISOString(),
    rates: {
      USD: FALLBACK_RATES_TO_THB.USD,
      JPY: FALLBACK_RATES_TO_THB.JPY,
      THB_TO_USD: FALLBACK_THB_TO_USD,
    },
    fallback: true,
  };
}

// open.er-api.com with base=THB returns rates AGAINST THB:
//   rates.USD = 0.0306  -> 1 THB = 0.0306 USD
//   rates.JPY = 4.5     -> 1 THB = 4.5 JPY
// Our app needs the inverse for storage: 1 unit of foreign currency in THB.
function buildRatesFromBaseTHB(rates) {
  if (!rates || typeof rates !== 'object') return null;
  const usdToThb = rates.USD ? 1 / Number(rates.USD) : null;
  const jpyToThb = rates.JPY ? 1 / Number(rates.JPY) : null;
  const thbToUsd = rates.USD ? Number(rates.USD) : null;
  if (!usdToThb || !jpyToThb || !thbToUsd) return null;
  return {
    USD: usdToThb,
    JPY: jpyToThb,
    THB_TO_USD: thbToUsd,
  };
}

export async function fetchFxRates({ force = false } = {}) {
  const cached = readCache();
  if (!force && cached && isFresh(cached)) {
    return cached;
  }
  try {
    const res = await fetch(ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const built = buildRatesFromBaseTHB(json?.rates);
    if (!built) throw new Error('Malformed response');
    const payload = {
      fetched_at: new Date().toISOString(),
      rates: built,
      fallback: false,
    };
    writeCache(payload);
    return payload;
  } catch (err) {
    console.warn('[ledger-web] FX fetch failed, using fallback rates', err?.message ?? err);
    return cached ?? fallbackPayload();
  }
}

function ratesFromCacheSync() {
  const cached = readCache();
  if (cached?.rates) return cached.rates;
  return fallbackPayload().rates;
}

export function getRate(from, to) {
  if (from === to) return 1;
  const rates = ratesFromCacheSync();
  const toThb = (cur) => {
    if (cur === 'THB') return 1;
    if (cur === 'USD') return rates.USD ?? FALLBACK_RATES_TO_THB.USD;
    if (cur === 'JPY') return rates.JPY ?? FALLBACK_RATES_TO_THB.JPY;
    return 1;
  };
  const fromThb = toThb(from);
  const toThbRate = toThb(to);
  if (!fromThb || !toThbRate) return 1;
  return fromThb / toThbRate;
}

export function toTHB(amount, currency) {
  return amount * getRate(currency, 'THB');
}

export function getThbToUsdRate() {
  const rates = ratesFromCacheSync();
  return rates.THB_TO_USD ?? FALLBACK_THB_TO_USD;
}

export function getThbToJpyRate() {
  return getRate('THB', 'JPY');
}
