'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/notes/empty-state';
import { InlineNoteForm } from '@/components/notes/inline-note-form';
import { NoteFormDialog } from '@/components/notes/note-form-dialog';
import { NotesGrid } from '@/components/notes/notes-grid';
import { NotesSkeleton } from '@/components/notes/notes-skeleton';
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from '@/features/notes/hooks';
import { notesKeys } from '@/features/notes/query-keys';
import type { Note } from '@/features/notes/types';
import type { NoteFormValues } from '@/features/notes/schema';
import { socket } from '@/lib/socket';

export default function BoardPage() {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, isError, error, refetch } = useNotes();
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    socket.connect();

    const handleCreated = (note: Note) => {
      queryClient.setQueryData<Note[]>(notesKeys.all, (old = []) => {
        const exists = old.some((item) => item.id === note.id);
        if (exists) return old;
        return [note, ...old.filter((item) => !item.id.startsWith('temp-'))];
      });
    };

    const handleUpdated = (updatedNote: Note) => {
      queryClient.setQueryData<Note[]>(notesKeys.all, (old = []) =>
        old.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
    };

    const handleDeleted = ({ id }: { id: string }) => {
      queryClient.setQueryData<Note[]>(notesKeys.all, (old = []) =>
        old.filter((note) => note.id !== id)
      );
    };

    socket.on('note.created', handleCreated);
    socket.on('note.updated', handleUpdated);
    socket.on('note.deleted', handleDeleted);

    return () => {
      socket.off('note.created', handleCreated);
      socket.off('note.updated', handleUpdated);
      socket.off('note.deleted', handleDeleted);
      socket.disconnect();
    };
  }, [queryClient]);

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async (values: NoteFormValues) => {
    await createMutation.mutateAsync(values);
  };

  const handleUpdate = async (values: NoteFormValues) => {
    if (!selectedNote) return;

    await updateMutation.mutateAsync({
      id: selectedNote.id,
      input: values,
    });

    setOpen(false);
    setSelectedNote(null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Shared Notes Board</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create, edit and collaborate on notes in real time.
        </p>
      </div>

      <div className="mb-6">
        <InlineNoteForm
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      </div>

      {isLoading && <NotesSkeleton />}

      {isError && (
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to load notes'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg border px-4 py-2 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && notes.length === 0 && <EmptyState />}

      {!isLoading && !isError && notes.length > 0 && (
        <NotesGrid
          notes={notes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}

      <NoteFormDialog
        open={open}
        onOpenChange={setOpen}
        note={selectedNote}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />
    </main>
  );
}