import { useState } from 'react';
import { exportCSV, exportTXT, exportExcel } from '../../utils/exportData';
import DownloadGateModal from '../UI/DownloadGateModal';
import {
  getSessionProfile, saveProfile, reportDownload, isTrackingConfigured,
} from '../../utils/downloadTracking';

const BUTTONS = [
  {
    label: 'CSV',
    icon: '📄',
    title: 'Export as comma-separated values (.csv)',
    fn: exportCSV,
    cls: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300',
  },
  {
    label: 'TXT',
    icon: '📝',
    title: 'Export as formatted plain text (.txt)',
    fn: exportTXT,
    cls: 'hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300',
  },
  {
    label: 'Excel',
    icon: '📊',
    title: 'Export as Excel workbook (.xlsx)',
    fn: exportExcel,
    cls: 'hover:bg-green-50 hover:text-green-700 hover:border-green-300',
  },
];

export default function ExportBar({ data, selectedVars, mode, model, location, startDate, endDate }) {
  // Which format the user asked for while the gate is open, or null when closed.
  const [pending, setPending] = useState(null);
  // Label of the export currently running. Excel loads SheetJS on demand, so it
  // can take a moment on a slow connection and needs visible feedback.
  const [busy, setBusy] = useState(null);
  const [failed, setFailed] = useState(null);

  if (!data) return null;

  async function runExport(button, profile) {
    setBusy(button.label);
    setFailed(null);
    try {
      await button.fn(data, selectedVars);
    } catch {
      // Realistically only the dynamic SheetJS import can fail here, and only
      // when the network drops between page load and clicking Excel.
      setFailed(button.label);
      setBusy(null);
      return;
    }
    setBusy(null);
    // Fire-and-forget: the file is already downloading, and a logging failure
    // must never be visible to the user or block their data.
    if (!profile) return; // ungated deployment — nothing to report
    reportDownload({
      ...profile,
      format: button.label,
      mode,
      model,
      locationName: location?.name ?? null,
      latitude: data?.latitude ?? null,
      longitude: data?.longitude ?? null,
      startDate,
      endDate,
      variables: selectedVars.join(', '),
      rows: data?.hourly?.time?.length ?? data?.daily?.time?.length ?? 0,
    });
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

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-200">
        <span className="text-xs text-slate-400 mr-1">Export data:</span>
        {BUTTONS.map((button) => (
          <button
            key={button.label}
            title={button.title}
            disabled={busy !== null}
            onClick={() => handleClick(button)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md text-slate-600 bg-white transition-colors disabled:opacity-50 disabled:cursor-wait ${button.cls}`}
          >
            <span>{busy === button.label ? '⏳' : button.icon}</span>
            {busy === button.label ? 'Preparing…' : button.label}
          </button>
        ))}
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
