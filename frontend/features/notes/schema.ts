import { z } from 'zod';
import { NOTE_COLOR_VALUES } from './colors';

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  content: z.string().trim().max(5000),
  color: z.enum(NOTE_COLOR_VALUES),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
