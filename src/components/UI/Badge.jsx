const COLOR_MAP = {
  forecast: 'bg-blue-100 text-blue-700 border-blue-200',
  historical: 'bg-amber-100 text-amber-700 border-amber-200',
  ensemble: 'bg-purple-100 text-purple-700 border-purple-200',
  climate: 'bg-green-100 text-green-700 border-green-200',
};

export default function Badge({ mode, label }) {
  const cls = COLOR_MAP[mode] || 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
