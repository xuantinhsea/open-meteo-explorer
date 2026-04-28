import { MODES } from '../../utils/variableConfig';

const MODE_COLORS = {
  forecast:   'bg-blue-500   border-blue-500   text-white shadow-sm',
  historical: 'bg-amber-500  border-amber-500  text-white shadow-sm',
  ensemble:   'bg-purple-500 border-purple-500 text-white shadow-sm',
  climate:    'bg-green-500  border-green-500  text-white shadow-sm',
  marine:     'bg-cyan-500   border-cyan-500   text-white shadow-sm',
  flood:      'bg-orange-500 border-orange-500 text-white shadow-sm',
  projection: 'bg-teal-500   border-teal-500   text-white shadow-sm',
};

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 [&>*:last-child:nth-child(odd)]:col-span-2">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-2 py-2 rounded-md border text-xs font-semibold transition-colors ${
            mode === m.id
              ? MODE_COLORS[m.id]
              : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 bg-white'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
