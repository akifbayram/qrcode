import { createContext, useContext } from 'react';
import { useTagColors } from './useTagColors';

interface TagColorsContextValue {
  tagColors: Map<string, string>;
  isLoading: boolean;
}

const TagColorsContext = createContext<TagColorsContextValue>({
  tagColors: new Map(),
  isLoading: false,
});

export function TagColorsProvider({ children }: { children: React.ReactNode }) {
  const { tagColors, isLoading } = useTagColors();

  return (
    <TagColorsContext.Provider value={{ tagColors, isLoading }}>
      {children}
    </TagColorsContext.Provider>
  );
}

export function useTagColorsContext() {
  return useContext(TagColorsContext);
}
