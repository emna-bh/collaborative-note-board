'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ACTIVITY_FEED_FETCH_LIMIT,
  activitiesKeys,
} from '@/features/activity/query-keys';
import type { Activity } from '@/features/activity/types';
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
      void queryClient.invalidateQueries({ queryKey: notesKeys.all });
      void queryClient.invalidateQueries({ queryKey: activitiesKeys.all });
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

    const handleActivityCreated = (activity: Activity) => {
      queryClient.setQueriesData<Activity[]>(
        { queryKey: activitiesKeys.all },
        (old = []) => {
          const nextActivities = [
            activity,
            ...old.filter((item) => item.id !== activity.id),
          ];

          return nextActivities
            .sort(
              (left, right) =>
                new Date(right.createdAt).getTime() -
                new Date(left.createdAt).getTime()
            )
            .slice(0, ACTIVITY_FEED_FETCH_LIMIT);
        }
      );
    };

    socket.connect();
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('note.created', handleCreated);
    socket.on('note.updated', handleUpdated);
    socket.on('note.deleted', handleDeleted);
    socket.on('notes.reordered', handleReordered);
    socket.on('activity.created', handleActivityCreated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('note.created', handleCreated);
      socket.off('note.updated', handleUpdated);
      socket.off('note.deleted', handleDeleted);
      socket.off('notes.reordered', handleReordered);
      socket.off('activity.created', handleActivityCreated);
      socket.disconnect();
    };
  }, [queryClient, user]);

  return socketError;
}
