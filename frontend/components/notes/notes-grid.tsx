import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import type { Note } from '@/features/notes/types';
import { moveNoteId } from '@/features/notes/utils';
import { NoteCard } from './note-card';

type Props = {
  leadingCard?: ReactNode;
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onReorder: (noteIds: string[]) => Promise<void> | void;
  deletingId?: string | null;
  isReordering?: boolean;
};

export function NotesGrid({
  leadingCard,
  notes,
  onEdit,
  onDelete,
  onReorder,
  deletingId,
  isReordering,
}: Props) {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const droppedRef = useRef(false);
  const baseIds = notes.map((note) => note.id);
  const activeIds =
    draggedId || isReordering ? (orderedIds.length ? orderedIds : baseIds) : baseIds;
  const notesById = new Map(notes.map((note) => [note.id, note]));
  const orderedNotes = activeIds
    .map((noteId) => notesById.get(noteId))
    .filter((note): note is Note => Boolean(note));

  const commitReorder = (noteIds: string[]) => {
    if (noteIds.join('|') === baseIds.join('|')) {
      return;
    }

    void onReorder(noteIds);
  };

  const handleMove = (noteId: string, offset: -1 | 1) => {
    const currentIndex = activeIds.indexOf(noteId);
    const nextIndex = currentIndex + offset;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= activeIds.length) {
      return;
    }

    const nextIds = [...activeIds];
    const [movedId] = nextIds.splice(currentIndex, 1);
    nextIds.splice(nextIndex, 0, movedId);
    setOrderedIds(nextIds);
    commitReorder(nextIds);
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {leadingCard}

      {orderedNotes.map((note, index) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveUp={() => handleMove(note.id, -1)}
          onMoveDown={() => handleMove(note.id, 1)}
          canMoveUp={index > 0}
          canMoveDown={index < orderedNotes.length - 1}
          isDeleting={deletingId === note.id}
          isReordering={isReordering}
          isDragging={draggedId === note.id}
          onDragStart={(noteId) => {
            droppedRef.current = false;
            setOrderedIds(baseIds);
            setDraggedId(noteId);
          }}
          onDragOver={(targetId) => {
            if (!draggedId || draggedId === targetId) {
              return;
            }

            setOrderedIds((current) =>
              moveNoteId(current.length ? current : baseIds, draggedId, targetId)
            );
          }}
          onDrop={() => {
            droppedRef.current = true;
            setDraggedId(null);
            commitReorder(activeIds);
          }}
          onDragEnd={() => {
            if (!droppedRef.current) {
              setOrderedIds([]);
            }

            setDraggedId(null);
          }}
        />
      ))}
    </div>
  );
}
