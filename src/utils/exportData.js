// ─── CCKP Projection CSV export ───────────────────────────────────────────────
export function exportCCKPCSV(cckpData) {
  if (!cckpData) return;
  const { historical, scenarioDatasets, geocode, locationName, variable, unit } = cckpData;

  // Build combined year list
  const histYears = historical?.years ?? [];
  const futYears = scenarioDatasets?.[0]?.years ?? [];
  const allYears = [...new Set([...histYears, ...futYears])].sort((a, b) => a - b);

  // Build column headers
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
    valAt(historical?.p10,    histYears, year),
    valAt(historical?.median, histYears, year),
    valAt(historical?.p90,    histYears, year),
    ...(scenarioDatasets ?? []).flatMap((s) => [
      valAt(s.p10,    s.years, year),
      valAt(s.median, s.years, year),
      valAt(s.p90,    s.years, year),
    ]),
  ]);

  const meta = [
    `# World Bank CCKP Climate Projection`,
    `# Location: ${locationName || geocode}  |  Geocode: ${geocode}`,
    `# Variable: ${variable}  |  Unit: ${unit}`,
    `# Source: CCKP CMIP6 ensemble · p10/median/p90`,
    `# Exported: ${new Date().toISOString()}`,
    '',
  ];

  const lines = [...meta, headers.join(','), ...rows.map((r) => r.join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `cckp_${variable}_${geocode}.csv`);
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

  // Fixed-width columns for readability
  const colWidths = headers.map((h, i) => {
    const maxVal = Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length));
    return Math.min(maxVal + 2, 30);
  });

  function formatRow(row) {
    return row.map((v, i) => String(v ?? '').padEnd(colWidths[i])).join('  ');
  }

  const separator = colWidths.map((w) => '-'.repeat(w)).join('  ');
  const meta = [
    `Open-Meteo Export`,
    `Mode: ${data?._mode || ''}  |  Lat: ${data?.latitude}  Lon: ${data?.longitude}`,
    `Timezone: ${data?.timezone || ''}`,
    `Generated: ${new Date().toISOString()}`,
    '',
  ];

  const lines = [...meta, formatRow(headers), separator, ...rows.map(formatRow)];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
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

  // --- Data sheet ---
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = headers.map((h, i) => {
    const maxLen = Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length));
    return { wch: Math.min(maxLen + 2, 32) };
  });

  // Bold header row
  headers.forEach((_, i) => {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[cellAddr]) ws[cellAddr].s = { font: { bold: true } };
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Weather Data');

  // --- Metadata sheet ---
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
