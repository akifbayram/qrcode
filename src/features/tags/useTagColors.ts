import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { TagColor } from '@/types';

const TAG_COLORS_CHANGED_EVENT = 'tag-colors-changed';

function notifyTagColorsChanged() {
  window.dispatchEvent(new Event(TAG_COLORS_CHANGED_EVENT));
}

export function useTagColors() {
  const { activeHomeId, token } = useAuth();
  const [rawTagColors, setRawTagColors] = useState<TagColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    if (!token || !activeHomeId) {
      setRawTagColors([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    apiFetch<TagColor[]>(`/api/tag-colors?home_id=${encodeURIComponent(activeHomeId)}`)
      .then((data) => {
        if (!cancelled) setRawTagColors(data);
      })
      .catch(() => {
        if (!cancelled) setRawTagColors([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, activeHomeId, refreshCounter]);

  useEffect(() => {
    const handler = () => setRefreshCounter((c) => c + 1);
    window.addEventListener(TAG_COLORS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(TAG_COLORS_CHANGED_EVENT, handler);
  }, []);

  const tagColors = useMemo(() => {
    const map = new Map<string, string>();
    for (const tc of rawTagColors) {
      map.set(tc.tag, tc.color);
    }
    return map;
  }, [rawTagColors]);

  return { tagColors, isLoading };
}

export async function setTagColor(homeId: string, tag: string, color: string): Promise<void> {
  await apiFetch('/api/tag-colors', {
    method: 'PUT',
    body: { homeId, tag, color },
  });
  notifyTagColorsChanged();
}

export async function removeTagColor(homeId: string, tag: string): Promise<void> {
  await apiFetch(`/api/tag-colors/${encodeURIComponent(tag)}?home_id=${encodeURIComponent(homeId)}`, {
    method: 'DELETE',
  });
  notifyTagColorsChanged();
}
