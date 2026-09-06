// ─── CCKP Projection exports ─────────────────────────────────────────────────
// The projection response has a different shape from the weather APIs (one row
// per year, three percentile columns per scenario), so it gets its own table
// builder. Everything downstream — CSV, Excel, TXT — is shared with the weather
// exporters below.

/** Flattens a CCKP response into { headers, rows }, one row per year. */
export function buildCCKPTable(cckpData) {
  if (!cckpData) return { headers: [], rows: [] };
  const { historical, scenarioDatasets } = cckpData;

  const histYears = historical?.years ?? [];
  const futYears = scenarioDatasets?.[0]?.years ?? [];
  const allYears = [...new Set([...histYears, ...futYears])].sort((a, b) => a - b);

  const scenarioCols = (scenarioDatasets ?? []).flatMap((s) => [
    `${s.id}_p10`, `${s.id}_median`, `${s.id}_p90`,
  ]);
  const headers = ['year', 'historical_p10', 'historical_median', 'historical_p90', ...scenarioCols];

  function valAt(arr, years, year) {
    const i = years.indexOf(year);
    if (i < 0 || arr == null) return '';
    const v = arr[i];
    return v === null || v === undefined ? '' : v;
  }

  const rows = allYears.map((year) => [
    year,
    valAt(historical?.p10, histYears, year),
    valAt(historical?.median, histYears, year),
    valAt(historical?.p90, histYears, year),
    ...(scenarioDatasets ?? []).flatMap((s) => [
      valAt(s.p10, s.years, year),
      valAt(s.median, s.years, year),
      valAt(s.p90, s.years, year),
    ]),
  ]);

  return { headers, rows };
}

function cckpMetaRows(cckpData) {
  const { geocode, locationName, variable, variableLabel, unit, scenarioDatasets, locationLevel } = cckpData ?? {};
  return [
    ['Source', 'World Bank CCKP — CMIP6 ensemble'],
    ['Location', locationName || geocode || ''],
    ['Geocode', geocode || ''],
    ['Level', locationLevel || ''],
    ['Variable', `${variableLabel || variable || ''} (${variable || ''})`],
    ['Unit', unit || ''],
    ['Scenarios', (scenarioDatasets ?? []).map((s) => s.label || s.id).join(', ')],
    ['Statistics', 'p10 / median / p90 across the multi-model ensemble'],
    ['Baseline', '1995–2014'],
    ['Exported', new Date().toISOString()],
  ];
}

function cckpFilename(cckpData, ext) {
  const v = cckpData?.variable ?? 'projection';
  const g = cckpData?.geocode ?? 'location';
  return `cckp_${v}_${g}.${ext}`;
}

export function exportCCKPCSV(cckpData) {
  const { headers, rows } = buildCCKPTable(cckpData);
  if (!rows.length) return;

  const meta = cckpMetaRows(cckpData).map(([k, v]) => `# ${k}: ${v}`);
  const lines = [
    ...meta,
    '',
    headers.join(','),
    ...rows.map((row) => row.map((v) => (String(v).includes(',') ? `"${v}"` : v)).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, cckpFilename(cckpData, 'csv'));
}

export function exportCCKPTXT(cckpData) {
  const { headers, rows } = buildCCKPTable(cckpData);
  if (!rows.length) return;

  const meta = ['World Bank CCKP Climate Projection', ...cckpMetaRows(cckpData).map(([k, v]) => `${k}: ${v}`), ''];
  const blob = new Blob([fixedWidth(headers, rows, meta)], { type: 'text/plain;charset=utf-8;' });
  triggerDownload(blob, cckpFilename(cckpData, 'txt'));
}

export async function exportCCKPExcel(cckpData) {
  const { headers, rows } = buildCCKPTable(cckpData);
  if (!rows.length) return;

  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = columnWidths(headers, rows);
  boldHeaderRow(XLSX, ws, headers);
  XLSX.utils.book_append_sheet(wb, ws, 'Projection');

  const wsMeta = XLSX.utils.aoa_to_sheet([['Field', 'Value'], ...cckpMetaRows(cckpData)]);
  wsMeta['!cols'] = [{ wch: 20 }, { wch: 52 }];
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');

  XLSX.writeFile(wb, cckpFilename(cckpData, 'xlsx'));
}

// ─── Shared formatting helpers ───────────────────────────────────────────────

function columnWidths(headers, rows) {
  return headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length));
    return { wch: Math.min(maxLen + 2, 32) };
  });
}

function boldHeaderRow(XLSX, ws, headers) {
  headers.forEach((_, i) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[addr]) ws[addr].s = { font: { bold: true } };
  });
}

/** Renders a table as aligned fixed-width text, preceded by metadata lines. */
function fixedWidth(headers, rows, metaLines) {
  const colWidths = headers.map((h, i) => {
    const maxVal = Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length));
    return Math.min(maxVal + 2, 30);
  });
  const formatRow = (row) => row.map((v, i) => String(v ?? '').padEnd(colWidths[i])).join('  ');
  const separator = colWidths.map((w) => '-'.repeat(w)).join('  ');
  return [...metaLines, formatRow(headers), separator, ...rows.map(formatRow)].join('\n');
}

/**
 * Builds a flat table from the API response.
 * Returns { headers: string[], rows: (string|number|null)[][] }
 */
export function buildTable(data, selectedVars) {
  const hourlyData = data?.hourly;
  const dailyData = data?.daily;
  const src = hourlyData || dailyData;
  if (!src?.time) return { headers: [], rows: [] };

  const times = src.time;
  const availableVars = selectedVars.filter((v) => Array.isArray(src[v]));

  const headers = ['time', ...availableVars];
  const rows = times.map((t, i) => [
    t,
    ...availableVars.map((v) => {
      const val = src[v][i];
      return val === null || val === undefined ? '' : val;
    }),
  ]);

  return { headers, rows };
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeFilename(data, ext) {
  const lat = data?.latitude ? Number(data.latitude).toFixed(2) : 'loc';
  const lon = data?.longitude ? Number(data.longitude).toFixed(2) : '';
  const mode = data?._mode || 'data';
  return `open-meteo_${mode}_${lat}_${lon}.${ext}`;
}

export function exportCSV(data, selectedVars) {
  const { headers, rows } = buildTable(data, selectedVars);
  if (!rows.length) return;

  const lines = [
    headers.join(','),
    ...rows.map((row) => row.map((v) => (String(v).includes(',') ? `"${v}"` : v)).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, safeFilename(data, 'csv'));
}

export function exportTXT(data, selectedVars) {
  const { headers, rows } = buildTable(data, selectedVars);
  if (!rows.length) return;

  const meta = [
    'Open-Meteo Export',
    `Mode: ${data?._mode || ''}  |  Lat: ${data?.latitude}  Lon: ${data?.longitude}`,
    `Timezone: ${data?.timezone || ''}`,
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  const blob = new Blob([fixedWidth(headers, rows, meta)], { type: 'text/plain;charset=utf-8;' });
  triggerDownload(blob, safeFilename(data, 'txt'));
}

// SheetJS is by far the heaviest dependency here and only the Excel button
// needs it, so it is pulled in on demand rather than shipped in the initial
// bundle. That makes this the one async exporter — callers must await it.
export async function exportExcel(data, selectedVars) {
  const { headers, rows } = buildTable(data, selectedVars);
  if (!rows.length) return;

  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = columnWidths(headers, rows);
  boldHeaderRow(XLSX, ws, headers);
  XLSX.utils.book_append_sheet(wb, ws, 'Weather Data');

  const metaRows = [
    ['Field', 'Value'],
    ['Mode', data?._mode || ''],
    ['Latitude', data?.latitude],
    ['Longitude', data?.longitude],
    ['Elevation (m)', data?.elevation],
    ['Timezone', data?.timezone],
    ['UTC offset (s)', data?.utc_offset_seconds],
    ['Time points', rows.length],
    ['Variables', selectedVars.join(', ')],
    ['Exported', new Date().toISOString()],
  ];
  const wsMeta = XLSX.utils.aoa_to_sheet(metaRows);
  wsMeta['!cols'] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');

  XLSX.writeFile(wb, safeFilename(data, 'xlsx'));
}
