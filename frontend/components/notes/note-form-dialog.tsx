'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteSchema, type NoteFormValues } from '@/features/notes/schema';
import type { Note } from '@/features/notes/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSubmit: (values: NoteFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function NoteFormDialog({
  open,
  onOpenChange,
  note,
  onSubmit,
  isSubmitting,
}: Props) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (!note) return;

    form.reset({
      title: note.title,
      content: note.content,
    });
  }, [note, form]);

  const handleSubmit = async (values: NoteFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
          <DialogDescription>
            Update the selected note.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              {...form.register('title')}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <textarea
              {...form.register('content')}
              rows={6}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
            {form.formState.errors.content && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}