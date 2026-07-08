export function Spinner({ label = "Lädt …" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12"
      role="status"
      aria-live="polite"
    >
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      <span className="text-sm text-stone-500">{label}</span>
    </div>
  );
}
