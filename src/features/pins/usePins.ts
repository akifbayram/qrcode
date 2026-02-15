import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { notifyBinsChanged } from '@/features/bins/useBins';
import type { Bin, ListResponse } from '@/types';

const PINS_CHANGED_EVENT = 'pins-changed';

export function notifyPinsChanged() {
  window.dispatchEvent(new Event(PINS_CHANGED_EVENT));
}

export function usePinnedBins() {
  const { activeLocationId, token } = useAuth();
  const [pinnedBins, setPinnedBins] = useState<Bin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (!token || !activeLocationId) {
      setPinnedBins([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    apiFetch<ListResponse<Bin>>(`/api/bins/pinned?location_id=${encodeURIComponent(activeLocationId)}`)
      .then((data) => {
        if (!cancelled) setPinnedBins(data.results);
      })
      .catch(() => {
        if (!cancelled) setPinnedBins([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, activeLocationId, refreshCounter]);

  useEffect(() => {
    const handler = () => setRefreshCounter((c) => c + 1);
    window.addEventListener(PINS_CHANGED_EVENT, handler);
    window.addEventListener('bins-changed', handler);
    return () => {
      window.removeEventListener(PINS_CHANGED_EVENT, handler);
      window.removeEventListener('bins-changed', handler);
    };
  }, []);

  return { pinnedBins, isLoading };
}

export async function pinBin(binId: string): Promise<void> {
  await apiFetch(`/api/bins/${binId}/pin`, { method: 'POST' });
  notifyPinsChanged();
  notifyBinsChanged();
}

export async function unpinBin(binId: string): Promise<void> {
  await apiFetch(`/api/bins/${binId}/pin`, { method: 'DELETE' });
  notifyPinsChanged();
  notifyBinsChanged();
}

export async function reorderPins(binIds: string[]): Promise<void> {
  await apiFetch('/api/bins/pinned/reorder', {
    method: 'PUT',
    body: { bin_ids: binIds },
  });
  notifyPinsChanged();
}
