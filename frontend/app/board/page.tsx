'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/notes/empty-state';
import { InlineNoteForm } from '@/components/notes/inline-note-form';
import { NoteFormDialog } from '@/components/notes/note-form-dialog';
import { NotesGrid } from '@/components/notes/notes-grid';
import { NotesSkeleton } from '@/components/notes/notes-skeleton';
import { LoginForm } from '@/components/auth/login-form';
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
import { useAuth } from '@/components/providers/auth-provider';

export default function BoardPage() {
  const { user, loading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { data: notes = [], isLoading, isError, error, refetch } = useNotes(
    Boolean(user)
  );
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [socketError, setSocketError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!user) {
      socket.disconnect();
      return;
    }

    const handleConnect = () => {
      setSocketError('');
    };

    const handleConnectError = (error: Error) => {
      setSocketError(error.message || 'Realtime connection failed');
    };

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

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('note.created', handleCreated);
    socket.on('note.updated', handleUpdated);
    socket.on('note.deleted', handleDeleted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('note.created', handleCreated);
      socket.off('note.updated', handleUpdated);
      socket.off('note.deleted', handleDeleted);
      socket.disconnect();
    };
  }, [queryClient, user]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

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

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shared Notes Board</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create, edit and collaborate on notes in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {isSigningOut ? 'Signing out...' : 'Logout'}
        </button>
      </div>

      <div className="mb-6">
        <InlineNoteForm
          onSubmit={handleCreate}
          isSubmitting={createMutation.isPending}
        />
      </div>

      {socketError && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Realtime connection failed: {socketError}
          </p>
        </div>
      )}

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
