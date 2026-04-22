import { useRef } from 'react';

export default function CSVImport({ onImport, locations, onClear, parseError, skipped }) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) onImport(file);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onImport(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
      >
        <p className="text-xs text-slate-500">Drop CSV or <span className="text-blue-500 underline">browse</span></p>
        <p className="text-[10px] text-slate-400 mt-1">Columns: name, latitude, longitude</p>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      </div>

      {parseError && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{parseError}</p>
      )}

      {locations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">{locations.length} location{locations.length !== 1 ? 's' : ''} loaded{skipped > 0 ? ` (${skipped} skipped)` : ''}</span>
            <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors">Clear</button>
          </div>
          <ul className="max-h-32 overflow-y-auto flex flex-col gap-0.5">
            {locations.map((loc) => (
              <li key={loc.id} className="text-xs text-slate-600 px-2 py-1 rounded hover:bg-slate-50 truncate">
                {loc.name} <span className="text-slate-400">({loc.lat.toFixed(3)}, {loc.lon.toFixed(3)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
