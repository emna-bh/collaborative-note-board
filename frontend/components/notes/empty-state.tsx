export function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
      <h2 className="text-lg font-semibold">No notes yet</h2>
      <p className="mt-2 text-sm text-gray-600">
        Create the first shared note using the inline form above.
      </p>
    </div>
  );
}