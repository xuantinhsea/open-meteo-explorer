const BASE = 'https://flood-api.open-meteo.com/v1/flood';

export async function fetchFlood({ lat, lon, daily = [], model, startDate, endDate }) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon });
  if (model) params.set('models', model);
  if (daily.length) params.set('daily', daily.join(','));
  if (startDate) params.set('start_date', startDate);
  if (endDate)   params.set('end_date',   endDate);
  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.reason || `Flood API error ${res.status}`);
  }
  return res.json();
}
