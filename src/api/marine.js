const BASE = 'https://marine-api.open-meteo.com/v1/marine';

export async function fetchMarine({ lat, lon, hourly = [], daily = [], model, startDate, endDate }) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon });
  if (model && model !== 'best_match') params.set('models', model);
  if (hourly.length) params.set('hourly', hourly.join(','));
  if (daily.length)  params.set('daily',  daily.join(','));
  if (startDate)     params.set('start_date', startDate);
  if (endDate)       params.set('end_date',   endDate);

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.reason || `Marine API error ${res.status}`);
  }
  return res.json();
}
