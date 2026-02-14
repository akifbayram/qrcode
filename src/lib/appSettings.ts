import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  appName: string;
}

const STORAGE_KEY = 'sanduk-app-name';

const DEFAULTS: AppSettings = {
  appName: 'Sanduk',
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        appName: parsed.appName || DEFAULTS.appName,
      };
    }
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    document.title = settings.appName;
  }, [settings.appName]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings({ ...DEFAULTS });
  }, []);

  return { settings, updateSettings, resetSettings };
}
