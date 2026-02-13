import { describe, it, expect } from 'vitest';
import { getColorPreset, COLOR_PALETTE } from '@/lib/colorPalette';

describe('colorPalette', () => {
  it('getColorPreset returns the blue preset with correct fields', () => {
    const blue = getColorPreset('blue');
    expect(blue).toBeDefined();
    expect(blue!.key).toBe('blue');
    expect(blue!.label).toBe('Blue');
    expect(blue!.bg).toBe('#93C5FD');
    expect(blue!.bgDark).toBe('#1D4ED8');
    expect(blue!.dot).toBe('#3B82F6');
  });

  it('getColorPreset returns undefined for nonexistent key', () => {
    expect(getColorPreset('nonexistent')).toBeUndefined();
  });

  it('getColorPreset returns undefined for empty string', () => {
    expect(getColorPreset('')).toBeUndefined();
  });

  it('COLOR_PALETTE has 14 entries', () => {
    expect(COLOR_PALETTE).toHaveLength(14);
  });

  it('every preset has required fields', () => {
    for (const preset of COLOR_PALETTE) {
      expect(preset.key).toBeTruthy();
      expect(preset.label).toBeTruthy();
      expect(preset.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.bgDark).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.dot).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
