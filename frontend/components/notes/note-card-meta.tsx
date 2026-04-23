import type { Note } from '@/features/notes/types';

type Props = {
  note: Note;
};

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
  const label = (
    note.creatorName ||
    note.creatorEmail ||
    note.creatorId ||
    'U'
  ).trim();

  return label.charAt(0).toUpperCase() || 'U';
}

export function NoteCardMeta({ note }: Props) {
  const creatorLabel = getCreatorLabel(note);
  const creatorInitial = getCreatorInitial(note);

  return (
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
  );
}
