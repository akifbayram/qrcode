import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppSettings } from '@/lib/appSettings';

describe('useAppSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing stored in localStorage', () => {
    const { result } = renderHook(() => useAppSettings());
    expect(result.current.settings).toEqual({
      appName: 'Sanduk',
    });
  });

  it('reads stored settings from localStorage', () => {
    localStorage.setItem(
      'sanduk-app-name',
      JSON.stringify({ appName: 'Custom' })
    );

    const { result } = renderHook(() => useAppSettings());
    expect(result.current.settings.appName).toBe('Custom');
  });

  it('handles corrupt JSON gracefully and returns defaults', () => {
    localStorage.setItem('sanduk-app-name', '{bad json!!!');

    const { result } = renderHook(() => useAppSettings());
    expect(result.current.settings).toEqual({
      appName: 'Sanduk',
    });
  });

  it('falls back to default appName when stored appName is empty', () => {
    localStorage.setItem(
      'sanduk-app-name',
      JSON.stringify({ appName: '' })
    );

    const { result } = renderHook(() => useAppSettings());
    expect(result.current.settings.appName).toBe('Sanduk');
  });

  it('updateSettings persists to localStorage', () => {
    const { result } = renderHook(() => useAppSettings());

    act(() => {
      result.current.updateSettings({ appName: 'NewName' });
    });

    expect(result.current.settings.appName).toBe('NewName');

    const stored = JSON.parse(localStorage.getItem('sanduk-app-name')!);
    expect(stored.appName).toBe('NewName');
  });

  it('resetSettings clears localStorage and restores defaults', () => {
    const { result } = renderHook(() => useAppSettings());

    act(() => {
      result.current.updateSettings({ appName: 'Changed' });
    });
    expect(result.current.settings.appName).toBe('Changed');

    act(() => {
      result.current.resetSettings();
    });
    expect(result.current.settings).toEqual({
      appName: 'Sanduk',
    });
    expect(localStorage.getItem('sanduk-app-name')).toBeNull();
  });
});
