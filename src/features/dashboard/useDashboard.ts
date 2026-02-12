import { useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useBinList } from '@/features/bins/useBins';
import { getScanHistory } from './scanHistory';
import type { Bin } from '@/types';

export function useDashboard() {
  const { user } = useAuth();
  const { bins, isLoading } = useBinList();

  const totalBins = bins.length;

  const totalItems = useMemo(
    () => bins.reduce((sum, b) => sum + (b.items?.length ?? 0), 0),
    [bins]
  );

  const recentlyUpdated = useMemo(
    () =>
      [...bins]
        .sort((a, b) => (b.updated_at > a.updated_at ? 1 : -1))
        .slice(0, 5),
    [bins]
  );

  const recentlyScanned = useMemo(() => {
    if (!user) return [] as Bin[];
    const history = getScanHistory(user.id);
    const binMap = new Map(bins.map((b) => [b.id, b]));
    return history
      .map((e) => binMap.get(e.binId))
      .filter((b): b is Bin => b != null)
      .slice(0, 5);
  }, [bins, user]);

  return { totalBins, totalItems, recentlyUpdated, recentlyScanned, isLoading };
}
