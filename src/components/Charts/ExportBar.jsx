import { useAuth, useUser, SignInButton } from '@clerk/clerk-react';
import { exportCSV, exportTXT, exportExcel } from '../../utils/exportData';

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

async function logDownload({ user, format, data }) {
  try {
    await fetch('/api/log-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName:     `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || '—',
        userEmail:    user.primaryEmailAddress?.emailAddress ?? '—',
        format,
        locationName: data?.location?.name ?? data?.latitude ? `${data.latitude}, ${data.longitude}` : '—',
        mode:         data?.mode ?? '—',
      }),
    });
  } catch {
    // Logging failure should never block the download
  }
}

export default function ExportBar({ data, selectedVars }) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  if (!data) return null;

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-200">
        <span className="text-xs text-slate-400">Export data:</span>
        <SignInButton mode="modal">
          <button className="text-xs px-3 py-1.5 border border-slate-200 rounded-md text-teal-600 bg-white hover:bg-teal-50 hover:border-teal-300 transition-colors font-medium">
            Sign in to download CSV / TXT / Excel
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-200">
      <span className="text-xs text-slate-400 mr-1">Export data:</span>
      {BUTTONS.map(({ label, icon, title, fn, cls }) => (
        <button
          key={label}
          title={title}
          onClick={() => {
            fn(data, selectedVars);
            logDownload({ user, format: label, data });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md text-slate-600 bg-white transition-colors ${cls}`}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
