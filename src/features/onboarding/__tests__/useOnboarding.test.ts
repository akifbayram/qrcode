import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', username: 'testuser', displayName: 'Test', email: null, avatarUrl: null, createdAt: '', updatedAt: '' },
  })),
}));

import { useAuth } from '@/lib/auth';
import { useOnboarding, isFirstScanDone, markFirstScanDone } from '../useOnboarding';

const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: { id: 'user-1', username: 'testuser', displayName: 'Test', email: null, avatarUrl: null, createdAt: '', updatedAt: '' },
  } as ReturnType<typeof useAuth>);
});

describe('useOnboarding', () => {
  it('returns initial state when no localStorage data', () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isOnboarding).toBe(true);
    expect(result.current.step).toBe(0);
    expect(result.current.locationId).toBeUndefined();
  });

  it('reads existing state from localStorage', () => {
    localStorage.setItem(
      'sanduk-onboarding-user-1',
      JSON.stringify({ completed: false, step: 1, locationId: 'loc-1' }),
    );

    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isOnboarding).toBe(true);
    expect(result.current.step).toBe(1);
    expect(result.current.locationId).toBe('loc-1');
  });

  it('advanceWithLocation increments step and stores locationId', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.advanceWithLocation('loc-new');
    });

    expect(result.current.step).toBe(1);
    expect(result.current.locationId).toBe('loc-new');

    const stored = JSON.parse(localStorage.getItem('sanduk-onboarding-user-1')!);
    expect(stored.step).toBe(1);
    expect(stored.locationId).toBe('loc-new');
  });

  it('complete sets completed and persists', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => {
      result.current.complete();
    });

    expect(result.current.isOnboarding).toBe(false);

    const stored = JSON.parse(localStorage.getItem('sanduk-onboarding-user-1')!);
    expect(stored.completed).toBe(true);
  });
});

describe('isFirstScanDone', () => {
  it('returns false when not set', () => {
    expect(isFirstScanDone('user-1')).toBe(false);
  });

  it('returns true when set to "1"', () => {
    localStorage.setItem('sanduk-first-scan-done-user-1', '1');

    expect(isFirstScanDone('user-1')).toBe(true);
  });
});

describe('markFirstScanDone', () => {
  it('sets localStorage key', () => {
    markFirstScanDone('user-1');

    expect(localStorage.getItem('sanduk-first-scan-done-user-1')).toBe('1');
  });
});
