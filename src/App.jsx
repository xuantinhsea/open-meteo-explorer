import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import MapPanel from './components/Map/MapPanel';
import ChartPanel from './components/Charts/ChartPanel';
import { useWeatherData } from './hooks/useWeatherData';
import { useCSVLocations } from './hooks/useCSVLocations';
import { MODELS, DEFAULT_VARIABLES } from './utils/variableConfig';
import { getDateConstraints } from './utils/dateUtils';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState('forecast');
  const [resolution, setResolution] = useState('hourly');
  const [activeLocation, setActiveLocation] = useState(null);
  const [model, setModel] = useState(MODELS.forecast[0].id);
  const [selectedVars, setSelectedVars] = useState(['temperature_2m', 'precipitation']);

  const constraints = getDateConstraints('forecast');
  const [startDate, setStartDate] = useState(constraints.defaultStart);
  const [endDate, setEndDate] = useState(constraints.defaultEnd);

  const { data, loading, error, fromCache, fetch: fetchWeather } = useWeatherData();
  const { locations: csvLocations, parseError, skipped, importCSV, clearLocations } = useCSVLocations();

  function handleModeChange(newMode) {
    setMode(newMode);
    const newModel = MODELS[newMode][0].id;
    setModel(newModel);
    const c = getDateConstraints(newMode);
    setStartDate(c.defaultStart);
    setEndDate(c.defaultEnd);
    const defaults = DEFAULT_VARIABLES[newMode];
    const isClimate = newMode === 'climate';
    const res = isClimate ? 'daily' : resolution;
    if (isClimate) setResolution('daily');
    setSelectedVars(defaults[res] || defaults.daily || []);
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
    const isClimate = mode === 'climate';
    const hourly = (!isClimate && resolution === 'hourly') ? selectedVars : [];
    const daily = (isClimate || resolution === 'daily') ? selectedVars : [];
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
        loading={loading}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-700">Open-Meteo Explorer</span>
        </div>

        {/* Map + Charts split */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Map */}
          <div className="h-[40vh] md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 relative">
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
              resolution={mode === 'climate' ? 'daily' : resolution}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
