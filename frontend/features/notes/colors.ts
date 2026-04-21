import type { CSSProperties } from 'react';

export const NOTE_COLOR_VALUES = [
  '#F6D9E0',
  '#F8E2D3',
  '#F4ECC8',
  '#DDEAD7',
  '#DCEAF6',
  '#E7E0F5',
] as const;

export type NoteColor = (typeof NOTE_COLOR_VALUES)[number];

export const DEFAULT_NOTE_COLOR: NoteColor = NOTE_COLOR_VALUES[0];

export const NOTE_COLOR_OPTIONS = [
  { label: 'Rose', value: NOTE_COLOR_VALUES[0] },
  { label: 'Peach', value: NOTE_COLOR_VALUES[1] },
  { label: 'Butter', value: NOTE_COLOR_VALUES[2] },
  { label: 'Sage', value: NOTE_COLOR_VALUES[3] },
  { label: 'Sky', value: NOTE_COLOR_VALUES[4] },
  { label: 'Lavender', value: NOTE_COLOR_VALUES[5] },
] as const;

export function getNoteColorLabel(color: string | null | undefined): string {
  return (
    NOTE_COLOR_OPTIONS.find((option) => option.value === color)?.label ??
    'Custom'
  );
}

export function resolveNoteColor(color: string | null | undefined): NoteColor {
  return (
    NOTE_COLOR_OPTIONS.find((option) => option.value === color)?.value ??
    DEFAULT_NOTE_COLOR
  );
}

function hexToRgb(color: string) {
  const normalized = color.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function withAlpha(color: string, alpha: number) {
  const { r, g, b } = hexToRgb(color);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getNoteSurfaceStyle(
  color: string | null | undefined
): CSSProperties {
  const resolvedColor = resolveNoteColor(color);

  return {
    backgroundColor: resolvedColor,
    backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.14) 42%, rgba(255, 255, 255, 0.05) 100%)',
    borderColor: withAlpha(resolvedColor, 0.82),
    boxShadow: `0 26px 55px -34px ${withAlpha(resolvedColor, 0.92)}, 0 16px 28px -26px rgba(15, 23, 42, 0.55)`,
  };
}

export function getNoteChromeStyle(
  color: string | null | undefined,
  alpha = 0.62
): CSSProperties {
  const resolvedColor = resolveNoteColor(color);

  return {
    backgroundColor: withAlpha('#FFFFFF', alpha),
    borderColor: withAlpha(resolvedColor, 0.78),
    boxShadow: `0 10px 24px -18px ${withAlpha(resolvedColor, 0.72)}`,
  };
}

export function getNoteGlowStyle(
  color: string | null | undefined
): CSSProperties {
  const resolvedColor = resolveNoteColor(color);

  return {
    background: `radial-gradient(circle, ${withAlpha(resolvedColor, 0.6)} 0%, ${withAlpha(resolvedColor, 0)} 74%)`,
  };
}
