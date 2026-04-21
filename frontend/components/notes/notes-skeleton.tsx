export function NotesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_24px_45px_-34px_rgba(15,23,42,0.3)] backdrop-blur-sm"
        >
          <div className="flex gap-2">
            <div className="h-7 w-20 rounded-full bg-white/85" />
            <div className="h-7 w-24 rounded-full bg-white/75" />
          </div>
          <div className="mt-5 rounded-[22px] bg-white/70 p-4">
            <div className="h-6 w-2/3 rounded bg-slate-200/80" />
            <div className="mt-4 h-4 w-full rounded bg-slate-200/75" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-200/75" />
            <div className="mt-2 h-4 w-4/6 rounded bg-slate-200/75" />
          </div>
        </div>
      ))}
    </div>
  );
}
