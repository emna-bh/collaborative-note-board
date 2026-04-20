import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  content: z.string().trim().max(5000),
});

export type NoteFormValues = z.infer<typeof noteSchema>;