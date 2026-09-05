import { useState, useCallback } from 'react';
import { fetchForecast } from '../api/forecast';
import { fetchHistorical } from '../api/historical';
import { fetchEnsemble } from '../api/ensemble';
import { fetchClimate } from '../api/climate';
import { fetchMarine } from '../api/marine';
import { fetchFlood } from '../api/flood';
import { normalizeCoords } from '../utils/geo';

const FETCHERS = {
  forecast: fetchForecast,
  historical: fetchHistorical,
  ensemble: fetchEnsemble,
  climate: fetchClimate,
  marine: fetchMarine,
  flood: fetchFlood,
};

// Session-level in-memory cache: avoids hitting the API again for the same request
// within the same browser session. Keyed by a stable string of all request params.
const SESSION_CACHE = new Map();

function cacheKey(params) {
  const { mode, lat, lon, hourly = [], daily = [], model, startDate, endDate } = params;
  return JSON.stringify({ mode, lat: +lat.toFixed(4), lon: +lon.toFixed(4), hourly, daily, model, startDate, endDate });
}

export function useWeatherData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const fetch = useCallback(async (rawParams) => {
    // Last line of defence. Every UI path normalises already, but a coordinate
    // outside ±180 makes the API reject the whole request, so re-wrap here
    // rather than trust that every present and future caller remembered.
    const coords = normalizeCoords(rawParams.lat, rawParams.lon);
    if (!coords) return;
    const params = { ...rawParams, ...coords };
    const { mode } = params;

    const key = cacheKey(params);

    if (SESSION_CACHE.has(key)) {
      setData(SESSION_CACHE.get(key));
      setError(null);
      setFromCache(true);
      return;
    }

    setLoading(true);
    setError(null);
    setFromCache(false);

    try {
      const result = await FETCHERS[mode](params);
      const payload = { ...result, _mode: mode };
      SESSION_CACHE.set(key, payload);
      setData(payload);
    } catch (e) {
      setError(parseApiError(e.message));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => SESSION_CACHE.clear(), []);

  return { data, loading, error, fromCache, fetch, clearCache };
}

function parseApiError(msg) {
  if (!msg) return 'Unknown error.';
  if (/daily api request limit/i.test(msg)) {
    return 'Open-Meteo rate limit hit. This is a short-term limit (not a strict daily cap) — '
      + 'wait a minute and try again, or narrow the date range to reduce response size.';
  }
  if (/forecast.*only.*days/i.test(msg) || /out of range/i.test(msg)) {
    return `Date range error: ${msg}. Check the "Available" range shown below the date picker.`;
  }
  return msg;
}
