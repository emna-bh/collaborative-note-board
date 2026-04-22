import type { Note } from '@/features/notes/types';
import {
  getNoteChromeStyle,
  getNoteGlowStyle,
  getNoteSurfaceStyle,
} from '@/features/notes/colors';
import { NoteCardMeta } from './note-card-meta';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripDotsIcon,
  TrashIcon,
} from './note-card-icons';
import { NoteMarkdownPreview } from './note-markdown-preview';

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

          <NoteMarkdownPreview content={note.content} />
        </button>

        <div className="mt-3 flex items-center justify-between gap-3">
          <NoteCardMeta note={note} />

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
