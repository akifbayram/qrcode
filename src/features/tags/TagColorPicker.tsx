import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { COLOR_PALETTE } from '@/lib/colorPalette';
import { cn } from '@/lib/utils';

interface TagColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

export function TagColorPicker({ currentColor, onColorChange }: TagColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const currentPreset = COLOR_PALETTE.find((c) => c.key === currentColor);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-[var(--bg-active)] transition-colors shrink-0"
        aria-label="Pick tag color"
      >
        {currentPreset ? (
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: currentPreset.dot }}
          />
        ) : (
          <Palette className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 glass-card rounded-[var(--radius-lg)] p-2 shadow-lg min-w-[180px]">
          <div className="grid grid-cols-7 gap-1.5">
            {/* None option */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onColorChange('');
                setOpen(false);
              }}
              className={cn(
                'h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all',
                !currentColor
                  ? 'border-[var(--accent)] bg-[var(--bg-base)]'
                  : 'border-[var(--border-glass)] bg-[var(--bg-base)] hover:border-[var(--text-tertiary)]'
              )}
              aria-label="No color"
              title="None"
            >
              {!currentColor && (
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              )}
            </button>
            {COLOR_PALETTE.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange(preset.key);
                  setOpen(false);
                }}
                className={cn(
                  'h-6 w-6 rounded-full transition-all',
                  currentColor === preset.key
                    ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg-base)]'
                    : 'hover:scale-110'
                )}
                style={{ backgroundColor: preset.dot }}
                aria-label={preset.label}
                title={preset.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
