import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import MapPanel from './components/Map/MapPanel';
import ChartPanel from './components/Charts/ChartPanel';
import ProjectionMap from './components/Charts/ProjectionMap';
import AboutModal from './components/UI/AboutModal';
import { useWeatherData } from './hooks/useWeatherData';
import { useCSVLocations } from './hooks/useCSVLocations';
import { MODES, MODELS, DEFAULT_VARIABLES, findModel, resolveModelDateRange, getUnsupportedVars } from './utils/variableConfig';
import { getDateConstraints } from './utils/dateUtils';
import { fetchCCKPScenario, fetchCCKPHistorical } from './api/worldbank';
import { CCKP_SCENARIOS, CCKP_VARIABLES } from './utils/cckpConfig';
import { buildShareUrl, readShareParams } from './utils/shareUrl';
import { normalizeCoords } from './utils/geo';

// A share link is fixed for the lifetime of the page load, so resolve it once
// here and seed the initial state from it. Restoring it from an effect instead
// would set state during mount (a cascading render) and, because it only ever
// wrote mode/location/dates, would leave the model and variables on their
// forecast defaults — so a shared marine or flood link opened with variables
// that dataset does not carry.
const SHARED = readShareParams();
const INITIAL_MODE = SHARED.mode && MODES.some((m) => m.id === SHARED.mode) ? SHARED.mode : 'forecast';
const INITIAL_RESOLUTION = (INITIAL_MODE === 'climate' || INITIAL_MODE === 'flood') ? 'daily' : 'hourly';
const INITIAL_CONSTRAINTS = getDateConstraints(INITIAL_MODE);

// Narrows a date range into a model's actual coverage. Returns [start, end].
function clampToModel(mode, modelId, startDate, endDate) {
  const range = resolveModelDateRange(findModel(mode, modelId)?.dataRange);
  if (!range) return [startDate, endDate];
  const clamp = (d) => {
    if (!d) return d;
    if (range.min && d < range.min) return range.min;
    if (range.max && d > range.max) return range.max;
    return d;
  };
  let start = clamp(startDate);
  let end = clamp(endDate);
  // Wholly outside the coverage (e.g. a last-365-days range on CERRA, which
  // ends 2021-06-30): clamping alone collapses both ends onto the same day, so
  // rebuild a one-year window anchored to the dataset's latest data instead.
  if (start === end && startDate !== endDate) {
    end = range.max ?? end;
    const back = new Date(end);
    back.setFullYear(back.getFullYear() - 1);
    const backISO = back.toISOString().split('T')[0];
    start = range.min && backISO < range.min ? range.min : backISO;
  }
  return [start, end];
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  // Which pane a phone is showing. Ignored from the md breakpoint up, where the
  // map and charts sit side by side.
  const [mobileView, setMobileView] = useState('map');
  const [mode, setMode] = useState(INITIAL_MODE);
  const [resolution, setResolution] = useState(INITIAL_RESOLUTION);
  const [activeLocation, setActiveLocation] = useState(
    SHARED.lat != null && SHARED.lon != null
      ? { lat: SHARED.lat, lon: SHARED.lon, name: `${SHARED.lat.toFixed(4)}, ${SHARED.lon.toFixed(4)}` }
      : null,
  );
  const [model, setModel] = useState(MODELS[INITIAL_MODE]?.[0]?.id ?? MODELS.forecast[0].id);
  const [selectedVars, setSelectedVars] = useState(
    DEFAULT_VARIABLES[INITIAL_MODE]?.[INITIAL_RESOLUTION] ?? ['temperature_2m', 'precipitation'],
  );

  const [startDate, setStartDate] = useState(SHARED.startDate || INITIAL_CONSTRAINTS.defaultStart);
  const [endDate, setEndDate] = useState(SHARED.endDate || INITIAL_CONSTRAINTS.defaultEnd);

  // CCKP projection state
  const [cckpData, setCCKPData] = useState(null);
  const [cckpLoading, setCCKPLoading] = useState(false);
  const [cckpError, setCCKPError] = useState(null);

  const { data, loading, error, fromCache, fetch: fetchWeather } = useWeatherData();
  const { locations: csvLocations, parseError, skipped, importCSV, clearLocations } = useCSVLocations();

  function handleModeChange(newMode) {
    setMode(newMode);
    if (newMode === 'projection') return; // CCKP mode — no weather model/dates needed
    const newModel = MODELS[newMode][0].id;
    setModel(newModel);
    const c = getDateConstraints(newMode);
    // The mode-level defaults are a superset of any one model's coverage, so
    // narrow them to the model actually being selected.
    const [start, end] = clampToModel(newMode, newModel, c.defaultStart, c.defaultEnd);
    setStartDate(start);
    setEndDate(end);
    const defaults = DEFAULT_VARIABLES[newMode];
    const isDailyOnly = newMode === 'climate' || newMode === 'flood';
    const res = isDailyOnly ? 'daily' : resolution;
    if (isDailyOnly) setResolution('daily');
    else if (newMode === 'marine') setResolution('hourly');
    setSelectedVars(defaults[res] || defaults.hourly || defaults.daily || []);
  }

  // Switching model can strand the dates outside the new dataset's coverage.
  // Open-Meteo answers those with HTTP 200 and an array of nulls rather than an
  // error, so clamp instead of letting it silently return an empty result.
  function handleModelChange(newModel) {
    setModel(newModel);
    const [nextStart, nextEnd] = clampToModel(mode, newModel, startDate, endDate);
    if (nextStart !== startDate) setStartDate(nextStart);
    if (nextEnd !== endDate) setEndDate(nextEnd);
    // Drop variables the new model answers with nulls.
    const res = (mode === 'climate' || mode === 'flood') ? 'daily' : resolution;
    const dead = getUnsupportedVars(mode, newModel, res, selectedVars);
    if (dead.length) setSelectedVars(selectedVars.filter((v) => !dead.includes(v)));
  }

  function handleResolutionChange(res) {
    setResolution(res);
    const defaults = DEFAULT_VARIABLES[mode];
    setSelectedVars(defaults[res] || []);
  }

  // Coordinates arrive from map clicks, search results, CSV pins and share
  // links. Each path wraps them into range before they become the active
  // location, so no caller can hand the APIs a longitude they reject.
  const handleMapClick = useCallback((lat, lon) => {
    const c = normalizeCoords(lat, lon);
    if (!c) return;
    setActiveLocation({ ...c, name: `${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}` });
  }, []);

  const handleCSVPinClick = useCallback((loc) => {
    const c = normalizeCoords(loc.lat, loc.lon);
    if (!c) return;
    setActiveLocation({ ...loc, ...c });
  }, []);

  const handleLocationSearch = useCallback((loc) => {
    const c = normalizeCoords(loc.lat, loc.lon);
    if (!c) return;
    setActiveLocation({ ...c, name: loc.name });
  }, []);

  function handleFetch() {
    if (!activeLocation) return;
    // On a phone the sidebar covers the screen and the charts are on the other
    // pane, so a fetch would otherwise appear to do nothing.
    setSidebarOpen(false);
    setMobileView('charts');
    const isDailyOnly = mode === 'climate' || mode === 'flood';
    const hourly = (!isDailyOnly && resolution === 'hourly') ? selectedVars : [];
    const daily = (isDailyOnly || resolution === 'daily') ? selectedVars : [];
    fetchWeather({
      mode,
      lat: activeLocation.lat,
      lon: activeLocation.lon,
      hourly,
      daily,
      model,
      startDate,
      endDate,
    });
  }

  async function handleCCKPFetch({ geocode, variable, scenarios, locationName, countryISO3, locationLevel }) {
    setSidebarOpen(false);
    setMobileView('charts');
    setCCKPLoading(true);
    setCCKPError(null);
    setCCKPData(null);
    try {
      // Fetch historical + all scenarios (median + p10 + p90) in parallel
      const [historical, ...scenarioResults] = await Promise.all([
        fetchCCKPHistorical(geocode, variable),
        ...scenarios.map((scenarioId) => fetchCCKPScenario(geocode, variable, scenarioId)),
      ]);

      const scenarioDatasets = scenarioResults.map((r, i) => {
        const scenarioId = scenarios[i];
        const cfg = CCKP_SCENARIOS.find((s) => s.id === scenarioId);
        return { id: scenarioId, label: cfg?.label ?? scenarioId, color: cfg?.color ?? '#888', ...r };
      });

      const varCfg = CCKP_VARIABLES.find((v) => v.id === variable);

      setCCKPData({
        historical,
        scenarioDatasets,
        geocode,
        variable,
        unit: varCfg?.unit ?? '',
        variableLabel: varCfg?.label ?? variable,
        locationName,
        countryISO3,
        locationLevel,
      });
    } catch (e) {
      setCCKPError(e.message);
    } finally {
      setCCKPLoading(false);
    }
  }

  const isProjection = mode === 'projection';

  return (
    <div className="app-shell flex bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        mode={mode} onModeChange={handleModeChange}
        resolution={resolution} onResolutionChange={handleResolutionChange}
        location={activeLocation}
        startDate={startDate} onStartDateChange={setStartDate}
        endDate={endDate} onEndDateChange={setEndDate}
        selectedVars={selectedVars} onVarsChange={setSelectedVars}
        model={model} onModelChange={handleModelChange}
        csvLocations={csvLocations} csvError={parseError} csvSkipped={skipped}
        onCSVImport={importCSV} onCSVClear={clearLocations}
        onLocationSearch={handleLocationSearch}
        onFetch={handleFetch}
        onCCKPFetch={handleCCKPFetch}
        loading={isProjection ? cckpLoading : loading}
      />

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 md:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-700 hidden md:block">Open-Meteo Explorer</span>

          {/* Phone screens are too short to show a usable map and a readable
              chart at once, so they get one at a time instead of a split. */}
          <div className="flex md:hidden rounded-lg border border-slate-200 overflow-hidden shrink-0">
            {[['map', 'Map'], ['charts', isProjection ? 'Projection' : 'Charts']].map(([v, text]) => (
              <button
                key={v}
                onClick={() => setMobileView(v)}
                aria-pressed={mobileView === v}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  mobileView === v ? 'bg-slate-800 text-white' : 'bg-white text-slate-500'
                }`}
              >
                {text}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                const url = buildShareUrl({ mode, lat: activeLocation?.lat, lon: activeLocation?.lon, startDate, endDate });
                navigator.clipboard.writeText(url);
                alert('Location link copied to clipboard!');
              }}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Copy shareable link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="About this app"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Map + Charts — side by side from md up, one at a time below it */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Left panel: weather map OR projection map */}
          <div className={`${mobileView === 'map' ? '' : 'hidden'} md:block flex-1 min-h-0 md:flex-none md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 relative`}>
            {isProjection ? (
              <ProjectionMap
                countryISO3={cckpData?.countryISO3 ?? null}
                locationName={cckpData?.locationName ?? null}
                locationLevel={cckpData?.locationLevel ?? 'country'}
              />
            ) : (
              <>
                <MapPanel
                  activeLocation={activeLocation}
                  csvLocations={csvLocations}
                  onMapClick={handleMapClick}
                  onCSVPinClick={handleCSVPinClick}
                  active={mobileView === 'map'}
                />
                {activeLocation && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 shadow-sm z-10">
                    📍 {activeLocation.name || `${activeLocation.lat.toFixed(4)}, ${activeLocation.lon.toFixed(4)}`}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Charts */}
          <div className={`${mobileView === 'charts' ? '' : 'hidden'} md:block flex-1 min-h-0 md:w-1/2 overflow-hidden`}>
            <ChartPanel
              data={data}
              loading={loading}
              error={error}
              fromCache={fromCache}
              mode={mode}
              model={model}
              selectedVars={selectedVars}
              location={activeLocation}
              startDate={startDate}
              endDate={endDate}
              resolution={(mode === 'climate' || mode === 'flood') ? 'daily' : resolution}
              cckpData={cckpData}
              cckpLoading={cckpLoading}
              cckpError={cckpError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
