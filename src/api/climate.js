const BASE = 'https://climate-api.open-meteo.com/v1/climate';

export async function fetchClimate({ lat, lon, daily = [], model = 'EC_Earth3P_HR', startDate, endDate }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    models: model,
    start_date: startDate,
    end_date: endDate,
  });
  if (daily.length) params.set('daily', daily.join(','));

  const res = await fetch(`${BASE}?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.reason || `Climate API error ${res.status}`);
  }
  return res.json();
}
