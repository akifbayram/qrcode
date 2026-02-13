import { describe, it, expect, beforeEach } from 'vitest';
import { getScanHistory, recordScan } from '../scanHistory';

beforeEach(() => {
  localStorage.clear();
});

describe('getScanHistory', () => {
  it('returns empty array when no data', () => {
    expect(getScanHistory('user-1')).toEqual([]);
  });

  it('returns parsed entries from localStorage', () => {
    const entries = [
      { binId: 'bin-1', scannedAt: '2025-01-01T00:00:00.000Z' },
      { binId: 'bin-2', scannedAt: '2025-01-02T00:00:00.000Z' },
    ];
    localStorage.setItem('sanduk-scan-history-user-1', JSON.stringify(entries));

    expect(getScanHistory('user-1')).toEqual(entries);
  });

  it('returns empty array on corrupt JSON', () => {
    localStorage.setItem('sanduk-scan-history-user-1', '{not valid json');

    expect(getScanHistory('user-1')).toEqual([]);
  });
});

describe('recordScan', () => {
  it('adds entry to front of history', () => {
    recordScan('user-1', 'bin-1');
    const history = getScanHistory('user-1');

    expect(history).toHaveLength(1);
    expect(history[0].binId).toBe('bin-1');
  });

  it('deduplicates by moving existing binId to front', () => {
    recordScan('user-1', 'bin-1');
    recordScan('user-1', 'bin-2');
    recordScan('user-1', 'bin-1'); // should move to front, not duplicate

    const history = getScanHistory('user-1');

    expect(history).toHaveLength(2);
    expect(history[0].binId).toBe('bin-1');
    expect(history[1].binId).toBe('bin-2');
  });

  it('caps at 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      recordScan('user-1', `bin-${i}`);
    }

    const history = getScanHistory('user-1');

    expect(history).toHaveLength(20);
    // Most recent should be first
    expect(history[0].binId).toBe('bin-24');
  });

  it('stores ISO timestamp', () => {
    recordScan('user-1', 'bin-1');
    const history = getScanHistory('user-1');

    expect(history[0].scannedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });
});
