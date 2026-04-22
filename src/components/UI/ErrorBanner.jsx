export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
      <span className="mt-0.5 shrink-0">⚠️</span>
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
