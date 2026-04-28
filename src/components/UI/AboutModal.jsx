export default function AboutModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-t-2xl px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold leading-tight">Open-Meteo Explorer</h2>
              <p className="text-blue-100 text-sm mt-1">Weather & Climate Data Visualization Tool</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* About */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Open-Meteo Explorer is an interactive web application for exploring and downloading global
              weather, marine, flood, and long-term climate projection data. It queries multiple open-data
              APIs and presents results as interactive charts with CSV, Excel, and image export options.
            </p>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Features</h3>
            <ul className="grid grid-cols-2 gap-1.5">
              {[
                { color: 'bg-blue-500',   label: 'Forecast' },
                { color: 'bg-amber-500',  label: 'Historical' },
                { color: 'bg-purple-500', label: 'Ensemble' },
                { color: 'bg-green-500',  label: 'Climate Change' },
                { color: 'bg-cyan-500',   label: 'Marine Weather' },
                { color: 'bg-orange-500', label: 'Flood / GloFAS' },
                { color: 'bg-teal-500',   label: 'WB Projection', span: true },
              ].map((f) => (
                <li
                  key={f.label}
                  className={`flex items-center gap-2 text-xs text-slate-700 ${f.span ? 'col-span-2' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${f.color}`} />
                  {f.label}
                </li>
              ))}
            </ul>
          </section>

          {/* Data Sources */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Sources</h3>
            <ul className="flex flex-col gap-1">
              {[
                'Open-Meteo — Forecast, Historical, Ensemble, Climate',
                'Open-Meteo Marine API — Wave, Ocean, Currents',
                'Open-Meteo Flood API — GloFAS River Discharge',
                'World Bank CCKP — CMIP6 Climate Projections',
              ].map((s) => (
                <li key={s} className="text-xs text-slate-600 flex items-start gap-1.5">
                  <span className="text-slate-300 mt-0.5">›</span>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          {/* Tech Stack */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Built With</h3>
            <div className="flex flex-wrap gap-1.5">
              {['React 18', 'Vite 5', 'Tailwind CSS v4', 'Chart.js', 'Leaflet', 'Clerk Auth', 'Vercel'].map((t) => (
                <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded-full border border-slate-200">
                  {t}
                </span>
              ))}
            </div>
          </section>

          {/* Developer & Copyright */}
          <section className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                NT
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Dr. Nguyen Xuan Tinh</p>
                <p className="text-xs text-slate-500">Developer &amp; Researcher · CTI-AAP / CTII</p>
                <a
                  href="mailto:xuantinhsea@gmail.com"
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  xuantinhsea@gmail.com
                </a>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 text-center">
              © {new Date().getFullYear()} Dr. Nguyen Xuan Tinh. All rights reserved.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
