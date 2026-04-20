'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteSchema, type NoteFormValues } from '@/features/notes/schema';

type Props = {
  onSubmit: (values: NoteFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

export function InlineNoteForm({ onSubmit, isSubmitting }: Props) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const handleSubmit = async (values: NoteFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <div>
          <input
            {...form.register('title')}
            placeholder="Note title"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <textarea
            {...form.register('content')}
            rows={4}
            placeholder="Write a note..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          />
          {form.formState.errors.content && (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create note'}
          </button>
        </div>
      </form>
    </div>
  );
}