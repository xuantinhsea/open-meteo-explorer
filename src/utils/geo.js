// ─── Coordinate normalisation ─────────────────────────────────────────────────
// Leaflet's world map repeats horizontally, so panning past the antimeridian and
// clicking returns a longitude outside ±180 (e.g. -220.05615 for a point in
// Japan). Open-Meteo rejects those outright:
//   "Longitude must be in range of -180 to 180°. Given: -220.05615."
// Every coordinate entering the app is wrapped back into range first.

// Number(null), Number('') and Number([]) are all 0, which would quietly turn a
// missing coordinate into a real point off the coast of Africa. Only an actual
// number, or a string that parses to one, counts.
function toNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
}

/** Wraps any longitude onto the equivalent point in [-180, 180]. */
export function wrapLongitude(lon) {
  const n = toNumber(lon);
  if (!Number.isFinite(n)) return NaN;
  if (n >= -180 && n <= 180) return n; // already valid — return untouched
  const wrapped = ((((n + 180) % 360) + 360) % 360) - 180;
  // The wrap maps both poles of the antimeridian onto -180; keep the sign the
  // caller implied so a marker at +180 doesn't visually jump to the far edge.
  return wrapped === -180 && n > 0 ? 180 : wrapped;
}

/** Latitude has no wrap-around — the map doesn't repeat vertically — so clamp. */
export function clampLatitude(lat) {
  const n = toNumber(lat);
  if (!Number.isFinite(n)) return NaN;
  return Math.min(90, Math.max(-90, n));
}

/**
 * Returns { lat, lon } safe to send to any of the weather APIs, or null when
 * the input isn't usable as a coordinate at all.
 */
export function normalizeCoords(lat, lon) {
  const nLat = clampLatitude(lat);
  const nLon = wrapLongitude(lon);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLon)) return null;
  return { lat: nLat, lon: nLon };
}
