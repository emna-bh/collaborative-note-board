'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteSchema, type NoteFormValues } from '@/features/notes/schema';
import {
  DEFAULT_NOTE_COLOR,
  getNoteChromeStyle,
  getNoteColorLabel,
  getNoteGlowStyle,
  getNoteSurfaceStyle,
} from '@/features/notes/colors';
import { NoteColorPicker } from './note-color-picker';

type Props = {
  onSubmit: (values: NoteFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
};

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 stroke-current"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 4.5v11" />
      <path d="M4.5 10h11" />
    </svg>
  );
}

export function InlineNoteForm({ onSubmit, isSubmitting }: Props) {
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
  const surfaceStyle = getNoteSurfaceStyle(selectedColor);
  const chromeStyle = getNoteChromeStyle(selectedColor);
  const subtleChromeStyle = getNoteChromeStyle(selectedColor, 0.5);

  const handleSubmit = async (values: NoteFormValues) => {
    await onSubmit(values);
    form.reset({
      title: '',
      content: '',
      color: DEFAULT_NOTE_COLOR,
    });
  };

  return (
    <div
      className="relative h-full min-h-[17.5rem] overflow-hidden rounded-[28px] border p-3 text-slate-800"
      style={surfaceStyle}
    >
      <div
        className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 opacity-90 blur-3xl"
        style={getNoteGlowStyle(selectedColor)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.44),transparent_52%,rgba(255,255,255,0.12))]" />

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="relative flex h-full flex-col"
      >
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full border text-slate-700"
            style={chromeStyle}
          >
            <PlusIcon />
          </span>
        </div>

        <div
          className="absolute right-3 top-3 z-10 rounded-full border px-3 py-1.5 text-[8px] tracking-[0.18em] text-slate-600"
          style={subtleChromeStyle}
        >
          Markdown
        </div>

        <div className="flex flex-1 flex-col rounded-[24px] border border-white/50 bg-white/48 p-4 pt-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-sm">
          <input
            {...form.register('title')}
            placeholder="Title"
            className="w-full border-none bg-transparent p-0 text-lg font-semibold tracking-[-0.025em] text-slate-900 outline-none placeholder:text-slate-500"
          />
          {form.formState.errors.title && (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.title.message}
            </p>
          )}

          <textarea
            {...form.register('content')}
            rows={3}
            placeholder="Write in markdown..."
            className="mt-3 min-h-[4.25rem] flex-1 resize-none border-none bg-transparent p-0 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-500"
          />
          {form.formState.errors.content && (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.content.message}
            </p>
          )}

          <div className="mt-3">
            <NoteColorPicker
              value={selectedColor}
              onChange={(color) =>
                form.setValue('color', color, { shouldValidate: true })
              }
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full border border-slate-900/10 bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_20px_28px_-18px_rgba(15,23,42,0.85)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create note'}
          </button>
        </div>
      </form>
    </div>
  );
}
