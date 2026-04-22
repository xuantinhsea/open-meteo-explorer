import { useMemo } from 'react';
import { getDateConstraints } from '../../utils/dateUtils';

function Warning({ children }) {
  return (
    <p className="flex items-start gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
      <span className="shrink-0">⚠</span>
      <span>{children}</span>
    </p>
  );
}

export default function DateRangePicker({ mode, startDate, endDate, onStartChange, onEndChange, modelDateRange }) {
  const { min: modeMin, max: modeMax } = getDateConstraints(mode);

  // Effective limits: the tighter of mode-level and model-level constraints
  const effectiveMin = useMemo(() => {
    if (!modelDateRange?.min) return modeMin;
    return modelDateRange.min > modeMin ? modelDateRange.min : modeMin;
  }, [modeMin, modelDateRange]);

  const effectiveMax = useMemo(() => {
    if (!modelDateRange?.max) return modeMax;
    return modelDateRange.max < modeMax ? modelDateRange.max : modeMax;
  }, [modeMax, modelDateRange]);

  const startWarning = useMemo(() => {
    if (!startDate) return null;
    if (modelDateRange?.min && startDate < modelDateRange.min)
      return `Start date is before this dataset's earliest available data (${modelDateRange.min}).`;
    if (startDate < modeMin)
      return `Start date is before the earliest supported date for ${mode} mode (${modeMin}).`;
    return null;
  }, [startDate, modeMin, modelDateRange, mode]);

  const endWarning = useMemo(() => {
    if (!endDate) return null;
    if (modelDateRange?.max && endDate > modelDateRange.max)
      return `End date exceeds this dataset's latest available data (${modelDateRange.max}).`;
    if (endDate > modeMax)
      return `End date is beyond the supported range for ${mode} mode (${modeMax}).`;
    return null;
  }, [endDate, modeMax, modelDateRange, mode]);

  const orderWarning = startDate && endDate && startDate > endDate
    ? 'Start date must be before end date.'
    : null;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label className="block text-xs text-slate-500 mb-1">Start Date</label>
        <input
          type="date"
          value={startDate}
          min={effectiveMin}
          max={endDate || effectiveMax}
          onChange={(e) => onStartChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${
            startWarning ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
          }`}
        />
        {startWarning && <Warning>{startWarning}</Warning>}
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">End Date</label>
        <input
          type="date"
          value={endDate}
          min={startDate || effectiveMin}
          max={effectiveMax}
          onChange={(e) => onEndChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${
            endWarning ? 'border-amber-400 bg-amber-50' : 'border-slate-200'
          }`}
        />
        {endWarning && <Warning>{endWarning}</Warning>}
      </div>

      {orderWarning && <Warning>{orderWarning}</Warning>}

      {effectiveMin && effectiveMax && (
        <p className="text-[10px] text-slate-400 mt-0.5">
          Available: <span className="text-slate-500">{effectiveMin}</span> → <span className="text-slate-500">{effectiveMax}</span>
        </p>
      )}
    </div>
  );
}
