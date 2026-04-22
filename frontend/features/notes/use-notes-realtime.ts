'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notesKeys } from './query-keys';
import type { Note, NoteOrderUpdate } from './types';
import { applyOrderUpdates, sortNotesByPosition } from './utils';
import { socket } from '@/lib/socket';

type RealtimeUser = {
  uid: string;
} | null;

export function useNotesRealtime(user: RealtimeUser) {
  const queryClient = useQueryClient();
  const [socketError, setSocketError] = useState('');

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

    socket.connect();
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

  return socketError;
}
