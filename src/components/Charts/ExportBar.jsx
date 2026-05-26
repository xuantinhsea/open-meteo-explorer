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

export default function ExportBar({ data, selectedVars }) {
  if (!data) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-200">
      <span className="text-xs text-slate-400 mr-1">Export data:</span>
      {BUTTONS.map(({ label, icon, title, fn, cls }) => (
        <button
          key={label}
          title={title}
          onClick={() => fn(data, selectedVars)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-md text-slate-600 bg-white transition-colors ${cls}`}
        >
          <span>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
