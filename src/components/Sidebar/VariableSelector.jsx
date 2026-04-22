import { useMemo } from 'react';
import { VARIABLES } from '../../utils/variableConfig';

export default function VariableSelector({ mode, resolution, selected, onChange }) {
  const vars = useMemo(() => {
    const modeVars = VARIABLES[mode] || {};
    return resolution === 'daily' ? (modeVars.daily || []) : (modeVars.hourly || modeVars.daily || []);
  }, [mode, resolution]);

  const groups = useMemo(() => {
    const g = {};
    vars.forEach((v) => {
      if (!g[v.group]) g[v.group] = [];
      g[v.group].push(v);
    });
    return g;
  }, [vars]);

  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{group}</p>
          <div className="flex flex-col gap-1">
            {items.map((v) => (
              <label key={v.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selected.includes(v.id)}
                  onChange={() => toggle(v.id)}
                  className="w-3.5 h-3.5 rounded accent-blue-500"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-800">{v.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      {vars.length === 0 && (
        <p className="text-xs text-slate-400">No variables for this mode/resolution.</p>
      )}
    </div>
  );
}
