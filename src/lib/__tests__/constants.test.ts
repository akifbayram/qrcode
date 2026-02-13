import { describe, it, expect } from 'vitest';
import { getBinUrl } from '@/lib/constants';

describe('getBinUrl', () => {
  it('returns correct URL with origin and binId', () => {
    const url = getBinUrl('abc-123');
    expect(url).toBe(`${window.location.origin}/bin/abc-123`);
  });

  it('handles different binId formats', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const url = getBinUrl(uuid);
    expect(url).toContain('/bin/');
    expect(url).toContain(uuid);
    expect(url).toBe(`${window.location.origin}/bin/${uuid}`);
  });
});
