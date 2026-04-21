import type { Note, NoteOrderUpdate } from './types';

export function sortNotesByPosition(notes: Note[]): Note[] {
  return [...notes].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

export function moveNoteId(
  noteIds: string[],
  sourceId: string,
  targetId: string,
): string[] {
  const nextIds = [...noteIds];
  const sourceIndex = nextIds.indexOf(sourceId);
  const targetIndex = nextIds.indexOf(targetId);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return nextIds;
  }

  nextIds.splice(sourceIndex, 1);
  nextIds.splice(targetIndex, 0, sourceId);

  return nextIds;
}

export function applyOrderedIds(
  notes: Note[],
  noteIds: string[],
  updatedAt: string,
): Note[] {
  const noteMap = new Map(notes.map((note) => [note.id, note]));
  const uniqueIds = new Set(noteIds);

  if (
    uniqueIds.size !== noteIds.length ||
    noteIds.length !== notes.length ||
    noteIds.some((noteId) => !noteMap.has(noteId))
  ) {
    return sortNotesByPosition(notes);
  }

  return noteIds.map((noteId, index) => ({
    ...noteMap.get(noteId)!,
    position: index,
    updatedAt,
  }));
}

export function applyOrderUpdates(
  notes: Note[],
  updates: NoteOrderUpdate[],
): Note[] {
  const updateMap = new Map(updates.map((update) => [update.id, update]));

  return sortNotesByPosition(
    notes.map((note) => ({
      ...note,
      ...(updateMap.get(note.id) ?? {}),
    })),
  );
}
