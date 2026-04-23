'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteSchema, type NoteFormValues } from '@/features/notes/schema';
import type { Note } from '@/features/notes/types';
import {
  DEFAULT_NOTE_COLOR,
  getNoteChromeStyle,
  getNoteColorLabel,
} from '@/features/notes/colors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoteColorPicker } from './note-color-picker';

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
      color: DEFAULT_NOTE_COLOR,
    },
  });
  const selectedColor = useWatch({
    control: form.control,
    name: 'color',
  });
  const chromeStyle = getNoteChromeStyle(selectedColor);

  useEffect(() => {
    if (!note) return;

    form.reset({
      title: note.title,
      content: note.content,
      color: note.color ?? DEFAULT_NOTE_COLOR,
    });
  }, [note, form]);

  const handleSubmit = async (values: NoteFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/80 bg-white/90 shadow-[0_34px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
          <DialogDescription>
            Update the selected note.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            <span className="rounded-full border px-3 py-1.5" style={chromeStyle}>
              Editing
            </span>
            <span className="rounded-full border px-3 py-1.5" style={chromeStyle}>
              {getNoteColorLabel(selectedColor)}
            </span>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">Title</label>
            <input
              {...form.register('title')}
              className="w-full rounded-[18px] border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition duration-200 focus:border-slate-300"
            />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">Content</label>
            <textarea
              {...form.register('content')}
              rows={6}
              className="w-full rounded-[22px] border border-slate-200 bg-white/85 px-4 py-3 text-sm leading-6 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition duration-200 focus:border-slate-300"
            />
            <p className="mt-1 text-xs text-slate-500">Markdown supported</p>
            {form.formState.errors.content && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <NoteColorPicker
            value={selectedColor}
            onChange={(color) =>
              form.setValue('color', color, { shouldValidate: true })
            }
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full border border-slate-900/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_24px_-18px_rgba(15,23,42,0.75)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
