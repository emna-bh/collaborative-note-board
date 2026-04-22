export const NOTE_COLORS = [
  '#F6D9E0',
  '#F8E2D3',
  '#F4ECC8',
  '#DDEAD7',
  '#DCEAF6',
  '#E7E0F5',
] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];
