import { useState, useEffect, useRef, useCallback } from 'react';
import { Home, Package, X, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { createHome } from '@/features/homes/useHomes';
import { addBin } from '@/features/bins/useBins';
import { COLOR_PALETTE } from '@/lib/colorPalette';

const STEPS = ['Home', 'Bin'] as const;

export interface OnboardingActions {
  step: number;
  homeId?: string;
  advanceWithHome: (id: string) => void;
  complete: () => void;
}

export function OnboardingOverlay({ step, homeId, advanceWithHome, complete }: OnboardingActions) {
  const { setActiveHomeId } = useAuth();
  const { showToast } = useToast();

  // Step 0 state
  const [homeName, setHomeName] = useState('');
  // Step 1 state
  const [binName, setBinName] = useState('');
  const [binLocation, setBinLocation] = useState('');
  const [binColor, setBinColor] = useState('');
  const [binTags, setBinTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  // Loading
  const [loading, setLoading] = useState(false);
  // Success animation after first bin creation
  const [showSuccess, setShowSuccess] = useState(false);
  // Animation key to retrigger on step change
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [step]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleCreateHome() {
    if (!homeName.trim()) return;
    setLoading(true);
    try {
      const home = await createHome(homeName.trim());
      setActiveHomeId(home.id);
      advanceWithHome(home.id);
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : 'Failed to create home' });
    } finally {
      setLoading(false);
    }
  }

  const dismissSuccess = useCallback(() => {
    setShowSuccess(false);
    complete();
  }, [complete]);

  async function handleCreateBin() {
    if (!binName.trim() || !homeId) return;
    setLoading(true);
    try {
      await addBin({
        name: binName.trim(),
        homeId,
        location: binLocation.trim() || undefined,
        color: binColor || undefined,
        tags: binTags.length > 0 ? binTags : undefined,
      });
      setShowSuccess(true);
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : 'Failed to create bin' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipSetup() {
    setLoading(true);
    try {
      // Only create a home if one wasn't already created in step 0
      if (!homeId) {
        const home = await createHome('My Home');
        setActiveHomeId(home.id);
      }
      complete();
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : 'Failed to skip setup' });
    } finally {
      setLoading(false);
    }
  }

  if (showSuccess) {
    return <BinSuccessOverlay onDismiss={dismissSuccess} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay-backdrop)] backdrop-blur-sm">
      <div className="glass-heavy rounded-[var(--radius-xl)] w-full max-w-sm mx-5 px-8 py-8 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={handleSkipSetup}
          disabled={loading}
          aria-label="Close setup"
          className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40 p-1"
        >
          <X className="h-5 w-5" />
        </button>
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                i === step
                  ? 'bg-[var(--accent)] scale-125'
                  : i < step
                    ? 'bg-[var(--accent)] opacity-40'
                    : 'bg-[var(--bg-active)]'
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div key={animKey} className="onboarding-step-enter">
          {step === 0 && (
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-[var(--accent)] bg-opacity-10 flex items-center justify-center mb-5">
                <Home className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-2">
                Name your home
              </h2>
              <p className="text-[14px] text-[var(--text-tertiary)] mb-6 leading-relaxed">
                A home is where your bins live. You can invite others later.
              </p>
              <Input
                value={homeName}
                onChange={(e) => setHomeName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateHome(); }}
                placeholder="e.g., My House"
                autoFocus
                className="mb-4 text-center"
              />
              <Button
                type="button"
                onClick={handleCreateHome}
                disabled={!homeName.trim() || loading}
                className="w-full rounded-[var(--radius-md)] h-11 text-[15px]"
              >
                {loading ? 'Creating...' : 'Continue'}
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-[var(--accent)] bg-opacity-10 flex items-center justify-center mb-5">
                <Package className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-2">
                Create your first bin
              </h2>
              <p className="text-[14px] text-[var(--text-tertiary)] mb-6 leading-relaxed">
                A bin is any container you want to track — a box, drawer, shelf, etc.
              </p>
              <div className="w-full space-y-3 mb-4">
                <Input
                  value={binName}
                  onChange={(e) => setBinName(e.target.value)}
                  placeholder="Bin name"
                  autoFocus
                />
                <Input
                  value={binLocation}
                  onChange={(e) => setBinLocation(e.target.value)}
                  placeholder="Location (optional)"
                />

                {/* Color picker */}
                <div className="text-left">
                  <label className="text-[13px] text-[var(--text-tertiary)] mb-1.5 block">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBinColor('')}
                      title="None"
                      className={cn(
                        'h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all',
                        !binColor
                          ? 'border-[var(--accent)] scale-110'
                          : 'border-[var(--text-tertiary)] opacity-50 hover:opacity-100 hover:scale-105'
                      )}
                    >
                      <Ban className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                    </button>
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setBinColor(c.key)}
                        title={c.label}
                        className={cn(
                          'h-7 w-7 rounded-full transition-all',
                          binColor === c.key
                            ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-elevated)] scale-110'
                            : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: c.dot }}
                      />
                    ))}
                  </div>
                </div>

                {/* Tags input */}
                <div className="text-left">
                  <label className="text-[13px] text-[var(--text-tertiary)] mb-1.5 block">Tags</label>
                  <div className="flex flex-wrap gap-1.5 rounded-[var(--radius-md)] bg-[var(--bg-input)] p-2 focus-within:ring-2 focus-within:ring-[var(--accent)]">
                    {binTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pl-1.5">
                        <button
                          type="button"
                          onClick={() => setBinTags(binTags.filter((t) => t !== tag))}
                          className="mr-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                        {tag}
                      </Badge>
                    ))}
                    <input
                      ref={tagInputRef}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                          e.preventDefault();
                          const t = tagInput.trim().toLowerCase();
                          if (!binTags.includes(t)) setBinTags([...binTags, t]);
                          setTagInput('');
                        } else if (e.key === 'Backspace' && !tagInput && binTags.length > 0) {
                          setBinTags(binTags.slice(0, -1));
                        }
                      }}
                      placeholder={binTags.length === 0 ? 'Type and press Enter' : ''}
                      className="h-6 min-w-[80px] flex-1 bg-transparent p-0 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                    />
                  </div>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleCreateBin}
                disabled={!binName.trim() || loading}
                className="w-full rounded-[var(--radius-md)] h-11 text-[15px]"
              >
                {loading ? 'Creating...' : 'Create Bin'}
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function BinSuccessOverlay({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[var(--overlay-backdrop)] backdrop-blur-md scan-success-enter"
      onClick={onDismiss}
    >
      {/* Expanding rings */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full border-2 border-[var(--accent)] scan-ring scan-ring-1" />
        <div className="absolute h-24 w-24 rounded-full border-2 border-[var(--accent)] scan-ring scan-ring-2" />
        <div className="absolute h-24 w-24 rounded-full border-2 border-[var(--accent)] scan-ring scan-ring-3" />

        {/* Checkmark circle */}
        <div className="relative h-24 w-24 rounded-full bg-[var(--accent)] flex items-center justify-center scan-check-scale">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 w-12 scan-check-draw"
          >
            <polyline points="4 12 10 18 20 6" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <p className="mt-8 text-[22px] font-bold text-[var(--text-primary)] scan-text-fade">
        First bin created!
      </p>
      <p className="mt-2 text-[14px] text-[var(--text-tertiary)] scan-text-fade-delay">
        You're all set
      </p>
    </div>
  );
}
