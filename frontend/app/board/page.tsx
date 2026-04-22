'use client';

import { useDeferredValue, useEffect, useRef, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.2 13.2 16 16" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.5 4.5h1.2c.99 0 1.8.81 1.8 1.8v7.4c0 .99-.81 1.8-1.8 1.8h-1.2" />
      <path d="M8 10h8" />
      <path d="m12.7 6.3 3.7 3.7-3.7 3.7" />
      <path d="M10 4.5H6.3c-.99 0-1.8.81-1.8 1.8v7.4c0 .99.81 1.8 1.8 1.8H10" />
    </svg>
  );
}

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
  const [notePendingDelete, setNotePendingDelete] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [socketError, setSocketError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAccountMenuOpen]);

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
      setIsAccountMenuOpen(false);
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
  const userLabel = user.displayName || user.email || 'User';
  const userInitial = userLabel.trim().charAt(0).toUpperCase() || 'U';
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
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)] backdrop-blur-sm">
              Collaborative board
            </div>
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
              <h1 className="min-w-0 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                Shared Notes Board
              </h1>

              {!isLoading && !isError && (
                <div className="flex w-full flex-wrap items-center gap-2 lg:max-w-xl lg:justify-end">
                  <label className="flex min-w-[16rem] flex-1 items-center gap-3 rounded-full border border-white/75 bg-white/82 px-4 py-2.5 text-sm text-slate-600 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.25)] backdrop-blur-sm">
                    <SearchIcon />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by title or content"
                      className="w-full min-w-0 border-none bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </label>

                  <span className="rounded-full border border-white/75 bg-white/72 px-3 py-1.5 text-xs font-medium text-slate-500">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                  </span>
                  {isFiltering && (
                    <span className="rounded-full border border-white/75 bg-white/72 px-3 py-1.5 text-xs font-medium text-slate-500">
                      Reorder paused while filtering
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Create, edit and collaborate on notes in real time.
            </p>
          </div>

          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((open) => !open)}
              aria-label="Open account menu"
              aria-expanded={isAccountMenuOpen}
              title={userLabel}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(237,244,255,0.78))] text-sm font-semibold text-slate-700 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.4)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_34px_-24px_rgba(15,23,42,0.46)]"
            >
              {userInitial}
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.65rem)] z-20 w-56 overflow-hidden rounded-[22px] border border-white/85 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(236,244,255,0.86)_52%,rgba(245,247,251,0.92))] p-2.5 shadow-[0_0_34px_-14px_rgba(15,23,42,0.22),0_18px_28px_-20px_rgba(15,23,42,0.24)] backdrop-blur-xl">
                <div className="rounded-[18px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.64))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Connected as
                  </p>
                  <p className="mt-1.5 break-all text-sm font-medium leading-5 text-slate-700">
                    {user.email || 'No email available'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[16px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(245,247,251,0.74))] px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_14px_24px_-22px_rgba(15,23,42,0.38)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_26px_-22px_rgba(15,23,42,0.44)] disabled:opacity-50"
                >
                  <LogOutIcon />
                  <span>{isSigningOut ? 'Signing out...' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
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
            trailingCard={emptyStateCard}
            notes={filteredNotes}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onReorder={handleReorder}
            deletingId={deletingId}
            isReordering={reorderMutation.isPending || isFiltering}
          />
        )}
      </div>

      <NoteFormDialog
        open={open}
        onOpenChange={setOpen}
        note={selectedNote}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />

      <Dialog
        open={Boolean(notePendingDelete)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleteMutation.isPending) {
            setNotePendingDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-md border-white/85 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(244,247,252,0.9))] shadow-[0_0_34px_-14px_rgba(15,23,42,0.22),0_22px_34px_-24px_rgba(15,23,42,0.26)]">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Delete note?</DialogTitle>
            <DialogDescription className="text-slate-600">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {notePendingDelete && (
            <div className="mt-4 rounded-[20px] border border-white/80 bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Note
              </p>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-700">
                {notePendingDelete.title}
              </p>
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNotePendingDelete(null)}
              disabled={deleteMutation.isPending}
              className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_14px_22px_-22px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="rounded-full border border-red-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,237,240,0.86))] px-4 py-2 text-sm font-semibold text-rose-700 shadow-[0_16px_26px_-22px_rgba(244,63,94,0.42)] transition duration-200 hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete note'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
