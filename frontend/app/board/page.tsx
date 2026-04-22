'use client';

import { useDeferredValue, useState } from 'react';
import { ActivityFeed } from '@/components/activity/activity-feed';
import { BoardHeader } from '@/components/board/board-header';
import { DeleteNoteDialog } from '@/components/board/delete-note-dialog';
import { EmptyState } from '@/components/notes/empty-state';
import { InlineNoteForm } from '@/components/notes/inline-note-form';
import { NoteFormDialog } from '@/components/notes/note-form-dialog';
import { NotesGrid } from '@/components/notes/notes-grid';
import { NotesSkeleton } from '@/components/notes/notes-skeleton';
import { LoginForm } from '@/components/auth/login-form';
import { useActivities } from '@/features/activity/hooks';
import { ACTIVITY_FEED_FETCH_LIMIT } from '@/features/activity/query-keys';
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useReorderNotes,
  useUpdateNote,
} from '@/features/notes/hooks';
import type { Note } from '@/features/notes/types';
import type { NoteFormValues } from '@/features/notes/schema';
import { useNotesRealtime } from '@/features/notes/use-notes-realtime';
import { useAuth } from '@/components/providers/auth-provider';

export default function BoardPage() {
  const { user, loading, signOut } = useAuth();
  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    isError: isActivitiesError,
    error: activitiesError,
    refetch: refetchActivities,
  } = useActivities(Boolean(user), ACTIVITY_FEED_FETCH_LIMIT);
  const { data: notes = [], isLoading, isError, error, refetch } = useNotes(
    Boolean(user)
  );
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const reorderMutation = useReorderNotes();

  const [open, setOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notePendingDelete, setNotePendingDelete] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const socketError = useNotesRealtime(user);

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

  const handleDeleteRequest = (id: string) => {
    const targetNote = notes.find((note) => note.id === id);

    if (!targetNote) {
      return;
    }

    setNotePendingDelete(targetNote);
  };

  const handleDeleteConfirm = async () => {
    if (!notePendingDelete) {
      return;
    }

    try {
      setDeletingId(notePendingDelete.id);
      await deleteMutation.mutateAsync(notePendingDelete.id);
      setNotePendingDelete(null);
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

  const normalizedSearch = deferredSearchQuery.trim().toLowerCase();
  const filteredNotes = notes.filter((note) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      note.title.toLowerCase().includes(normalizedSearch) ||
      note.content.toLowerCase().includes(normalizedSearch)
    );
  });
  const isFiltering = normalizedSearch.length > 0;
  const emptyStateCard =
    filteredNotes.length === 0 ? (
      <EmptyState
        title={isFiltering ? 'No matching notes' : 'No notes yet'}
        description={
          isFiltering
            ? 'Try another title or content keyword to widen the results.'
            : 'Create the first shared note using the card beside it.'
        }
      />
    ) : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f3ee _0%,#e6e2dd_28%,#e6e2dd_48%,#e6e2dd_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <BoardHeader
          filteredCount={filteredNotes.length}
          isFiltering={isFiltering}
          isLoadingNotes={isLoading}
          isNotesError={isError}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          userEmail={user.email}
          userDisplayName={user.displayName}
          isSigningOut={isSigningOut}
          onSignOut={handleSignOut}
        />

        {socketError && (
          <div className="mb-6 rounded-[28px] border border-amber-200/80 bg-amber-50/90 p-4 shadow-[0_16px_30px_-26px_rgba(245,158,11,0.65)] backdrop-blur-sm">
            <p className="text-sm text-amber-900">
              Realtime connection failed: {socketError}
            </p>
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section>
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
                trailingCard={emptyStateCard}
                notes={filteredNotes}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onReorder={handleReorder}
                deletingId={deletingId}
                isReordering={reorderMutation.isPending || isFiltering}
              />
            )}
          </section>

          <ActivityFeed
            activities={activities}
            isLoading={isActivitiesLoading}
            isError={isActivitiesError}
            error={activitiesError}
            onRetry={() => {
              void refetchActivities();
            }}
          />
        </div>
      </div>

      <NoteFormDialog
        open={open}
        onOpenChange={setOpen}
        note={selectedNote}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />

      <DeleteNoteDialog
        note={notePendingDelete}
        isDeleting={deleteMutation.isPending}
        onCancel={() => setNotePendingDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </main>
  );
}
