// Area-of-interest fetching: sends the AOI sample points to Open-Meteo in batches
// (comma-separated coordinates), then merges points that snapped to the same grid
// cell and computes an area-weighted mean time series.
import { QUOTA, callWeightPerLocation } from '../utils/aoi';

const MAX_POINTS_PER_REQUEST = 100;          // keeps URLs well under length limits
const MINUTE_BUDGET = QUOTA.perMinute * 0.9; // leave headroom under the per-minute limit
const RETRY_WAIT_MS = 65_000;
const MAX_RETRIES = 3;

const sleep = (ms, signal) => new Promise((resolve, reject) => {
  const t = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Cancelled', 'AbortError')); });
});

function isRateLimit(msg) {
  return /limit|too many|429/i.test(msg || '');
}

/**
 * fetcher: the single-location fetch function for the mode (fetchHistorical, …)
 * onProgress({ done, total, waitingSec })
 */
export async function fetchArea({ fetcher, points, params, onProgress, signal }) {
  const nVars = (params.hourly?.length || 0) + (params.daily?.length || 0);
  const weight = callWeightPerLocation(nVars, params.startDate, params.endDate);
  const perBatch = Math.max(1, Math.min(MAX_POINTS_PER_REQUEST, Math.floor(MINUTE_BUDGET / weight)));

  const batches = [];
  for (let i = 0; i < points.length; i += perBatch) batches.push(points.slice(i, i + perBatch));

  const results = [];
  let windowStart = Date.now();
  let windowUsed = 0;

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const batchWeight = batch.length * weight;

    // Client-side throttle: wait for a fresh minute window when the budget would be exceeded
    if (windowUsed > 0 && windowUsed + batchWeight > MINUTE_BUDGET) {
      const waitMs = Math.max(0, 61_000 - (Date.now() - windowStart));
      onProgress?.({ done: b, total: batches.length, waitingSec: Math.ceil(waitMs / 1000) });
      await sleep(waitMs, signal);
      windowStart = Date.now();
      windowUsed = 0;
    }

    onProgress?.({ done: b, total: batches.length, waitingSec: 0 });
    let attempt = 0;
    for (;;) {
      if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      try {
        const res = await fetcher({
          ...params,
          lat: batch.map((p) => p.lat).join(','),
          lon: batch.map((p) => p.lon).join(','),
        });
        // A single coordinate returns an object, several return an array
        results.push(...(Array.isArray(res) ? res : [res]));
        break;
      } catch (e) {
        if (!isRateLimit(e.message) || attempt >= MAX_RETRIES) {
          throw new Error(`Area request failed at batch ${b + 1}/${batches.length}: ${e.message}`);
        }
        attempt++;
        onProgress?.({ done: b, total: batches.length, waitingSec: Math.round(RETRY_WAIT_MS / 1000) });
        await sleep(RETRY_WAIT_MS, signal);
        windowStart = Date.now();
        windowUsed = 0;
      }
    }
    windowUsed += batchWeight;
  }
  onProgress?.({ done: batches.length, total: batches.length, waitingSec: 0 });

  return aggregate(results, params);
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

function isDirectionVar(id) {
  return /direction/.test(id);
}

function aggregate(results, params) {
  const key = params.hourly?.length ? 'hourly' : 'daily';
  const varIds = key === 'hourly' ? params.hourly : params.daily;
  const first = results[0];
  const times = first?.[key]?.time || [];

  // Merge sample points that snapped to the same model grid cell; weight = number of samples
  const cellMap = new Map();
  results.forEach((r) => {
    const id = `${r.latitude},${r.longitude}`;
    const cell = cellMap.get(id);
    if (cell) cell.weight += 1;
    else cellMap.set(id, { lat: r.latitude, lon: r.longitude, elevation: r.elevation, weight: 1, store: r[key] || {} });
  });
  const cells = Array.from(cellMap.values()).map((c, i) => ({ ...c, id: `cell_${i + 1}` }));
  const totalWeight = cells.reduce((s, c) => s + c.weight, 0);

  const mean = { time: times };
  const cellData = {};
  varIds.forEach((v) => {
    cellData[v] = cells.map((c) => c.store[v] || []);
    mean[v] = times.map((_, t) => weightedMean(cells, v, t, isDirectionVar(v)));
  });

  const wMean = (f) => cells.reduce((s, c) => s + f(c) * c.weight, 0) / (totalWeight || 1);

  return {
    latitude: +wMean((c) => c.lat).toFixed(4),
    longitude: +wMean((c) => c.lon).toFixed(4),
    elevation: Math.round(wMean((c) => c.elevation ?? 0)),
    timezone: first?.timezone,
    utc_offset_seconds: first?.utc_offset_seconds,
    [key]: mean,
    [`${key}_units`]: first?.[`${key}_units`],
    _area: {
      nSamples: results.length,
      cells: cells.map(({ id, lat, lon, elevation, weight }) => ({ id, lat, lon, elevation, weight })),
      cellData,
      timeKey: key,
    },
  };
}

function weightedMean(cells, v, t, circular) {
  let sw = 0, s = 0, sx = 0, sy = 0;
  for (const c of cells) {
    const val = c.store[v]?.[t];
    if (val === null || val === undefined) continue;
    sw += c.weight;
    if (circular) {
      sx += c.weight * Math.cos(val * Math.PI / 180);
      sy += c.weight * Math.sin(val * Math.PI / 180);
    } else {
      s += c.weight * val;
    }
  }
  if (!sw) return null;
  if (circular) return Math.round(((Math.atan2(sy, sx) * 180 / Math.PI) + 360) % 360);
  return Math.round((s / sw) * 100) / 100;
}
