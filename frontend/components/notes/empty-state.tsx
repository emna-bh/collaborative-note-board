type Props = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = 'No notes yet',
  description = 'Create the first shared note using the card beside it.',
}: Props) {
  return (
    <article className="relative h-full min-h-[17.5rem] overflow-hidden rounded-[28px] border border-dashed border-white/80 bg-white/70 p-3 shadow-[0_24px_45px_-34px_rgba(15,23,42,0.28)] backdrop-blur-sm">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.4),transparent_56%,rgba(255,255,255,0.12))]" />

      <div className="relative flex h-full flex-col rounded-[24px] border border-white/55 bg-white/50 p-4 pt-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
        <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-white/72 text-slate-500">
          <span className="text-sm leading-none">+</span>
        </div>

        <h2 className="text-lg font-semibold tracking-[-0.025em] text-slate-900">
          {title}
        </h2>
        <p className="mt-3 max-w-[24ch] text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </article>
  );
}
