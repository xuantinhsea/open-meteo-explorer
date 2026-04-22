const BASE = 'https://ensemble-api.open-meteo.com/v1/ensemble';

export async function fetchEnsemble({ lat, lon, hourly = [], daily = [], model = 'icon_seamless', startDate, endDate }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    models: model,
  });
  if (hourly.length) params.set('hourly', hourly.join(','));
  if (daily.length) params.set('daily', daily.join(','));
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.reason || `Ensemble API error ${res.status}`);
  }
  return res.json();
}
