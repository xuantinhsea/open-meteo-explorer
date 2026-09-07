/**
 * Generates DATASETS.md from the app's own configuration.
 *
 * The model tables, variable lists and coverage windows are derived from
 * src/utils/variableConfig.js and src/utils/cckpConfig.js rather than written
 * by hand, so the document cannot drift from what the app actually offers.
 *
 * Run:  node scripts/gen-datasets-doc.mjs
 */
import { writeFileSync } from 'node:fs';
import {
  MODES, MODELS, VARIABLES, DEFAULT_VARIABLES,
  MODEL_VARIABLE_SUPPORT, resolveModelDateRange,
} from '../src/utils/variableConfig.js';
import {
  CCKP_VARIABLES, COUNTRIES, COUNTRY_WS_REGION,
} from '../src/utils/cckpConfig.js';

const API = {
  forecast:   { name: 'Open-Meteo Forecast', host: 'api.open-meteo.com/v1/forecast' },
  historical: { name: 'Open-Meteo Archive',  host: 'archive-api.open-meteo.com/v1/archive' },
  ensemble:   { name: 'Open-Meteo Ensemble', host: 'ensemble-api.open-meteo.com/v1/ensemble' },
  climate:    { name: 'Open-Meteo Climate',  host: 'climate-api.open-meteo.com/v1/climate' },
  marine:     { name: 'Open-Meteo Marine',   host: 'marine-api.open-meteo.com/v1/marine' },
  flood:      { name: 'Open-Meteo Flood',    host: 'flood-api.open-meteo.com/v1/flood' },
  projection: { name: 'World Bank CCKP',     host: 'cckpapi.worldbank.org/cckp/v1' },
};

const SUMMARY = {
  forecast:   'Short-range weather from 16 global and regional NWP models.',
  historical: 'Reanalysis records back to 1940 — a gap-free reconstruction of past weather.',
  ensemble:   'Probabilistic forecasts: many runs from perturbed starting conditions.',
  climate:    'Downscaled CMIP6 daily projections to 2050.',
  marine:     'Waves, swell, ocean currents, sea surface temperature and sea level.',
  flood:      'Simulated daily river discharge from GloFAS.',
  projection: 'Country and watershed CMIP6 projections to 2100 under three SSP scenarios.',
};

const DETAIL = {
  forecast:
    'Short-range weather from 16 global and regional numerical weather prediction models. '
    + 'Includes roughly 92 days of recent past, so a forecast can be compared against what actually happened.',
  historical:
    'Reanalysis — a physically consistent reconstruction of past weather, produced by assimilating historical '
    + 'observations into a single fixed modern model. It is gap-free and global, but it is a model estimate '
    + 'rather than a station measurement, and it should not be quoted as observed data.',
  ensemble:
    'The same forecast run many times from slightly different starting conditions. The spread between members '
    + 'is the forecast uncertainty: a wide spread means low confidence. The chart draws every member plus the '
    + 'computed ensemble mean.',
  climate:
    'Downscaled CMIP6 climate model output to 2050 at daily resolution. These are projections, not forecasts — '
    + 'they describe a plausible climate, never the weather on a particular future date. Use them for trends '
    + 'and distributions across years, not for individual days.',
  marine:
    'Wave height, period and direction, plus ocean currents, sea surface temperature and sea level. '
    + 'Requires a sea or coastal point — an inland coordinate returns "No data is available for this location".',
  flood:
    'Simulated river discharge from the Global Flood Awareness System. Requires a point on a modelled river '
    + 'reach. The value is discharge for the whole grid cell, not a specific gauge, so it is best read as a '
    + 'relative signal (this week vs the seasonal norm) rather than an absolute cubic-metre figure.',
  projection:
    'Country- and watershed-level CMIP6 projections to 2100 under three emissions scenarios, each with a '
    + 'p10 / median / p90 uncertainty band plotted against a 1995-2014 historical baseline.',
};

const anchor = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => String(s).replace(/\|/g, '\\|');
const table = (headers, rows) => [
  '| ' + headers.join(' | ') + ' |',
  '|' + headers.map(() => '---').join('|') + '|',
  ...rows.map((r) => '| ' + r.map(esc).join(' | ') + ' |'),
].join('\n');
const code = (s) => '`' + s + '`';

function coverage(dataRange) {
  if (!dataRange) return '—';
  const r = resolveModelDateRange(dataRange);
  const from = dataRange.start === 'past92d' ? 'past 92 days' : r.min;
  let to;
  if (dataRange.end === 'present') {
    to = dataRange.delayDays ? `present − ${dataRange.delayDays} d` : 'present';
  } else if (String(dataRange.end).startsWith('+')) {
    to = '+' + String(dataRange.end).replace(/[+d]/g, '') + ' d ahead';
  } else {
    to = r.max;
  }
  return `${from} → ${to}`;
}

function variableTable(mode, res) {
  const items = VARIABLES[mode]?.[res] ?? [];
  if (!items.length) return null;
  const groups = {};
  for (const v of items) (groups[v.group] ??= []).push(v);
  return table(
    ['Group', 'Variable', 'API id'],
    Object.entries(groups).flatMap(([g, list]) =>
      list.map((v, i) => [i === 0 ? `**${g}**` : '', v.label, code(v.id)])),
  );
}

const out = [];
const p = (...lines) => out.push(...lines, '');

const totalModels = Object.values(MODELS).reduce((n, m) => n + m.length, 0);
const totalVars = Object.values(VARIABLES).reduce(
  (n, modeVars) => n + Object.values(modeVars).reduce((k, list) => k + list.length, 0), 0);

p('# Datasets & Features');
p('Complete reference for **Open-Meteo Explorer** — every data mode, model, variable and feature.');
p('> Generated from the application configuration by `scripts/gen-datasets-doc.mjs`.',
  '> Re-run it after editing `variableConfig.js` so this file cannot drift from the code.');

p('## At a glance');
p(table(['', ''], [
  ['Data modes', String(MODES.length)],
  ['Models / datasets', String(totalModels)],
  ['Weather variables', String(totalVars)],
  ['Upstream APIs', String(new Set(Object.values(API).map((a) => a.host)).size)],
  ['Earliest data', '1940-01-01 (ERA5)'],
  ['Latest data', '2100 (CCKP projections)'],
  ['API keys required', 'None'],
  ['Export formats', 'CSV, Excel (.xlsx), TXT, PNG'],
]));

p('## Data modes');
p(table(['Mode', 'Source', 'Summary'],
  MODES.map((m) => [`[${m.label}](#${anchor(m.label)})`, API[m.id].name, SUMMARY[m.id]])));

for (const mode of MODES) {
  const id = mode.id;
  p('---');
  p(`## ${mode.label}`);
  p(DETAIL[id]);
  p(`**Endpoint** — ` + code('https://' + API[id].host));

  if (id === 'projection') {
    p('### Emissions scenarios');
    p(table(['Scenario', 'Meaning', 'Warming by 2100'], [
      ['**SSP1-2.6**', 'Low emissions, strong mitigation', '~1.8 °C'],
      ['**SSP2-4.5**', 'Intermediate, current policies continued', '~2.7 °C'],
      ['**SSP5-8.5**', 'High emissions, fossil-fuel intensive', '~4.4 °C'],
    ]));
    p('Each scenario is served as a **p10 / median / p90** band across the CMIP6 multi-model ensemble.');
    p('### Variables');
    p(table(['Variable', 'Unit', 'API id'],
      CCKP_VARIABLES.map((v) => [v.label, v.unit, code(v.id)])));
    p('### Coverage');
    p(table(['', ''], [
      ['Countries', String(COUNTRIES.length)],
      ['Levels', 'National, and sub-national watershed'],
      ['Watershed regions', [...new Set(Object.values(COUNTRY_WS_REGION))].sort().join(', ')],
      ['Resolution', '0.25° (~25 km) downscaled CMIP6'],
      ['Projection period', '2015–2100'],
      ['Baseline', '1995–2014'],
    ]));
    p('> Not every sub-national watershed has CMIP6 data. A valid geocode with no coverage returns'
      + ' *"No data returned for this location"* — the geocode is correct, the dataset simply does not reach it.');
    continue;
  }

  p('### Models');
  p(table(['Model', 'API id', 'Coverage', 'Grid', 'Step', 'Region'],
    MODELS[id].map((m) => {
      const dr = m.dataRange ?? {};
      const region = dr.members ? `${dr.region} · ${dr.members} members` : (dr.region ?? '—');
      return [m.label, code(m.id), coverage(dr), dr.resolutionKm ?? '—', dr.resolution ?? '—', region];
    })));

  const gaps = MODEL_VARIABLE_SUPPORT[id];
  if (gaps) {
    p('### ⚠️ Variable gaps');
    p('These models carry only a **subset** of the variables below. The sidebar greys out the rest, because'
      + ' the API answers an unsupported variable with `HTTP 200` and an array of nulls rather than an error —'
      + ' without the guard it would look like an empty chart and export as empty columns.');
    for (const [modelId, spec] of Object.entries(gaps)) {
      p(`**${code(modelId)}** — ${spec.note}`);
      p(table(['Resolution', 'Available'], [
        ['Hourly', spec.hourly?.length ? spec.hourly.map(code).join(', ') : '— none —'],
        ['Daily', spec.daily?.length ? spec.daily.map(code).join(', ') : '— none —'],
      ]));
    }
  }

  for (const [res, heading] of [['hourly', 'Hourly variables'], ['daily', 'Daily variables']]) {
    const t = variableTable(id, res);
    if (t) {
      p(`### ${heading}`);
      p(t);
    }
  }

  const defaults = DEFAULT_VARIABLES[id];
  if (defaults) {
    const sel = defaults.hourly?.length ? defaults.hourly : (defaults.daily ?? []);
    if (sel.length) p('**Selected by default:** ' + sel.map(code).join(', '));
  }
}

// ─── Features ───────────────────────────────────────────────────────────────
p('---');
p('# Features');

p('## Choosing a location');
p(table(['Method', 'Notes'], [
  ['Click the map', 'Leaflet map, click anywhere. Coordinates are wrapped into ±180 first, so panning past the antimeridian cannot produce a longitude the APIs reject.'],
  ['Search by name', 'Open-Meteo geocoding with autocomplete; returns name, region, country, elevation and timezone.'],
  ['Import a CSV', 'Auto-detects `lat`/`latitude` and `lon`/`longitude`/`lng` columns, plus an optional name column. Rows outside valid ranges or with unparseable numbers are skipped and counted. Imported points appear as green pins; click one to load it.'],
  ['Share link', 'The link button copies a URL carrying mode, coordinates and date range. Opening it restores that state.'],
]));

p('## Charts');
p(table(['Chart', 'Applies to'], [
  ['Line chart', 'Temperature and most scalar variables'],
  ['Bar chart', 'Precipitation totals'],
  ['Ensemble spread', 'Every member traced individually plus a computed mean'],
  ['Projection bands', 'CCKP historical baseline with p10–p90 scenario ribbons'],
  ['Choropleth map', 'Country shading in WB Projection mode'],
  ['"Now" marker', 'Forecast and ensemble charts, at the nearest timestep to the current time'],
]));
p('Marine results are split into four charts — wave heights, periods, directions and ocean conditions — because'
  + ' those quantities share no sensible y-axis. Every chart exports to PNG individually.');
p('**On phones** the map and charts are shown one at a time, switched by a Map / Charts toggle in the header,'
  + ' rather than split down a screen too short for both. Fetching jumps straight to the charts. The layout'
  + ' is sized in `dvh`, so nothing hides behind the browser’s own toolbars.');

p('## Export');
p('All four formats are available in **every mode**, including WB Projection.');
p(table(['Format', 'Weather modes', 'WB Projection'], [
  ['**CSV**', 'One row per timestep, one column per selected variable.', 'One row per year; `p10`/`median`/`p90` columns for the baseline and each scenario. Metadata in `#` comment lines.'],
  ['**Excel (.xlsx)**', 'Two sheets — *Weather Data* and *Metadata* (model, coordinates, elevation, timezone, row count).', 'Two sheets — *Projection* and *Metadata* (geocode, level, variable, unit, scenarios, baseline).'],
  ['**TXT**', 'Fixed-width table with a metadata header.', 'Same, with the projection metadata block.'],
  ['**PNG**', 'Per-chart image export.', 'Projection chart with its uncertainty bands.'],
]));
p('SheetJS is loaded on demand when Excel is clicked, so the 429 kB library is not in the initial page load.');

p('### Download contact capture');
p('Before the first CSV, Excel or TXT export of a session — **in any mode** — a form collects **name, email,'
  + ' organisation and intended use**. Details are remembered for the session and prefilled on later visits.');
p('Every data export routes through one `ExportBar` component, so the gate cannot be bypassed by a download'
  + ' added elsewhere. PNG chart images are not gated: they are a picture of the chart, not the dataset.');
p(table(['Behaviour', 'Detail'], [
  ['Destination', 'A Google Apps Script web app appends a row to a Google Sheet and emails the site owner.'],
  ['Why a sheet', 'It gives a queryable log — sortable by organisation, repeat users, which datasets get taken — rather than an inbox to scroll.'],
  ['Never blocks', 'The file downloads first; the report is fire-and-forget. A logging outage costs a log row, never a user their data.'],
  ['Email throttling', 'One email per address per 30 minutes, so exporting CSV + Excel + TXT in a row does not send three near-identical mails. Every download still writes a row.'],
  ['Opt out', 'Build with `VITE_DOWNLOAD_LOG_ENDPOINT=off` to disable capture entirely.'],
]));
p('> Because a logging failure is deliberately invisible, the site looks completely normal if capture breaks.'
  + ' The sheet is the only place it shows — check it occasionally rather than trusting silence.');

p('## Data-availability safeguards');
p('Open-Meteo answers an out-of-coverage request with **`HTTP 200` and an array of nulls**, not an error.'
  + ' Only a date before the API-wide minimum returns a real `400`. Without guards, an unavailable dataset'
  + ' renders as a blank chart and exports as empty columns. Three layers prevent that:');
p(table(['#', 'Guard', 'Example it catches'], [
  ['1', 'Variables a model does not carry are greyed out and struck through, with the reason shown.', 'ERA5-Land offers no precipitation, yet precipitation is a default selection.'],
  ['2', 'Changing model clamps the dates into that dataset’s coverage and drops variables it cannot serve.', 'CERRA ends 2021-06-30 but the default window is the last 365 days.'],
  ['3', 'A response that is still all-null is explained in the chart panel rather than drawn as empty axes.', 'A regional model queried outside its domain, or a marine point inland.'],
]));

p('## Performance');
p(table(['', ''], [
  ['Session cache', 'Identical requests are served from memory with no second API call, shown as a ⚡ cached badge.'],
  ['Code splitting', 'Leaflet and Chart.js are separate chunks so an app change does not invalidate them in browser caches.'],
  ['Deferred SheetJS', 'Excel support downloads only when used.'],
]));
p('Initial payload is **226 kB gzipped** across four cached chunks, down from a single 317 kB chunk before'
  + ' splitting. Figures from `npm run build`; re-check them after adding a dependency.');

p('## Caveats worth knowing');
p(table(['Topic', 'Detail'], [
  ['Reanalysis is not observation', 'ERA5 and friends are model reconstructions. Gap-free and global, but not station measurements — do not cite them as observed data.'],
  ['ERA5-Land is temperature only', 'On Open-Meteo it serves 2 m temperature, dew point and relative humidity. Use **ERA5 Seamless** for precipitation, wind, cloud or radiation at the same 11 km resolution.'],
  ['ERA5 lags ~6 days', 'Day −5 is still partially null; day −6 is the first complete day.'],
  ['Projections are not forecasts', 'Climate and CCKP modes describe a plausible future climate, never the weather on a given date. Read them as trends across years.'],
  ['Flood discharge is per grid cell', 'Not a gauge reading. Best used as a relative signal against the seasonal norm.'],
  ['Marine needs water', 'An inland coordinate returns "No data is available for this location".'],
  ['Rate limits', 'Open-Meteo applies a short-term limit, not a strict daily cap. Narrow the date range or wait a minute.'],
]));

writeFileSync(new URL('../DATASETS.md', import.meta.url),
  out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
console.log('wrote DATASETS.md');
