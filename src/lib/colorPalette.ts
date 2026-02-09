export interface ColorPreset {
  key: string;
  label: string;
  bg: string;
  bgDark: string;
  dot: string;
}

export const COLOR_PALETTE: ColorPreset[] = [
  { key: 'red',    label: 'Red',    bg: '#FCA5A5', bgDark: '#B91C1C', dot: '#EF4444' },
  { key: 'orange', label: 'Orange', bg: '#FDBA74', bgDark: '#C2410C', dot: '#F97316' },
  { key: 'amber',  label: 'Amber',  bg: '#FCD34D', bgDark: '#B45309', dot: '#F59E0B' },
  { key: 'lime',   label: 'Lime',   bg: '#BEF264', bgDark: '#4D7C0F', dot: '#84CC16' },
  { key: 'green',  label: 'Green',  bg: '#86EFAC', bgDark: '#15803D', dot: '#22C55E' },
  { key: 'teal',   label: 'Teal',   bg: '#5EEAD4', bgDark: '#0F766E', dot: '#14B8A6' },
  { key: 'cyan',   label: 'Cyan',   bg: '#67E8F9', bgDark: '#0E7490', dot: '#06B6D4' },
  { key: 'sky',    label: 'Sky',    bg: '#7DD3FC', bgDark: '#0369A1', dot: '#0EA5E9' },
  { key: 'blue',   label: 'Blue',   bg: '#93C5FD', bgDark: '#1D4ED8', dot: '#3B82F6' },
  { key: 'indigo', label: 'Indigo', bg: '#A5B4FC', bgDark: '#4338CA', dot: '#6366F1' },
  { key: 'purple', label: 'Purple', bg: '#C4B5FD', bgDark: '#7E22CE', dot: '#A855F7' },
  { key: 'rose',   label: 'Rose',   bg: '#FDA4AF', bgDark: '#BE123C', dot: '#F43F5E' },
  { key: 'pink',   label: 'Pink',   bg: '#F9A8D4', bgDark: '#BE185D', dot: '#EC4899' },
  { key: 'gray',   label: 'Gray',   bg: '#D1D5DB', bgDark: '#374151', dot: '#6B7280' },
];

export function getColorPreset(key: string): ColorPreset | undefined {
  return COLOR_PALETTE.find((c) => c.key === key);
}
