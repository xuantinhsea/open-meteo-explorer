import { useState, useRef, useEffect, useCallback } from 'react';
import { searchLocations } from '../../api/geocoding';

export default function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  const search = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const r = await searchLocations(q);
      setResults(r);
      setOpen(r.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  }

  function handleSelect(loc) {
    setQuery(loc.name);
    setOpen(false);
    setResults([]);
    onSelect(loc);
  }

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Search city or place…"
          value={query}
          onChange={handleChange}
          className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
        />
        {loading && (
          <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-y-auto text-sm">
          {results.map((r) => (
            <li key={r.id}>
              <button
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-slate-700"
                onClick={() => handleSelect(r)}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
