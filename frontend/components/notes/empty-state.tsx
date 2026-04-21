export function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-white/80 bg-white/70 p-10 text-center shadow-[0_24px_45px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-slate-900">No notes yet</h2>
      <p className="mt-2 text-sm text-slate-600">
        Create the first shared note using the inline form above.
      </p>
    </div>
  );
}
