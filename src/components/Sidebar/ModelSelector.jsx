import { useMemo } from 'react';
import { MODELS, resolveModelDateRange } from '../../utils/variableConfig';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className="text-slate-600 text-right">{value}</span>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ModelSelector({ mode, model, onChange }) {
  const models = MODELS[mode] || [];
  const selected = useMemo(() => models.find((m) => m.id === model), [models, model]);
  const dr = selected?.dataRange;
  const resolved = useMemo(() => dr ? resolveModelDateRange(dr) : null, [dr]);

  return (
    <div className="flex flex-col gap-2">
      <select
        value={model}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white text-slate-700"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>

      {dr && resolved && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[11px] flex flex-col gap-1">
          <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-0.5">Data Availability</p>
          <InfoRow label="From" value={
            dr.start === 'past92d'
              ? `${formatDate(resolved.min)} (past 92 days)`
              : formatDate(resolved.min)
          } />
          <InfoRow label="To" value={
            dr.end === 'present'
              ? `${formatDate(resolved.max)}${dr.delayDays ? ` (${dr.delayDays}-day delay)` : ''}`
              : dr.end?.startsWith('+')
              ? `${formatDate(resolved.max)} (+${dr.end.replace('+', '').replace('d', '')} day forecast)`
              : formatDate(resolved.max)
          } />
          <InfoRow label="Resolution" value={dr.resolution} />
          <InfoRow label="Grid spacing" value={dr.resolutionKm} />
          <InfoRow label="Region" value={dr.region} />
          {dr.updateFreq && <InfoRow label="Updated" value={dr.updateFreq} />}
          {dr.members && <InfoRow label="Members" value={`${dr.members} ensemble members`} />}
        </div>
      )}
    </div>
  );
}
