import { useMemo } from 'react';
import { VARIABLES, getUnsupportedVars, getModelSupportNote } from '../../utils/variableConfig';

export default function VariableSelector({ mode, model, resolution, selected, onChange }) {
  const vars = useMemo(() => {
    const modeVars = VARIABLES[mode] || {};
    return resolution === 'daily' ? (modeVars.daily || []) : (modeVars.hourly || modeVars.daily || []);
  }, [mode, resolution]);

  // Variables this model answers with all-nulls rather than an error.
  const unsupported = useMemo(
    () => new Set(getUnsupportedVars(mode, model, resolution, vars.map((v) => v.id))),
    [mode, model, resolution, vars],
  );
  const supportNote = useMemo(() => getModelSupportNote(mode, model), [mode, model]);

  // Selections carried over from another model that this one can't serve.
  const staleSelection = useMemo(
    () => selected.filter((id) => unsupported.has(id)),
    [selected, unsupported],
  );

  const groups = useMemo(() => {
    const g = {};
    vars.forEach((v) => {
      if (!g[v.group]) g[v.group] = [];
      g[v.group].push(v);
    });
    return g;
  }, [vars]);

  function toggle(id) {
    if (unsupported.has(id)) return;
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {supportNote && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 leading-snug">
          <span className="mr-1">⚠</span>{supportNote}
        </p>
      )}

      {staleSelection.length > 0 && (
        <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-1.5 leading-snug">
          <p>
            {staleSelection.length} selected variable{staleSelection.length > 1 ? 's are' : ' is'} not
            available from this model and would download as empty column{staleSelection.length > 1 ? 's' : ''}.
          </p>
          <button
            onClick={() => onChange(selected.filter((id) => !unsupported.has(id)))}
            className="mt-1 underline font-medium hover:text-rose-900"
          >
            Deselect {staleSelection.length > 1 ? 'them' : 'it'}
          </button>
        </div>
      )}

      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{group}</p>
          <div className="flex flex-col gap-1">
            {items.map((v) => {
              const off = unsupported.has(v.id);
              return (
                <label
                  key={v.id}
                  title={off ? 'Not available from the selected model' : undefined}
                  className={`flex items-center gap-2 group ${off ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(v.id)}
                    disabled={off}
                    onChange={() => toggle(v.id)}
                    className="w-3.5 h-3.5 rounded accent-blue-500 disabled:opacity-40"
                  />
                  <span className={off ? 'text-xs text-slate-300 line-through' : 'text-xs text-slate-600 group-hover:text-slate-800'}>
                    {v.label}
                  </span>
                  {off && <span className="text-[10px] text-slate-300">n/a</span>}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {vars.length === 0 && (
        <p className="text-xs text-slate-400">No variables for this mode/resolution.</p>
      )}
    </div>
  );
}
