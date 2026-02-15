import { useState, useCallback } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { AiSuggestions } from '@/types';

export const MAX_AI_PHOTOS = 5;

export function mapErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.status) {
      case 422: return 'Invalid API key or model — check Settings > AI';
      case 429: return 'AI provider rate limited — wait a moment and try again';
      case 502: return 'Your AI provider returned an error — verify your settings';
      default: return err.message;
    }
  }
  return 'Couldn\'t analyze the photo — try again';
}

export async function analyzeImageFile(file: File, locationId?: string): Promise<AiSuggestions> {
  const formData = new FormData();
  formData.append('photo', file);
  if (locationId) formData.append('locationId', locationId);
  return apiFetch<AiSuggestions>('/api/ai/analyze-image', {
    method: 'POST',
    body: formData,
  });
}

export async function analyzeImageFiles(files: File[], locationId?: string): Promise<AiSuggestions> {
  const formData = new FormData();
  for (const file of files.slice(0, MAX_AI_PHOTOS)) {
    formData.append('photos', file);
  }
  if (locationId) formData.append('locationId', locationId);
  return apiFetch<AiSuggestions>('/api/ai/analyze-image', {
    method: 'POST',
    body: formData,
  });
}

export function useAiAnalysis() {
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (photoId: string) => {
    setIsAnalyzing(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await apiFetch<AiSuggestions>('/api/ai/analyze', {
        method: 'POST',
        body: { photoId },
      });
      setSuggestions(result);
    } catch (err) {
      setError(mapErrorMessage(err));
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeMultiple = useCallback(async (photoIds: string[]) => {
    setIsAnalyzing(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await apiFetch<AiSuggestions>('/api/ai/analyze', {
        method: 'POST',
        body: { photoIds: photoIds.slice(0, MAX_AI_PHOTOS) },
      });
      setSuggestions(result);
    } catch (err) {
      setError(mapErrorMessage(err));
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
    setError(null);
  }, []);

  return { suggestions, isAnalyzing, error, analyze, analyzeMultiple, clearSuggestions };
}
