import type { Note } from '@/features/notes/types';
import ReactMarkdown from 'react-markdown';
import {
  getNoteChromeStyle,
  getNoteGlowStyle,
  getNoteSurfaceStyle,
} from '@/features/notes/colors';

type Props = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isDeleting?: boolean;
  isReordering?: boolean;
  isDragging?: boolean;
  onDragStart: (noteId: string) => void;
  onDragOver: (noteId: string) => void;
  onDrop: () => void;
  onDragEnd: () => void;
};

function GripDotsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4 fill-current"
    >
      {[
        [4, 4],
        [8, 4],
        [12, 4],
        [4, 8],
        [8, 8],
        [12, 8],
        [4, 12],
        [8, 12],
        [12, 12],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.1" />
      ))}
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 5-5 5 5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 6h11" />
      <path d="M8 6V4.8c0-.44.36-.8.8-.8h2.4c.44 0 .8.36.8.8V6" />
      <path d="M7 8.5v5.5" />
      <path d="M10 8.5v5.5" />
      <path d="M13 8.5v5.5" />
      <path d="m6 6 .55 8.01c.03.55.49.99 1.05.99h4.8c.56 0 1.02-.44 1.05-.99L14 6" />
    </svg>
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--:-- --/--/----';
  }

  const twoDigits = (part: number) => part.toString().padStart(2, '0');

  return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())} ${twoDigits(
    date.getDate()
  )}/${twoDigits(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function getCreatorLabel(note: Note) {
  return note.creatorEmail || note.creatorName || note.creatorId;
}

function getCreatorInitial(note: Note) {
  const label = (note.creatorName || note.creatorEmail || note.creatorId || 'U').trim();

  return label.charAt(0).toUpperCase() || 'U';
}

function shouldShowOverflowIndicator(content: string) {
  return content.trim().length > 180;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isDeleting,
  isReordering,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: Props) {
  const controlStyle = getNoteChromeStyle(note.color, 0.58);
  const showOverflowIndicator = shouldShowOverflowIndicator(note.content);
  const creatorLabel = getCreatorLabel(note);
  const creatorInitial = getCreatorInitial(note);

  return (
    <article
      draggable={!isReordering}
      onDragStart={() => onDragStart(note.id)}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(note.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      className={`group relative h-full min-h-[17.5rem] overflow-hidden rounded-[28px] border p-3 text-slate-800 transition duration-200 ease-out ${
        isDragging
          ? 'scale-[0.985] opacity-80'
          : 'hover:-translate-y-1 hover:shadow-[0_26px_70px_-38px_rgba(15,23,42,0.35)]'
      }`}
      style={getNoteSurfaceStyle(note.color)}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 opacity-80 blur-2xl"
        style={getNoteGlowStyle(note.color)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.4),transparent_50%,rgba(255,255,255,0.1))]" />

      <div className="relative flex h-full flex-col">
        <div
          aria-hidden="true"
          className="absolute left-3 top-3 z-10 flex h-8 w-8 cursor-grab items-center justify-center rounded-full border text-slate-500 transition duration-200 group-hover:-translate-y-0.5 group-hover:text-slate-700 active:cursor-grabbing"
          style={controlStyle}
        >
          <GripDotsIcon />
        </div>

        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || isReordering}
            aria-label="Move note up"
            title="Move up"
            className="flex h-8 w-8 items-center justify-center rounded-full border text-slate-700 transition duration-200 hover:-translate-y-0.5 disabled:opacity-45"
            style={controlStyle}
          >
            <ChevronUpIcon />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || isReordering}
            aria-label="Move note down"
            title="Move down"
            className="flex h-8 w-8 items-center justify-center rounded-full border text-slate-700 transition duration-200 hover:-translate-y-0.5 disabled:opacity-45"
            style={controlStyle}
          >
            <ChevronDownIcon />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onEdit(note)}
          className="w-full flex-1 rounded-[24px] border border-white/50 bg-white/48 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/60"
        >
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold tracking-[-0.025em] text-slate-900">
            {note.title}
          </h3>

          <div className="relative">
            <div className="max-h-20 overflow-hidden text-sm leading-6 text-slate-700">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h4 className="mb-2 text-base font-semibold text-slate-900">{children}</h4>
                  ),
                  h2: ({ children }) => (
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">{children}</h4>
                  ),
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="mb-2 border-l-2 border-slate-400/50 pl-3 italic text-slate-600 last:mb-0">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="rounded-md bg-white/75 px-1.5 py-0.5 text-[13px]">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="mb-2 overflow-x-auto rounded-2xl bg-white/75 p-3 text-[13px] last:mb-0">
                      {children}
                    </pre>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">{children}</strong>
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>

            {showOverflowIndicator && (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.92)_72%)]" />
                <span className="pointer-events-none absolute bottom-0 right-0 text-xs font-medium tracking-[0.08em] text-slate-500">
                  (...)
                </span>
              </>
            )}
          </div>
        </button>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div
              title={creatorLabel}
              aria-label={creatorLabel}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/72 text-[11px] font-semibold text-slate-700 shadow-[0_10px_18px_-16px_rgba(15,23,42,0.4)]"
            >
              {creatorInitial}
            </div>
            <p
              className="truncate text-xs font-medium text-slate-500"
              title={creatorLabel}
            >
              {formatUpdatedAt(note.updatedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(note.id)}
            disabled={isDeleting || isReordering}
            aria-label="Delete note"
            title="Delete note"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200/80 bg-white/68 text-rose-700 shadow-[0_12px_24px_-20px_rgba(244,63,94,0.8)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white/85 disabled:opacity-45"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
