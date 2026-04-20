import type { Note } from '@/features/notes/types';
import { NoteCard } from './note-card';

type Props = {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  deletingId?: string | null;
};

export function NotesGrid({ notes, onEdit, onDelete, deletingId }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === note.id}
        />
      ))}
    </div>
  );
}