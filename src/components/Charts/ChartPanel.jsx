import { useRef, useMemo } from 'react';
import Badge from '../UI/Badge';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorBanner from '../UI/ErrorBanner';
import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import EnsembleChart from './EnsembleChart';
import ProjectionChart from './ProjectionChart';
import ExportBar from './ExportBar';
import {
  TEMP_VARIABLE_IDS, PRECIP_VARIABLE_IDS,
  MARINE_HEIGHT_IDS, MARINE_PERIOD_IDS, MARINE_DIRECTION_IDS, MARINE_OCEAN_IDS,
  findModel,
} from '../../utils/variableConfig';

function downloadChart(chartRef, filename) {
  const url = chartRef.current?.toBase64Image?.();
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

function getTimeKey(data) {
  if (data.hourly?.time) return { times: data.hourly.time, key: 'hourly' };
  if (data.daily?.time) return { times: data.daily.time, key: 'daily' };
  return { times: [], key: null };
}

function buildMemberDatasets(data, varId) {
  const hourly = data.hourly || {};
  const memberKeys = Object.keys(hourly).filter((k) => k.startsWith(varId + '_member'));
  return memberKeys.map((k) => ({ label: k.replace(varId + '_', ''), values: hourly[k] }));
}

function computeMean(memberDatasets) {
  if (!memberDatasets.length) return null;
  const len = memberDatasets[0].values.length;
  const values = Array.from({ length: len }, (_, i) => {
    const sum = memberDatasets.reduce((s, ds) => s + (ds.values[i] ?? 0), 0);
    return Math.round((sum / memberDatasets.length) * 10) / 10;
  });
  return { values };
}

export default function ChartPanel({ data, loading, error, fromCache, mode, model, selectedVars, location, startDate, endDate, cckpData, cckpLoading, cckpError }) {
  const tempRef    = useRef(null);
  const precipRef  = useRef(null);
  const ensRef     = useRef(null);
  const projRef    = useRef(null);
  const marineRef1 = useRef(null);
  const marineRef2 = useRef(null);
  const marineRef3 = useRef(null);
  const marineRef4 = useRef(null);
  const floodRef   = useRef(null);

  // All hooks must run unconditionally before any early return
  const { times, key } = useMemo(() => (data ? getTimeKey(data) : { times: [], key: null }), [data]);

  const nowLabel = useMemo(() => {
    if (!times.length || (mode !== 'forecast' && mode !== 'ensemble')) return null;
    // eslint-disable-next-line react-hooks/purity
    const nowMs = Date.now();
    let best = null;
    let bestDiff = Infinity;
    for (const t of times) {
      const diff = Math.abs(new Date(t).getTime() - nowMs);
      if (diff < bestDiff) { bestDiff = diff; best = t; }
    }
    return best;
  }, [times, mode]);

  // The Open-Meteo responses carry no model field, so the label has to come from
  // the model the user actually picked — otherwise every historical result reads
  // "ERA5" even when it was fetched from CERRA or ECMWF IFS.
  const sourceLabel = useMemo(() => {
    if (!data) return null;
    const picked = findModel(mode, model)?.label;
    if (picked) return picked;
    if (mode === 'climate') return 'Climate Model';
    if (mode === 'ensemble') return 'Ensemble';
    return 'Open-Meteo Forecast';
  }, [data, mode, model]);

  const tempVars    = useMemo(() => selectedVars.filter((id) => TEMP_VARIABLE_IDS.has(id)), [selectedVars]);
  const precipVars  = useMemo(() => selectedVars.filter((id) => PRECIP_VARIABLE_IDS.has(id)), [selectedVars]);
  const otherVars   = useMemo(
    () => selectedVars.filter((id) => !TEMP_VARIABLE_IDS.has(id) && !PRECIP_VARIABLE_IDS.has(id) && !MARINE_HEIGHT_IDS.has(id) && !MARINE_PERIOD_IDS.has(id) && !MARINE_DIRECTION_IDS.has(id) && !MARINE_OCEAN_IDS.has(id)),
    [selectedVars],
  );
  // Marine-specific groupings
  const marineHeightVars    = useMemo(() => selectedVars.filter((id) => MARINE_HEIGHT_IDS.has(id)),    [selectedVars]);
  const marinePeriodVars    = useMemo(() => selectedVars.filter((id) => MARINE_PERIOD_IDS.has(id)),    [selectedVars]);
  const marineDirectionVars = useMemo(() => selectedVars.filter((id) => MARINE_DIRECTION_IDS.has(id)), [selectedVars]);
  const marineOceanVars     = useMemo(() => selectedVars.filter((id) => MARINE_OCEAN_IDS.has(id)),     [selectedVars]);

  // Last line of defence against the silent-null response. A dataset queried
  // outside its coverage — CERRA past 2021, a regional model outside its domain,
  // a wave variable asked of an ocean-current model — answers HTTP 200 with an
  // array of nulls, which would otherwise render as a blank chart and export as
  // empty columns. Computed before the per-mode early returns so every panel
  // gets the warning.
  const emptyVars = useMemo(() => {
    const store = (key && data) ? data[key] : null;
    if (!store) return [];
    return selectedVars.filter((id) => {
      const col = store[id];
      return Array.isArray(col) && col.length > 0 && col.every((v) => v === null);
    });
  }, [data, key, selectedVars]);

  const allEmpty = useMemo(() => {
    const store = (key && data) ? data[key] : null;
    if (!store || emptyVars.length === 0) return false;
    return emptyVars.length === selectedVars.filter((id) => Array.isArray(store[id])).length;
  }, [data, key, selectedVars, emptyVars]);

  // ── CCKP Projection panel — rendered after all hooks ──
  if (mode === 'projection') {
    if (cckpLoading) return <LoadingSpinner />;
    if (cckpError) return <div className="p-4"><ErrorBanner message={cckpError} /></div>;
    if (!cckpData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
          <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <p className="text-sm font-medium">No projection data</p>
          <p className="text-xs text-center max-w-xs">Select a country, variable, and scenarios in the sidebar then click <strong>Fetch Projection</strong>.</p>
        </div>
      );
    }

    const { historical, scenarioDatasets, unit, variableLabel, locationName, geocode } = cckpData;
    const futureYears = scenarioDatasets[0]?.years?.length ?? 0;
    const histYears = historical?.years?.length ?? 0;
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-700">Climate Projection</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium bg-teal-50 text-teal-700 border-teal-200">WB CCKP</span>
              <span className="text-xs text-slate-500">{locationName || geocode}</span>
            </div>
            <span className="text-xs text-slate-400">{histYears + futureYears} years · Shading = p10–p90</span>
          </div>

          {/* Main chart — taller to accommodate legend */}
          <ChartCard
            title={`${variableLabel} — Historical & Projection (1950–2100)`}
            onExport={() => {
              const url = projRef.current?.toBase64Image?.();
              if (!url) return;
              const a = document.createElement('a');
              a.href = url; a.download = `cckp_projection_${geocode}.png`; a.click();
            }}
            tall
          >
            <ProjectionChart
              chartRef={projRef}
              historical={historical}
              scenarioDatasets={scenarioDatasets}
              unit={unit}
            />
          </ChartCard>

          <div className="text-[11px] text-slate-400 text-center">
            Source: World Bank CCKP · CMIP6 · Ensemble median ± p10/p90
          </div>
        </div>

        <ExportBar
          kind="projection"
          payload={cckpData}
          label="Export projection:"
          meta={{
            mode: 'projection',
            model: 'CMIP6 ensemble (World Bank CCKP)',
            locationName: cckpData.locationName || geocode,
            latitude: null,
            longitude: null,
            startDate: String(historical?.years?.[0] ?? ''),
            endDate: String(scenarioDatasets[0]?.years?.at(-1) ?? ''),
            variables: [
              cckpData.variable,
              ...scenarioDatasets.map((s) => s.id),
            ].filter(Boolean).join(', '),
            rows: histYears + futureYears,
          }}
        />
      </div>
    );
  }

  // ── Marine panel ──────────────────────────────────────────────────────────
  if (mode === 'marine') {
    if (loading) return <LoadingSpinner />;
    if (error)   return <div className="p-4"><ErrorBanner message={error} /></div>;
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
          <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.584-6.96A4.5 4.5 0 103 15z" />
          </svg>
          <p className="text-sm font-medium">No marine data yet</p>
          <p className="text-xs text-center max-w-xs">Select a coastal or ocean location on the map, choose variables, and click <strong>Fetch Data</strong>.</p>
        </div>
      );
    }

    const { times: mTimes, key: mKey } = getTimeKey(data);
    const mStore = mKey ? data[mKey] : {};
    function marineDatasets(ids) {
      return ids.map((id) => ({
        id,
        label: id.replace(/_/g, ' '),
        values: mStore?.[id] || [],
      })).filter((ds) => ds.values.length > 0);
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
          <EmptyDataNotice vars={emptyVars} allEmpty={allEmpty} />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-700">Marine Data</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium bg-cyan-50 text-cyan-700 border-cyan-200">{sourceLabel || 'Marine API'}</span>
              {fromCache && (
                <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium bg-slate-100 text-slate-500 border-slate-200">⚡ cached</span>
              )}
              {data.latitude && (
                <span className="text-xs text-slate-400">{Number(data.latitude).toFixed(3)}, {Number(data.longitude).toFixed(3)}</span>
              )}
            </div>
            <span className="text-xs text-slate-400">{mTimes.length} time points</span>
          </div>

          {marineHeightVars.length > 0 && (
            <ChartCard title="Wave Heights (m)" onExport={() => downloadChart(marineRef1, 'wave_heights.png')}>
              <TemperatureChart chartRef={marineRef1} labels={mTimes} datasets={marineDatasets(marineHeightVars)} unit="m" nowLabel={nowLabel} />
            </ChartCard>
          )}
          {marinePeriodVars.length > 0 && (
            <ChartCard title="Wave Periods (s)" onExport={() => downloadChart(marineRef2, 'wave_periods.png')}>
              <TemperatureChart chartRef={marineRef2} labels={mTimes} datasets={marineDatasets(marinePeriodVars)} unit="s" nowLabel={nowLabel} />
            </ChartCard>
          )}
          {marineDirectionVars.length > 0 && (
            <ChartCard title="Wave Directions (°)" onExport={() => downloadChart(marineRef3, 'wave_directions.png')}>
              <TemperatureChart chartRef={marineRef3} labels={mTimes} datasets={marineDatasets(marineDirectionVars)} unit="°" nowLabel={nowLabel} />
            </ChartCard>
          )}
          {marineOceanVars.length > 0 && (
            <ChartCard title="Ocean Conditions" onExport={() => downloadChart(marineRef4, 'ocean.png')}>
              <TemperatureChart chartRef={marineRef4} labels={mTimes} datasets={marineDatasets(marineOceanVars)} unit="" nowLabel={nowLabel} />
            </ChartCard>
          )}
          {selectedVars.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Select variables in the sidebar to display charts.</p>
          )}
        </div>
        <ExportBar
          payload={data}
          meta={{
            mode, model,
            locationName: location?.name ?? null,
            latitude: data?.latitude ?? null,
            longitude: data?.longitude ?? null,
            startDate, endDate,
            variables: selectedVars.join(', '),
            rows: data?.hourly?.time?.length ?? data?.daily?.time?.length ?? 0,
          }}
        />
      </div>
    );
  }

  // ── Flood panel ──────────────────────────────────────────────────────────
  if (mode === 'flood') {
    if (loading) return <LoadingSpinner />;
    if (error)   return <div className="p-4"><ErrorBanner message={error} /></div>;
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
          <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 13h16" />
          </svg>
          <p className="text-sm font-medium">No flood data yet</p>
          <p className="text-xs text-center max-w-xs">Select a river location on the map, choose discharge variables, and click <strong>Fetch Data</strong>.</p>
        </div>
      );
    }

    const fTimes = data.daily?.time || [];
    const fStore = data.daily || {};
    function floodDatasets(ids) {
      return ids.map((id) => ({
        id,
        label: id.replace(/_/g, ' '),
        values: fStore[id] || [],
      })).filter((ds) => ds.values.length > 0);
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
          <EmptyDataNotice vars={emptyVars} allEmpty={allEmpty} />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-700">Flood Data</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium bg-orange-50 text-orange-700 border-orange-200">
                {sourceLabel || 'GloFAS v4'}
              </span>
              {fromCache && (
                <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium bg-slate-100 text-slate-500 border-slate-200">⚡ cached</span>
              )}
              {data.latitude && (
                <span className="text-xs text-slate-400">{Number(data.latitude).toFixed(3)}, {Number(data.longitude).toFixed(3)}</span>
              )}
            </div>
            <span className="text-xs text-slate-400">{fTimes.length} days</span>
          </div>

          {selectedVars.length > 0 && floodDatasets(selectedVars).length > 0 && (
            <ChartCard title="River Discharge (m³/s)" onExport={() => downloadChart(floodRef, 'river_discharge.png')}>
              <TemperatureChart
                chartRef={floodRef}
                labels={fTimes}
                datasets={floodDatasets(selectedVars)}
                unit="m³/s"
                nowLabel={null}
              />
            </ChartCard>
          )}
          {selectedVars.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Select discharge variables in the sidebar to display charts.</p>
          )}

          <div className="text-[11px] text-slate-400 text-center">
            Source: Global Flood Awareness System (GloFAS) · 5 km resolution · Note: ensemble stats (mean, median, p25, p75, max, min) are only available for forecasts, not reanalysis.
          </div>
        </div>
        <ExportBar
          payload={data}
          meta={{
            mode, model,
            locationName: location?.name ?? null,
            latitude: data?.latitude ?? null,
            longitude: data?.longitude ?? null,
            startDate, endDate,
            variables: selectedVars.join(', '),
            rows: data?.hourly?.time?.length ?? data?.daily?.time?.length ?? 0,
          }}
        />
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="p-4 flex flex-col gap-3">
      <ErrorBanner message={error} />
      {data && <p className="text-xs text-slate-500">Previously cached data is shown below.</p>}
    </div>
  );

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8">
        <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium">No data yet</p>
        <p className="text-xs text-center max-w-xs">Select a location on the map and click <strong>Fetch Data</strong> to view weather charts.</p>
      </div>
    );
  }

  const dataStore = key ? data[key] : {};

  function makeDatasets(varIds) {
    return varIds.map((id) => ({
      id,
      label: id.replace(/_/g, ' '),
      values: dataStore?.[id] || [],
    })).filter((ds) => ds.values.length > 0);
  }

  const isEnsemble = mode === 'ensemble';

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable chart area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
        <EmptyDataNotice vars={emptyVars} allEmpty={allEmpty} />
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-slate-700">Weather Data</h2>
            <Badge mode={mode} label={sourceLabel || mode} />
            {fromCache && (
              <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium bg-slate-100 text-slate-500 border-slate-200" title="Loaded from session cache — no API call made">
                ⚡ cached
              </span>
            )}
            {data.latitude && (
              <span className="text-xs text-slate-400">
                {Number(data.latitude).toFixed(3)}, {Number(data.longitude).toFixed(3)}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">{times.length} time points</span>
        </div>

        {/* Temperature Chart */}
        {tempVars.length > 0 && (
          <ChartCard
            title="Temperature"
            onExport={() => downloadChart(tempRef, 'temperature.png')}
          >
            {isEnsemble ? (
              <EnsembleChart
                chartRef={ensRef}
                labels={times}
                memberDatasets={buildMemberDatasets(data, tempVars[0])}
                meanDataset={computeMean(buildMemberDatasets(data, tempVars[0]))}
                variableLabel={tempVars[0]}
                unit="°C"
              />
            ) : (
              <TemperatureChart
                chartRef={tempRef}
                labels={times}
                datasets={makeDatasets(tempVars)}
                unit="°C"
                nowLabel={nowLabel}
              />
            )}
          </ChartCard>
        )}

        {/* Precipitation Chart */}
        {precipVars.length > 0 && (
          <ChartCard
            title="Precipitation"
            onExport={() => downloadChart(precipRef, 'precipitation.png')}
          >
            <PrecipitationChart
              chartRef={precipRef}
              labels={times}
              datasets={makeDatasets(precipVars)}
              nowLabel={nowLabel}
            />
          </ChartCard>
        )}

        {/* Other variables as line charts */}
        {otherVars.length > 0 && (
          <ChartCard title="Other Variables" onExport={() => {}}>
            <TemperatureChart
              labels={times}
              datasets={makeDatasets(otherVars)}
              unit=""
              nowLabel={nowLabel}
            />
          </ChartCard>
        )}

        {selectedVars.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">Select variables in the sidebar to display charts.</p>
        )}
      </div>

      {/* Export bar — always visible at the bottom */}
      <ExportBar
        payload={data}
        meta={{
          mode, model,
          locationName: location?.name ?? null,
          latitude: data?.latitude ?? null,
          longitude: data?.longitude ?? null,
          startDate, endDate,
          variables: selectedVars.join(', '),
          rows: data?.hourly?.time?.length ?? data?.daily?.time?.length ?? 0,
        }}
      />
    </div>
  );
}

// Explains an HTTP-200-but-empty response rather than leaving a blank chart.
function EmptyDataNotice({ vars, allEmpty }) {
  if (!vars?.length) return null;
  const plural = vars.length > 1;
  return (
    <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 leading-snug">
      <p className="font-semibold mb-1">
        {allEmpty ? 'This model returned no data for your request.' : 'Some variables came back empty.'}
      </p>
      <p>
        <span className="font-medium">{vars.join(', ')}</span>{' '}
        {plural ? 'are' : 'is'} entirely empty for this model, location and date range.
        The API reported success but holds no values here — usually the dates fall outside the
        dataset's coverage, the location is outside its region, or the model does not carry
        {plural ? ' these variables' : ' this variable'}.
        Check the <strong>Data Availability</strong> box under the model picker.
      </p>
    </div>
  );
}

function ChartCard({ title, children, onExport, tall }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <button
          onClick={onExport}
          className="text-xs text-slate-400 hover:text-blue-500 transition-colors"
          title="Export as PNG"
        >
          ↓ PNG
        </button>
      </div>
      <div className={tall ? 'h-80' : 'h-52'}>{children}</div>
    </div>
  );
}
