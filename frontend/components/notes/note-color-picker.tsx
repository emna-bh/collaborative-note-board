'use client';

import {
  getNoteChromeStyle,
  NOTE_COLOR_OPTIONS,
  type NoteColor,
} from '@/features/notes/colors';

type Props = {
  value: NoteColor;
  onChange: (value: NoteColor) => void;
  disabled?: boolean;
};

export function NoteColorPicker({ value, onChange, disabled }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Palette
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {NOTE_COLOR_OPTIONS.map((option) => {
          const isSelected = option.value === value;
          const chromeStyle = getNoteChromeStyle(option.value, 0.84);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              aria-label={`Select ${option.label}`}
              title={option.label}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition duration-200 ${
                isSelected ? 'scale-110' : 'hover:-translate-y-0.5'
              } disabled:opacity-50`}
              style={{
                ...chromeStyle,
                backgroundColor: option.value,
                boxShadow: isSelected
                  ? `${chromeStyle.boxShadow}, inset 0 0 0 3px rgba(145, 143, 143, 0.35)`
                  : chromeStyle.boxShadow,
              }}
            >
              
            </button>
          );
        })}
      </div>
    </div>
  );
}
