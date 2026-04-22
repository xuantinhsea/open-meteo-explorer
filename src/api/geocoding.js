const BASE = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchLocations(query, count = 6) {
  if (!query || query.trim().length < 2) return [];
  const url = `${BASE}?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding request failed');
  const data = await res.json();
  return (data.results || []).map((r) => ({
    id: r.id,
    name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
    elevation: r.elevation,
    timezone: r.timezone,
  }));
}
