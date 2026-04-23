import { apiClient } from '@/lib/api-client';
import type {
  CreateNoteInput,
  Note,
  ReorderNotesInput,
  UpdateNoteInput,
} from './types';

export function getNotes(): Promise<Note[]> {
  return apiClient<Note[]>('/notes', {
    method: 'GET',
  });
}

export function createNote(input: CreateNoteInput): Promise<Note> {
  return apiClient<Note>('/notes', {
    method: 'POST',
    body: input,
  });
}

export function updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
  return apiClient<Note>(`/notes/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export function deleteNote(id: string): Promise<null> {
  return apiClient<null>(`/notes/${id}`, {
    method: 'DELETE',
  });
}

export function reorderNotes(input: ReorderNotesInput): Promise<Note[]> {
  return apiClient<Note[]>('/notes/reorder', {
    method: 'PATCH',
    body: input,
  });
}
