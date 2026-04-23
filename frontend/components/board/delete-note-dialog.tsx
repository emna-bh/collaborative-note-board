'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Note } from '@/features/notes/types';

type Props = {
  note: Note | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export function DeleteNoteDialog({
  note,
  isDeleting,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={Boolean(note)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isDeleting) {
          onCancel();
        }
      }}
    >
      <DialogContent className="max-w-md border-white/85 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(244,247,252,0.9))] shadow-[0_0_34px_-14px_rgba(15,23,42,0.22),0_22px_34px_-24px_rgba(15,23,42,0.26)]">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Delete note?</DialogTitle>
          <DialogDescription className="text-slate-600">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {note && (
          <div className="mt-4 rounded-[20px] border border-white/80 bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Note
            </p>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-700">
              {note.title}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_14px_22px_-22px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-full border border-red-200/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,237,240,0.86))] px-4 py-2 text-sm font-semibold text-rose-700 shadow-[0_16px_26px_-22px_rgba(244,63,94,0.42)] transition duration-200 hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete note'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
