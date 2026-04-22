export default function LoadingSpinner({ message = 'Fetching data…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
