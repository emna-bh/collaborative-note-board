export function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border bg-white p-4 shadow-sm"
        >
          <div className="h-5 w-2/3 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full rounded bg-gray-200" />
          <div className="mt-2 h-4 w-5/6 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-4/6 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}