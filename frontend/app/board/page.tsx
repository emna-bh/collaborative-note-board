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
  useReorderNotes,
  useUpdateNote,
} from '@/features/notes/hooks';
import { notesKeys } from '@/features/notes/query-keys';
import type { Note, NoteOrderUpdate } from '@/features/notes/types';
import type { NoteFormValues } from '@/features/notes/schema';
import { applyOrderUpdates, sortNotesByPosition } from '@/features/notes/utils';
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
  const reorderMutation = useReorderNotes();

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
      queryClient.setQueryData<Note[]>(
        notesKeys.all,
        (old = []) => {
          const nextNotes = old.filter(
            (item) => item.id !== note.id && !item.id.startsWith('temp-')
          );

          return sortNotesByPosition([...nextNotes, note]);
        }
      );
    };

    const handleUpdated = (updatedNote: Note) => {
      queryClient.setQueryData<Note[]>(
        notesKeys.all,
        (old = []) =>
          sortNotesByPosition(
            old.map((note) => (note.id === updatedNote.id ? updatedNote : note))
          )
      );
    };

    const handleDeleted = ({ id }: { id: string }) => {
      queryClient.setQueryData<Note[]>(notesKeys.all, (old = []) =>
        old.filter((note) => note.id !== id)
      );
    };

    const handleReordered = (updates: NoteOrderUpdate[]) => {
      queryClient.setQueryData<Note[]>(
        notesKeys.all,
        (old = []) => applyOrderUpdates(old, updates)
      );
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('note.created', handleCreated);
    socket.on('note.updated', handleUpdated);
    socket.on('note.deleted', handleDeleted);
    socket.on('notes.reordered', handleReordered);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('note.created', handleCreated);
      socket.off('note.updated', handleUpdated);
      socket.off('note.deleted', handleDeleted);
      socket.off('notes.reordered', handleReordered);
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

  const handleReorder = async (noteIds: string[]) => {
    await reorderMutation.mutateAsync({ noteIds });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7efe8_0%,#f8f3ec_28%,#f6f3ee_48%,#f5f7fb_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              Collaborative board
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
              Shared Notes Board
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Create, edit and collaborate on notes in real time with a softer,
              more tactile board layout.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="rounded-full border border-white/75 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_16px_28px_-22px_rgba(15,23,42,0.45)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
          >
            {isSigningOut ? 'Signing out...' : 'Logout'}
          </button>
        </div>

        {socketError && (
          <div className="mb-6 rounded-[28px] border border-amber-200/80 bg-amber-50/90 p-4 shadow-[0_16px_30px_-26px_rgba(245,158,11,0.65)] backdrop-blur-sm">
            <p className="text-sm text-amber-900">
              Realtime connection failed: {socketError}
            </p>
          </div>
        )}

        {isLoading && <NotesSkeleton />}

        {isError && (
          <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <InlineNoteForm
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
            />

            <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              <p className="text-sm text-red-600">
                {error instanceof Error ? error.message : 'Failed to load notes'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <NotesGrid
            leadingCard={
              <InlineNoteForm
                onSubmit={handleCreate}
                isSubmitting={createMutation.isPending}
              />
            }
            notes={notes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
            deletingId={deletingId}
            isReordering={reorderMutation.isPending}
          />
        )}

        {!isLoading && !isError && notes.length === 0 && (
          <div className="mt-5">
            <EmptyState />
          </div>
        )}
      </div>

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
