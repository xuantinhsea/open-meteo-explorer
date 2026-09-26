import { useState } from 'react';
import {
  exportCSV, exportTXT, exportExcel, exportCCKPCSV, exportCCKPTXT, exportCCKPExcel,
  exportAreaCellsCSV, exportAreaCellsExcel,
} from '../../utils/exportData';
import DownloadGateModal from '../UI/DownloadGateModal';
import {
  getSessionProfile, saveProfile, reportDownload, isTrackingConfigured,
} from '../../utils/downloadTracking';

// Shared presentation for the three formats. `weather` and `projection` differ
// only in which exporter they call — keeping them in one component means the
// contact gate cannot be bypassed by adding a download somewhere else.
const STYLES = {
  CSV:   { icon: '📄', cls: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300' },
  TXT:   { icon: '📝', cls: 'hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300' },
  Excel: { icon: '📊', cls: 'hover:bg-green-50 hover:text-green-700 hover:border-green-300' },
  'Cells CSV':   { icon: '🗺️', cls: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300' },
  'Cells Excel': { icon: '🗺️', cls: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300' },
};

const EXPORTERS = {
  weather: [
    { label: 'CSV',   title: 'Export as comma-separated values (.csv)', fn: exportCSV },
    { label: 'TXT',   title: 'Export as formatted plain text (.txt)',   fn: exportTXT },
    { label: 'Excel', title: 'Export as Excel workbook (.xlsx)',        fn: exportExcel },
  ],
  projection: [
    { label: 'CSV',   title: 'Export projection as comma-separated values (.csv)', fn: exportCCKPCSV },
    { label: 'TXT',   title: 'Export projection as formatted plain text (.txt)',   fn: exportCCKPTXT },
    { label: 'Excel', title: 'Export projection as Excel workbook (.xlsx)',        fn: exportCCKPExcel },
  ],
};

// Extra buttons for area-of-interest results: every grid cell, not just the mean
const AREA_EXPORTERS = [
  { label: 'Cells CSV',   title: 'Every grid cell inside the area, long format: time, cell, lat, lon, variables (.csv)', fn: exportAreaCellsCSV },
  { label: 'Cells Excel', title: 'Every grid cell inside the area: one sheet per variable (time × cells) plus a cell list (.xlsx)', fn: exportAreaCellsExcel },
];

export default function ExportBar({ kind = 'weather', payload, selectedVars = [], meta, label = 'Export data:' }) {
  // Which format the user asked for while the gate is open, or null when closed.
  const [pending, setPending] = useState(null);
  // Label of the export currently running. Excel loads SheetJS on demand, so it
  // can take a moment on a slow connection and needs visible feedback.
  const [busy, setBusy] = useState(null);
  const [failed, setFailed] = useState(null);

  if (!payload) return null;
  const buttons = EXPORTERS[kind] ?? EXPORTERS.weather;
  const areaButtons = kind === 'weather' && payload._area ? AREA_EXPORTERS : [];

  async function runExport(button, profile) {
    setBusy(button.label);
    setFailed(null);
    try {
      // Weather exporters need the selected variables; CCKP ones ignore the extra argument
      await button.fn(payload, selectedVars);
    } catch {
      // Realistically only the dynamic SheetJS import can fail here, and only
      // when the network drops between page load and clicking Excel.
      setFailed(button.label);
      setBusy(null);
      return;
    }
    setBusy(null);
    if (!profile) return; // ungated deployment — nothing to report
    // Fire-and-forget: the file is already downloading, and a logging failure
    // must never be visible to the user or block their data.
    reportDownload({ ...profile, format: button.label, ...meta });
  }

  function handleClick(button) {
    // With no endpoint configured there is nothing to gate on — never hold a
    // user's download hostage to a misconfigured deployment.
    if (!isTrackingConfigured()) {
      runExport(button, null);
      return;
    }
    const known = getSessionProfile();
    if (known) {
      runExport(button, known);
      return;
    }
    setPending(button);
  }

  function handleConfirm(profile) {
    const button = pending;
    setPending(null);
    saveProfile(profile);
    if (button) runExport(button, profile);
  }

  function renderButton(button) {
    return (
      <button
        key={button.label}
        title={button.title}
        disabled={busy !== null}
        onClick={() => handleClick(button)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md text-slate-600 bg-white transition-colors disabled:opacity-50 disabled:cursor-wait ${STYLES[button.label].cls}`}
      >
        <span>{busy === button.label ? '⏳' : STYLES[button.label].icon}</span>
        {busy === button.label ? 'Preparing…' : button.label}
      </button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex-wrap">
        <span className="text-xs text-slate-400 mr-1">{areaButtons.length ? 'Area mean:' : label}</span>
        {buttons.map(renderButton)}
        {areaButtons.length > 0 && (
          <>
            <span className="text-xs text-slate-400 ml-2 mr-1">Per cell:</span>
            {areaButtons.map(renderButton)}
          </>
        )}
        {failed && (
          <span className="text-xs text-rose-600">
            {failed} export failed to load — check your connection and retry.
          </span>
        )}
      </div>

      {pending && (
        <DownloadGateModal
          format={pending.label}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
