import type { Note } from '@/features/notes/types';

type Props = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

export function NoteCard({ note, onEdit, onDelete, isDeleting }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <button
        type="button"
        onClick={() => onEdit(note)}
        className="w-full text-left"
      >
        <h3 className="line-clamp-1 text-base font-semibold">{note.title}</h3>
        <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-gray-600">
          {note.content}
        </p>
      </button>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(note.id)}
          disabled={isDeleting}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}