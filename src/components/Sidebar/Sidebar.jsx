import { useMemo } from 'react';
import ModeSelector from './ModeSelector';
import LocationSearch from './LocationSearch';
import DateRangePicker from './DateRangePicker';
import VariableSelector from './VariableSelector';
import ModelSelector from './ModelSelector';
import CSVImport from './CSVImport';
import CCKPControls from './CCKPControls';
import { findModel, resolveModelDateRange } from '../../utils/variableConfig';

export default function Sidebar({
  open,
  mode, onModeChange,
  resolution, onResolutionChange,
  location,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  selectedVars, onVarsChange,
  model, onModelChange,
  csvLocations, csvError, csvSkipped,
  onCSVImport, onCSVClear,
  onLocationSearch,
  onFetch,
  onCCKPFetch,
  loading,
}) {
  const dailyOnlyMode = mode === 'climate' || mode === 'flood';
  const projectionMode = mode === 'projection';
  const modelMeta = useMemo(() => findModel(mode, model), [mode, model]);
  const modelDateRange = useMemo(() => resolveModelDateRange(modelMeta?.dataRange), [modelMeta]);

  return (
    <aside
      className={`
        fixed md:static top-0 left-0 h-full z-30 bg-white border-r border-slate-200
        w-72 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100">
        <h1 className="text-base font-semibold text-slate-800 leading-tight">Open-Meteo Explorer</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">Live weather data explorer</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

        {/* Mode */}
        <section>
          <SectionLabel>Data Mode</SectionLabel>
          <ModeSelector mode={mode} onChange={onModeChange} />
        </section>

        {/* === CCKP Projection controls === */}
        {projectionMode ? (
          <section>
            <SectionLabel>World Bank CCKP</SectionLabel>
            <CCKPControls onFetch={onCCKPFetch} loading={loading} />
          </section>
        ) : (
          <>
            {/* Resolution (not for climate) */}
            {!dailyOnlyMode && (
              <section>
                <SectionLabel>Resolution</SectionLabel>
                <div className="flex gap-2">
                  {['hourly', 'daily'].map((r) => (
                    <button
                      key={r}
                      onClick={() => onResolutionChange(r)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        resolution === r
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Location search */}
            <section>
              <SectionLabel>Search Location</SectionLabel>
              <LocationSearch onSelect={onLocationSearch} />
              {location && (
                <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                  📍 {location.name || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}
                </p>
              )}
            </section>

            {/* Model */}
            <section>
              <SectionLabel>Weather Model</SectionLabel>
              <ModelSelector mode={mode} model={model} onChange={onModelChange} />
            </section>

            {/* Date range */}
            <section>
              <SectionLabel>Date Range</SectionLabel>
              <DateRangePicker
                mode={mode}
                startDate={startDate}
                endDate={endDate}
                onStartChange={onStartDateChange}
                onEndChange={onEndDateChange}
                modelDateRange={modelDateRange}
              />
            </section>

            {/* Variables */}
            <section>
              <SectionLabel>Variables</SectionLabel>
              <VariableSelector
                mode={mode}
                resolution={dailyOnlyMode ? 'daily' : resolution}
                selected={selectedVars}
                onChange={onVarsChange}
              />
            </section>

            {/* CSV Import */}
            <section>
              <SectionLabel>Import Locations (CSV)</SectionLabel>
              <CSVImport
                onImport={onCSVImport}
                locations={csvLocations}
                onClear={onCSVClear}
                parseError={csvError}
                skipped={csvSkipped}
                onLocationSelect={(loc) => onLocationSearch({ lat: loc.lat, lon: loc.lon, name: loc.name })}
              />
            </section>
          </>
        )}
      </div>

      {/* Fetch button — only for non-projection modes */}
      {!projectionMode && (
        <div className="px-4 py-3 border-t border-slate-100">
          <button
            onClick={onFetch}
            disabled={loading || !location}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Loading…' : 'Fetch Data'}
          </button>
          {!location && (
            <p className="text-[11px] text-slate-400 text-center mt-1.5">Click the map or search to set a location</p>
          )}
        </div>
      )}
    </aside>
  );
}

function SectionLabel({ children }) {
  return <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{children}</p>;
}
