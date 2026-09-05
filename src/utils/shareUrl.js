import { normalizeCoords } from './geo';

export function buildShareUrl(params) {
  const { mode, lat, lon, startDate, endDate } = params;
  const baseUrl = window.location.origin + window.location.pathname;
  // Truthiness is the wrong test for a coordinate: 0 is a perfectly good
  // latitude (the equator) and longitude (the prime meridian), but it is
  // falsy, so a location on either line used to be dropped from the link.
  const coords = normalizeCoords(lat, lon);
  const queryParams = new URLSearchParams({
    ...(mode && { mode }),
    ...(coords && { lat: String(coords.lat), lon: String(coords.lon) }),
    ...(startDate && { start: startDate }),
    ...(endDate && { end: endDate }),
  });
  return `${baseUrl}?${queryParams.toString()}`;
}

export function readShareParams() {
  const params = new URLSearchParams(window.location.search);
  // A pasted or hand-edited link can carry anything, so wrap the coordinates
  // into range rather than trusting them. normalizeCoords returns null for a
  // pair that isn't usable at all, in which case no location is restored.
  const coords = (params.get('lat') && params.get('lon'))
    ? normalizeCoords(parseFloat(params.get('lat')), parseFloat(params.get('lon')))
    : null;
  return {
    mode: params.get('mode'),
    lat: coords?.lat ?? null,
    lon: coords?.lon ?? null,
    startDate: params.get('start'),
    endDate: params.get('end'),
  };
}
