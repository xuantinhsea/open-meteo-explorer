import { useRef } from 'react';
import { MAX_SAMPLE_POINTS, QUOTA } from '../../utils/aoi';

const fmt = (n) => Math.round(n).toLocaleString('en-US');

export default function AreaSelector({ aoi, sampling, spacingKm, autoSpacingKm, onSpacingChange, estimate }) {
  const inputRef = useRef(null);
  const { features, selected, setSelected, drawMode, setDrawMode, error, parsing, source } = aoi;

  function handleFiles(files) {
    if (files?.length) aoi.importFiles(files);
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Upload */}
      <div
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
      >
        <p className="text-xs text-slate-500">
          {parsing ? 'Reading file…' : <>Drop boundary file or <span className="text-blue-500 underline">browse</span></>}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">Shapefile (.zip, or .shp + .dbf + .prj) · GeoJSON · KML</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".zip,.shp,.dbf,.prj,.cpg,.geojson,.json,.kml"
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* Draw */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400">or draw:</span>
        {[
          { id: 'rectangle', label: '▭ Rectangle' },
          { id: 'polygon', label: '⬠ Polygon' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setDrawMode(drawMode === t.id ? null : t.id)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              drawMode === t.id
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {drawMode && (
        <p className="text-[11px] text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1.5 leading-relaxed">
          {drawMode === 'rectangle'
            ? 'Click two opposite corners on the map.'
            : 'Click to add vertices. Double-click, or click the first point, to finish.'}
          {' '}Esc to cancel.
        </p>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1.5">{error}</p>}

      {/* Loaded area */}
      {features.length > 0 && (
        <div className="flex flex-col gap-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-700 truncate" title={source}>{source}</span>
            <button onClick={aoi.clear} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors shrink-0">Clear</button>
          </div>

          {features.length > 1 && (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All features combined ({features.length})</option>
              {features.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
            </select>
          )}
          {features.length > 1 && (
            <p className="text-[10px] text-slate-400 -mt-1">Tip: click a shape on the map to select it.</p>
          )}

          <div className="flex items-center gap-2 text-[11px]">
            <label className="text-slate-500 shrink-0" htmlFor="aoi-spacing">Sampling every</label>
            <input
              id="aoi-spacing"
              type="number"
              min={1}
              step={1}
              value={spacingKm}
              onChange={(e) => onSpacingChange(e.target.value === '' ? null : Math.max(1, Number(e.target.value)))}
              className="w-16 px-1.5 py-1 border border-slate-200 rounded text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <span className="text-slate-500">km</span>
            {spacingKm !== autoSpacingKm && (
              <button onClick={() => onSpacingChange(null)} className="text-blue-500 hover:underline ml-auto">
                reset ({autoSpacingKm} km)
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed -mt-1">
            Default = the model&apos;s grid spacing. Smaller spacing does not add detail; it only uses more API calls.
          </p>

          <Summary aoi={aoi} sampling={sampling} estimate={estimate} />
        </div>
      )}
    </div>
  );
}

function Summary({ aoi, sampling, estimate }) {
  if (sampling.tooMany) {
    return (
      <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5">
        Area needs more than {MAX_SAMPLE_POINTS.toLocaleString()} sample points. Increase the sampling distance or select a smaller feature.
      </p>
    );
  }
  const n = sampling.points.length;
  const level = estimate.calls > QUOTA.perHour ? 'red' : estimate.calls > QUOTA.perMinute ? 'amber' : 'green';
  const cls = {
    green: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    red:   'text-red-700 bg-red-50 border-red-200',
  }[level];

  return (
    <div className={`text-[11px] border rounded px-2 py-1.5 leading-relaxed ${cls}`}>
      <div className="flex justify-between"><span>Area</span><span>{fmt(aoi.areaKm2)} km²</span></div>
      <div className="flex justify-between"><span>Sample points</span><span>{n}</span></div>
      <div className="flex justify-between font-medium"><span>Est. API calls</span><span>≈ {fmt(estimate.calls)}</span></div>
      {level === 'amber' && (
        <p className="mt-1">Above the {QUOTA.perMinute}/min free limit — the download will pause between batches (≈ {Math.ceil(estimate.calls / (QUOTA.perMinute * 0.9))} min).</p>
      )}
      {level === 'red' && (
        <p className="mt-1">Exceeds the free {fmt(QUOTA.perHour)}/hour limit ({fmt(QUOTA.perDay)}/day). Shorten the date range, select fewer variables, or increase the sampling distance. For large areas over long periods, download NetCDF from the Copernicus Climate Data Store instead.</p>
      )}
      {n === 1 && <p className="mt-1">Area is smaller than one grid cell — using a single central point.</p>}
    </div>
  );
}
