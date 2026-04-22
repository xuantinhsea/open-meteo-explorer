import { MODES } from '../../utils/variableConfig';

const MODE_COLORS = {
  forecast: 'border-blue-500 text-blue-600 bg-blue-50',
  historical: 'border-amber-500 text-amber-600 bg-amber-50',
  ensemble: 'border-purple-500 text-purple-600 bg-purple-50',
  climate: 'border-green-500 text-green-600 bg-green-50',
};

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-2 py-1.5 rounded-md border text-xs font-medium transition-colors ${
            mode === m.id
              ? MODE_COLORS[m.id]
              : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 bg-white'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
