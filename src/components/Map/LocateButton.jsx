export default function LocateButton({ onClick, locating, supported }) {
  if (!supported) return null;
  return (
    <button
      onClick={onClick}
      disabled={locating}
      title="Use my current location"
      aria-label="Use my current location"
      className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-2 rounded-lg
                 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-sm
                 text-xs font-medium text-slate-600
                 hover:bg-white hover:text-blue-600 hover:border-blue-300
                 disabled:opacity-70 disabled:cursor-wait transition-colors"
    >
      {locating ? (
        <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.5" />
          <path strokeLinecap="round" d="M12 2v3M12 19v3M22 12h-3M5 12H2" />
          <circle cx="12" cy="12" r="8" />
        </svg>
      )}
      <span>{locating ? 'Locating…' : 'My location'}</span>
    </button>
  );
}
