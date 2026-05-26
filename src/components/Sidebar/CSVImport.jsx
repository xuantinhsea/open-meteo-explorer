import { useRef, useState } from 'react';

export default function CSVImport({ onImport, locations, onClear, parseError, skipped, onLocationSelect }) {
  const inputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

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

  function toggleLocation(loc) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(loc.id)) {
      newSelected.delete(loc.id);
    } else {
      newSelected.add(loc.id);
    }
    setSelectedIds(newSelected);
    onLocationSelect(loc);
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
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">
              {locations.length} location{locations.length !== 1 ? 's' : ''} loaded
              {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
              {skipped > 0 && ` (${skipped} skipped)`}
            </span>
            <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-red-500 transition-colors">Clear</button>
          </div>
          <ul className="max-h-40 overflow-y-auto flex flex-col gap-1 border border-slate-200 rounded bg-slate-50 p-1">
            {locations.map((loc) => (
              <li
                key={loc.id}
                onClick={() => toggleLocation(loc)}
                className={`text-xs px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  selectedIds.has(loc.id)
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(loc.id)}
                    onChange={() => {}}
                    className="w-3 h-3"
                  />
                  <span className="flex-1 truncate">
                    {loc.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 ml-4">
                  {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
