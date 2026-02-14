interface ScanEntry {
  binId: string;
  scannedAt: string;
}

import { getDashboardSettings } from '@/lib/dashboardSettings';

function storageKey(userId: string) {
  return `sanduk-scan-history-${userId}`;
}

export function recordScan(userId: string, binId: string) {
  const history = getScanHistory(userId);
  const filtered = history.filter((e) => e.binId !== binId);
  filtered.unshift({ binId, scannedAt: new Date().toISOString() });
  const maxEntries = getDashboardSettings().scanHistoryMax;
  if (filtered.length > maxEntries) filtered.length = maxEntries;
  localStorage.setItem(storageKey(userId), JSON.stringify(filtered));
}

export function getScanHistory(userId: string): ScanEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as ScanEntry[];
  } catch {
    return [];
  }
}
