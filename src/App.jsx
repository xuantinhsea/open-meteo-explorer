import { useState, useCallback } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import Sidebar from './components/Sidebar/Sidebar';
import MapPanel from './components/Map/MapPanel';
import ChartPanel from './components/Charts/ChartPanel';
import ProjectionMap from './components/Charts/ProjectionMap';
import AboutModal from './components/UI/AboutModal';
import AdminPanel from './components/Admin/AdminPanel';
import { useWeatherData } from './hooks/useWeatherData';
import { useCSVLocations } from './hooks/useCSVLocations';
import { MODELS, DEFAULT_VARIABLES } from './utils/variableConfig';
import { getDateConstraints } from './utils/dateUtils';
import { fetchCCKPScenario, fetchCCKPHistorical } from './api/worldbank';
import { CCKP_SCENARIOS, CCKP_VARIABLES } from './utils/cckpConfig';

const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export default function App() {
  const { user } = useUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === 'xuantinhsea@gmail.com';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [mode, setMode] = useState('forecast');
  const [resolution, setResolution] = useState('hourly');
  const [activeLocation, setActiveLocation] = useState(null);
  const [model, setModel] = useState(MODELS.forecast[0].id);
  const [selectedVars, setSelectedVars] = useState(['temperature_2m', 'precipitation']);

  const constraints = getDateConstraints('forecast');
  const [startDate, setStartDate] = useState(constraints.defaultStart);
  const [endDate, setEndDate] = useState(constraints.defaultEnd);

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
    setStartDate(c.defaultStart);
    setEndDate(c.defaultEnd);
    const defaults = DEFAULT_VARIABLES[newMode];
    const isDailyOnly = newMode === 'climate' || newMode === 'flood';
    const res = isDailyOnly ? 'daily' : resolution;
    if (isDailyOnly) setResolution('daily');
    else if (newMode === 'marine') setResolution('hourly');
    setSelectedVars(defaults[res] || defaults.hourly || defaults.daily || []);
  }

  function handleResolutionChange(res) {
    setResolution(res);
    const defaults = DEFAULT_VARIABLES[mode];
    setSelectedVars(defaults[res] || []);
  }

  function setLocation(lat, lon, name = '') {
    setActiveLocation({ lat, lon, name });
  }

  const handleMapClick = useCallback((lat, lon) => {
    setLocation(lat, lon, `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  }, []);

  const handleCSVPinClick = useCallback((loc) => {
    setActiveLocation(loc);
  }, []);

  const handleLocationSearch = useCallback((loc) => {
    setActiveLocation({ lat: loc.lat, lon: loc.lon, name: loc.name });
  }, []);

  function handleFetch() {
    if (!activeLocation) return;
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
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
        model={model} onModelChange={setModel}
        csvLocations={csvLocations} csvError={parseError} csvSkipped={skipped}
        onCSVImport={importCSV} onCSVClear={clearLocations}
        onLocationSearch={handleLocationSearch}
        onFetch={handleFetch}
        onCCKPFetch={handleCCKPFetch}
        loading={isProjection ? cckpLoading : loading}
      />

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {/* Admin panel */}
      <AdminPanel open={showAdmin} onClose={() => setShowAdmin(false)} />

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
          <span className="text-sm font-semibold text-slate-700 md:hidden">Open-Meteo Explorer</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowAbout(true)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="About this app"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {CLERK_ENABLED && isAdmin && (
              <button
                onClick={() => setShowAdmin(true)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                title="Admin panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </button>
            )}
            {CLERK_ENABLED && (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors">
                      Sign in to export
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <span className="text-xs text-slate-400 hidden md:inline">Export enabled</span>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            )}
          </div>
        </div>

        {/* Map + Charts split */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Left panel: weather map OR projection map */}
          <div className="h-[40vh] md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 relative">
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
          <div className="flex-1 md:w-1/2 overflow-hidden">
            <ChartPanel
              data={data}
              loading={loading}
              error={error}
              fromCache={fromCache}
              mode={mode}
              selectedVars={selectedVars}
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
