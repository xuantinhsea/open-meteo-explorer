const BASE = 'https://archive-api.open-meteo.com/v1/archive';

export async function fetchHistorical({ lat, lon, hourly = [], daily = [], model = 'era5', startDate, endDate }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    start_date: startDate,
    end_date: endDate,
  });
  if (model) params.set('models', model);
  if (hourly.length) params.set('hourly', hourly.join(','));
  if (daily.length) params.set('daily', daily.join(','));

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.reason || `Historical API error ${res.status}`);
  }
  return res.json();
}
