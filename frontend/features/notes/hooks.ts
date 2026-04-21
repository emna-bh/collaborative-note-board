'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNote,
  deleteNote,
  getNotes,
  reorderNotes,
  updateNote,
} from './api';
import { notesKeys } from './query-keys';
import type {
  CreateNoteInput,
  Note,
  ReorderNotesInput,
  UpdateNoteInput,
} from './types';
import { applyOrderedIds, sortNotesByPosition } from './utils';

export function useNotes(enabled = true) {
  return useQuery({
    queryKey: notesKeys.all,
    queryFn: getNotes,
    enabled,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.all });

      const previousNotes =
        queryClient.getQueryData<Note[]>(notesKeys.all) || [];

      const optimisticNote: Note = {
        id: `temp-${Date.now()}`,
        title: input.title,
        content: input.content,
        color: input.color,
        creatorId: 'current-user',
        position: previousNotes.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Note[]>(
        notesKeys.all,
        sortNotesByPosition([...previousNotes, optimisticNote])
      );

      return { previousNotes };
    },
    onError: (_error, _input, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.all, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateNoteInput;
    }) => updateNote(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.all });

      const previousNotes =
        queryClient.getQueryData<Note[]>(notesKeys.all) || [];

      queryClient.setQueryData<Note[]>(notesKeys.all, (old = []) =>
        sortNotesByPosition(
          old.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...input,
                  updatedAt: new Date().toISOString(),
                }
              : note
          )
        )
      );

      return { previousNotes };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.all, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.all });

      const previousNotes =
        queryClient.getQueryData<Note[]>(notesKeys.all) || [];

      queryClient.setQueryData<Note[]>(notesKeys.all, (old = []) =>
        old.filter((note) => note.id !== id)
      );

      return { previousNotes };
    },
    onError: (_error, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.all, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

export function useReorderNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReorderNotesInput) => reorderNotes(input),
    onMutate: async ({ noteIds }) => {
      await queryClient.cancelQueries({ queryKey: notesKeys.all });

      const previousNotes =
        queryClient.getQueryData<Note[]>(notesKeys.all) || [];
      const updatedAt = new Date().toISOString();

      queryClient.setQueryData<Note[]>(
        notesKeys.all,
        applyOrderedIds(previousNotes, noteIds, updatedAt)
      );

      return { previousNotes };
    },
    onError: (_error, _input, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(notesKeys.all, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}
