import { useRef, useMemo } from 'react';
import Badge from '../UI/Badge';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorBanner from '../UI/ErrorBanner';
import TemperatureChart from './TemperatureChart';
import PrecipitationChart from './PrecipitationChart';
import EnsembleChart from './EnsembleChart';
import ExportBar from './ExportBar';
import { TEMP_VARIABLE_IDS, PRECIP_VARIABLE_IDS } from '../../utils/variableConfig';

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

export default function ChartPanel({ data, loading, error, fromCache, mode, selectedVars, resolution }) {
  const tempRef = useRef(null);
  const precipRef = useRef(null);
  const ensRef = useRef(null);

  const { times, key } = useMemo(() => (data ? getTimeKey(data) : { times: [], key: null }), [data]);

  // Find the label in the times array closest to the current moment.
  // Returns null if mode has no "now" concept (historical, climate).
  const nowLabel = useMemo(() => {
    if (!times.length || (mode !== 'forecast' && mode !== 'ensemble')) return null;
    const nowMs = Date.now();
    let best = null;
    let bestDiff = Infinity;
    for (const t of times) {
      const diff = Math.abs(new Date(t).getTime() - nowMs);
      if (diff < bestDiff) { bestDiff = diff; best = t; }
    }
    return best;
  }, [times, mode]);

  const sourceLabel = useMemo(() => {
    if (!data) return null;
    const model = data.model || data.generationtime_ms ? null : null;
    if (mode === 'historical') return data.model || 'ERA5';
    if (mode === 'climate') return data.model || 'Climate Model';
    if (mode === 'ensemble') return data.model || 'Ensemble';
    return data.model || 'Open-Meteo Forecast';
  }, [data, mode]);

  const tempVars = useMemo(() => selectedVars.filter((id) => TEMP_VARIABLE_IDS.has(id)), [selectedVars]);
  const precipVars = useMemo(() => selectedVars.filter((id) => PRECIP_VARIABLE_IDS.has(id)), [selectedVars]);
  const otherVars = useMemo(
    () => selectedVars.filter((id) => !TEMP_VARIABLE_IDS.has(id) && !PRECIP_VARIABLE_IDS.has(id)),
    [selectedVars]
  );

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
      <ExportBar data={data} selectedVars={selectedVars} />
    </div>
  );
}

function ChartCard({ title, children, onExport }) {
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
      <div className="h-52">{children}</div>
    </div>
  );
}
