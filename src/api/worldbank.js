const BASE = 'https://cckpapi.worldbank.org/cckp/v1';

// Verified 11-parameter dataset identifiers
function timeseriesDataset(variable, scenario, percentile = 'median', period = '2015-2100') {
  return `cmip6-x0.25_timeseries_${variable}_timeseries_annual_${period}_${percentile}_${scenario}_ensemble_all_mean`;
}

function baselineDataset(variable) {
  return `cmip6-x0.25_climatology_${variable}_climatology_annual_1995-2014_median_historical_ensemble_all_mean`;
}

// API returns keys like "2015-07". Strip the -MM suffix.
function toYear(key) { return parseInt(key.split('-')[0], 10); }

function parseTimeseries(json, geocode) {
  const container = json?.data ?? json;
  const raw = container?.[geocode];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('No data returned for this location. The CCKP may not cover this geocode.');
  }
  const entries = Object.entries(raw)
    .map(([k, v]) => [toYear(k), v === null || v === undefined ? null : Number(v)])
    .filter(([y]) => !isNaN(y))
    .sort(([a], [b]) => a - b);
  return { years: entries.map(([y]) => y), values: entries.map(([, v]) => v) };
}

async function cckpFetch(dataset, geocode) {
  const res = await fetch(`${BASE}/${dataset}/${geocode}?_format=json`);
  if (!res.ok) throw new Error(`CCKP HTTP ${res.status}`);
  const json = await res.json();
  if (json?.metadata?.status === 'error')
    throw new Error(`CCKP: ${json.metadata.message?.join(', ')}`);
  return json;
}

// Session caches (avoid refetching large all_* payloads)
let _subnationalCache = null;
let _watershedCache = null;
// CCKP's own geonames lookup: { country: { ISO3: { N: "Name", S: { "ISO3.ID": "Region name" } } } }
let _cckpGeonames = null;

async function getSubnationalGeocodes() {
  if (_subnationalCache) return _subnationalCache;
  const json = await cckpFetch(`${baselineDataset('tas')}`, 'all_countries_subnationals');
  _subnationalCache = Object.keys(json?.data ?? json);
  return _subnationalCache;
}

async function getWatershedGeocodes() {
  if (_watershedCache) return _watershedCache;
  const json = await cckpFetch(`${baselineDataset('tas')}`, 'all_watersheds');
  _watershedCache = Object.keys(json?.data ?? json);
  return _watershedCache;
}

// Fetches the CCKP's own geonames.json which maps every geocode to its display name.
// Structure: { country: { "TLS": { N: "Timor-Leste", S: { "TLS.2422957": "Aileu", … } } } }
async function getCCKPGeonames() {
  if (_cckpGeonames) return _cckpGeonames;
  try {
    const res = await fetch('/data/geonames.json');
    if (res.ok) _cckpGeonames = await res.json();
  } catch { /* fall back silently */ }
  _cckpGeonames ??= {};
  return _cckpGeonames;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function fetchAdmin1List(countryISO3) {
  const [all, geonames] = await Promise.all([
    getSubnationalGeocodes(),
    getCCKPGeonames(),
  ]);
  const codes = all.filter((k) => k.startsWith(countryISO3 + '.')).sort();
  if (!codes.length) throw new Error(`No sub-national units found for ${countryISO3} in CCKP.`);
  const subnationalMap = geonames?.country?.[countryISO3]?.S ?? {};
  return codes.map((code) => ({
    code,
    name: subnationalMap[code] ?? code,
  }));
}

export async function fetchWatershedList(prefix) {
  const all = await getWatershedGeocodes();
  const filtered = all.filter((k) => k.toUpperCase().startsWith(prefix.toUpperCase())).sort();
  if (!filtered.length) throw new Error(`No watersheds found for region "${prefix}".`);
  return filtered.map((geocode) => ({ geocode, name: geocode }));
}

// Fetches median + p10 + p90 timeseries for one scenario
// Returns { years, median, p10, p90 }
export async function fetchCCKPScenario(geocode, variable, scenario, period = '2015-2100') {
  const [medJson, p10Json, p90Json] = await Promise.all([
    cckpFetch(timeseriesDataset(variable, scenario, 'median', period), geocode),
    cckpFetch(timeseriesDataset(variable, scenario, 'p10',    period), geocode),
    cckpFetch(timeseriesDataset(variable, scenario, 'p90',    period), geocode),
  ]);
  const med = parseTimeseries(medJson, geocode);
  const p10 = parseTimeseries(p10Json, geocode);
  const p90 = parseTimeseries(p90Json, geocode);
  return { years: med.years, median: med.values, p10: p10.values, p90: p90.values };
}

// Fetches historical data (1950–2014) median + p10 + p90
export async function fetchCCKPHistorical(geocode, variable) {
  return fetchCCKPScenario(geocode, variable, 'historical', '1950-2014');
}

// Single-value baseline (1995–2014 climatology mean) — optional, returns null on failure
export async function fetchCCKPBaseline(geocode, variable) {
  try {
    const json = await cckpFetch(baselineDataset(variable), geocode);
    const data = json?.data ?? json;
    const vals = data?.[geocode];
    if (!vals || typeof vals !== 'object') return null;
    const v = Object.values(vals)[0];
    return typeof v === 'number' ? v : null;
  } catch { return null; }
}
