import { useState, useEffect } from 'react';
import { CCKP_VARIABLES, CCKP_SCENARIOS, COUNTRIES, COUNTRY_WS_REGION } from '../../utils/cckpConfig';
import { fetchAdmin1List, fetchWatershedList } from '../../api/worldbank';

const LEVELS = [
  { id: 'country',     label: 'Country' },
  { id: 'subnational', label: 'Sub-national' },
  { id: 'watershed',   label: 'Watershed' },
];

export default function CCKPControls({ onFetch, loading }) {
  const [level, setLevel]               = useState('country');
  const [search, setSearch]             = useState('');
  const [country, setCountry]           = useState(null);
  const [admin1List, setAdmin1List]     = useState([]);
  const [admin1, setAdmin1]             = useState(null);
  const [wsList, setWsList]             = useState([]);
  const [watershed, setWatershed]       = useState(null);
  const [subLoading, setSubLoading]     = useState(false);
  const [subError, setSubError]         = useState(null);
  const [variable, setVariable]         = useState('tas');
  const [scenarios, setScenarios]       = useState(['ssp126', 'ssp245', 'ssp585']);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.iso3.toLowerCase().includes(search.toLowerCase()),
  );

  function resetSubState() {
    setAdmin1(null);
    setWatershed(null);
    setAdmin1List([]);
    setWsList([]);
    setSubError(null);
  }

  function toggleLevel(id) {
    setLevel(id);
    resetSubState();
  }

  function handleCountryChange(iso3) {
    const found = COUNTRIES.find((c) => c.iso3 === iso3);
    setCountry(found || null);
    resetSubState();
  }

  // Fetch sub-national or watershed list when country/level changes
  useEffect(() => {
    if (!country) return;

    if (level === 'subnational') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubLoading(true);
      fetchAdmin1List(country.iso3)
        .then(setAdmin1List)
        .catch((e) => setSubError(e.message))
        .finally(() => setSubLoading(false));
    } else if (level === 'watershed') {
      const prefix = COUNTRY_WS_REGION[country.iso3];
      if (!prefix) {
        setSubError('Watershed data not mapped for this country.');
        return;
      }
      setSubLoading(true);
      fetchWatershedList(prefix)
        .then(setWsList)
        .catch((e) => setSubError(e.message))
        .finally(() => setSubLoading(false));
    }
  }, [country, level]);

  function toggleScenario(id) {
    setScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function getGeocodeAndName() {
    if (level === 'country')     return { geocode: country?.iso3,        name: country?.name };
    if (level === 'subnational') return { geocode: admin1?.code,         name: `${admin1?.name}, ${country?.name}` };
    if (level === 'watershed')   return { geocode: watershed?.geocode,   name: watershed?.geocode };
    return {};
  }

  const { geocode, name: locationName } = getGeocodeAndName();

  const canFetch =
    !!geocode && scenarios.length > 0 &&
    (level === 'country' || (level === 'subnational' && admin1) || (level === 'watershed' && watershed));

  function handleFetch() {
    if (!canFetch) return;
    onFetch({ geocode, variable, scenarios, locationName, countryISO3: country?.iso3, locationLevel: level });
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Location Level */}
      <div>
        <SLabel>Location Level</SLabel>
        <div className="flex gap-1">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => toggleLevel(l.id)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                level === l.id
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Country picker */}
      <div>
        <SLabel>Country</SLabel>
        <input
          type="text"
          placeholder="Search country or ISO3…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400 mb-1.5"
        />
        <select
          size={5}
          value={country?.iso3 || ''}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400"
        >
          {filteredCountries.map((c) => (
            <option key={c.iso3} value={c.iso3}>
              {c.name} ({c.iso3})
            </option>
          ))}
        </select>
        {country && (
          <p className="text-[11px] text-teal-600 mt-1">✓ {country.name}</p>
        )}
      </div>

      {/* Sub-national */}
      {level === 'subnational' && country && (
        <div>
          <SLabel>Sub-national Region</SLabel>
          {subLoading ? (
            <p className="text-xs text-slate-400 animate-pulse">Loading regions…</p>
          ) : subError ? (
            <p className="text-xs text-red-500">{subError}</p>
          ) : admin1List.length === 0 ? (
            <p className="text-xs text-slate-400">No sub-national units found.</p>
          ) : (
            <select
              value={admin1?.code || ''}
              onChange={(e) => {
                const found = admin1List.find((a) => a.code === e.target.value);
                setAdmin1(found || null);
              }}
              className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400"
            >
              <option value="">— Select region —</option>
              {admin1List.map((a) => (
                <option key={a.code} value={a.code}>{a.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Watershed */}
      {level === 'watershed' && country && (
        <div>
          <SLabel>Watershed</SLabel>
          {subLoading ? (
            <p className="text-xs text-slate-400 animate-pulse">Loading watersheds…</p>
          ) : subError ? (
            <p className="text-xs text-red-500">{subError}</p>
          ) : wsList.length === 0 ? (
            <p className="text-xs text-slate-400">No watersheds found for this region.</p>
          ) : (
            <>
              <p className="text-[11px] text-slate-400 mb-1">{wsList.length} watersheds found</p>
              <select
                value={watershed?.geocode || ''}
                onChange={(e) => {
                  const found = wsList.find((w) => w.geocode === e.target.value);
                  setWatershed(found || null);
                }}
                className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400"
              >
                <option value="">— Select watershed —</option>
                {wsList.map((w) => (
                  <option key={w.geocode} value={w.geocode}>{w.geocode}</option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {/* Variable */}
      <div>
        <SLabel>Climate Variable</SLabel>
        <select
          value={variable}
          onChange={(e) => setVariable(e.target.value)}
          className="w-full border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400"
        >
          {CCKP_VARIABLES.map((v) => (
            <option key={v.id} value={v.id}>{v.label} ({v.unit})</option>
          ))}
        </select>
      </div>

      {/* Scenarios */}
      <div>
        <SLabel>Scenarios</SLabel>
        <div className="flex flex-col gap-2">
          {CCKP_SCENARIOS.map((s) => (
            <label key={s.id} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={scenarios.includes(s.id)}
                onChange={() => toggleScenario(s.id)}
                className="rounded"
              />
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-slate-600">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fetch button */}
      <button
        onClick={handleFetch}
        disabled={loading || !canFetch}
        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors mt-1"
      >
        {loading ? 'Loading…' : 'Fetch Projection'}
      </button>

      {!canFetch && (
        <p className="text-[11px] text-slate-400 text-center -mt-2">
          {!country
            ? 'Select a country first'
            : !scenarios.length
            ? 'Select at least one scenario'
            : level === 'subnational' && !admin1
            ? 'Select a sub-national region'
            : level === 'watershed' && !watershed
            ? 'Select a watershed'
            : ''}
        </p>
      )}
    </div>
  );
}

function SLabel({ children }) {
  return <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{children}</p>;
}
