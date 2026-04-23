import type { NoteColor } from './colors';

export type Note = {
  id: string;
  title: string;
  content: string;
  color: NoteColor | null;
  creatorId: string;
  creatorEmail?: string | null;
  creatorName?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
  color: NoteColor;
};

export type UpdateNoteInput = {
  title: string;
  content: string;
  color: NoteColor;
};

export type ReorderNotesInput = {
  noteIds: string[];
};

export type NoteOrderUpdate = Pick<Note, 'id' | 'position' | 'updatedAt'>;
