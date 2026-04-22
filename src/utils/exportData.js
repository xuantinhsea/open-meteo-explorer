import * as XLSX from 'xlsx';

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

export function exportExcel(data, selectedVars) {
  const { headers, rows } = buildTable(data, selectedVars);
  if (!rows.length) return;

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
