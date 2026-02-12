import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, X, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { TagInput } from './TagInput';
import { ItemsInput } from './ItemsInput';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { addBin, useAllTags } from './useBins';
import { useAuth } from '@/lib/auth';
import { useAiSettings } from '@/features/ai/useAiSettings';
import { analyzeImageFile } from '@/features/ai/useAiAnalysis';
import { AiSuggestionsPanel } from '@/features/ai/AiSuggestionsPanel';
import { compressImage } from '@/features/photos/compressImage';
import { addPhoto } from '@/features/photos/usePhotos';
import type { AiSuggestions } from '@/types';

interface BinCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillName?: string;
}

export function BinCreateDialog({ open, onOpenChange, prefillName }: BinCreateDialogProps) {
  const navigate = useNavigate();
  const { activeLocationId } = useAuth();
  const allTags = useAllTags();
  const { settings: aiSettings } = useAiSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(prefillName ?? '');
  const [location, setLocation] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AiSuggestions | null>(null);
  const [aiSetupOpen, setAiSetupOpen] = useState(false);

  // Revoke ObjectURL on cleanup
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Scroll suggestions into view when they appear
  useEffect(() => {
    if (suggestions && suggestionsRef.current) {
      suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [suggestions]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  function resetForm() {
    setName(prefillName ?? '');
    setLocation('');
    setItems([]);
    setNotes('');
    setTags([]);
    setIcon('');
    setColor('');
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setAnalyzing(false);
    setAnalyzeError(null);
    setSuggestions(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setSuggestions(null);
    setAnalyzeError(null);
  }

  function handleRemovePhoto() {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setSuggestions(null);
    setAnalyzeError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleAnalyze() {
    if (!photo) return;
    if (!aiSettings) {
      setAiSetupOpen(true);
      return;
    }
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const compressed = await compressImage(photo);
      const file = compressed instanceof File
        ? compressed
        : new File([compressed], photo.name, { type: compressed.type || 'image/jpeg' });
      const result = await analyzeImageFile(file);
      setSuggestions(result);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Failed to analyze photo');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleApplySuggestions(changes: Partial<{ name: string; items: string[]; tags: string[]; notes: string }>) {
    if (changes.name !== undefined) setName(changes.name);
    if (changes.items !== undefined) setItems(changes.items);
    if (changes.tags !== undefined) setTags(changes.tags);
    if (changes.notes !== undefined) setNotes(changes.notes);
    setSuggestions(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !activeLocationId) return;
    setLoading(true);
    try {
      const id = await addBin({
        name: name.trim(),
        locationId: activeLocationId,
        items,
        notes: notes.trim(),
        tags,
        location: location.trim(),
        icon,
        color,
      });
      // Upload photo non-blocking (fire-and-forget)
      if (photo) {
        compressImage(photo)
          .then((compressed) => addPhoto(id, compressed instanceof File
            ? compressed
            : new File([compressed], photo.name, { type: compressed.type || 'image/jpeg' })))
          .catch(() => { /* photo upload is non-blocking */ });
      }
      onOpenChange(false);
      navigate(`/bin/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Bin</DialogTitle>
            <DialogDescription>Add a new storage bin to your inventory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo upload */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              {!photo ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border)] py-4 text-[14px] text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  Add Photo
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-14 w-14 rounded-[var(--radius-md)] object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[var(--text-secondary)] truncate">{photo.name}</p>
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      {(photo.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    title="Analyze with AI"
                    className="shrink-0"
                  >
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {analyzeError && (
                <p className="text-[13px] text-[var(--destructive)]">{analyzeError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bin-name">Name</Label>
              <Input
                id="bin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Holiday Decorations"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bin-location">Location</Label>
              <Input
                id="bin-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Garage shelf 3"
              />
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              <ItemsInput items={items} onChange={setItems} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bin-notes">Notes</Label>
              <Textarea
                id="bin-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput tags={tags} onChange={setTags} suggestions={allTags} />
            </div>

            {/* AI Suggestions */}
            {suggestions && (
              <div ref={suggestionsRef}>
                <AiSuggestionsPanel
                  suggestions={suggestions}
                  currentName={name}
                  currentItems={items}
                  currentTags={tags}
                  currentNotes={notes}
                  onApply={handleApplySuggestions}
                  onDismiss={() => setSuggestions(null)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker value={icon} onChange={setIcon} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || !activeLocationId || loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Setup Guidance Dialog */}
      <Dialog open={aiSetupOpen} onOpenChange={setAiSetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up AI Analysis</DialogTitle>
            <DialogDescription>
              AI can analyze your bin photos and suggest names, items, tags, and notes automatically. Connect an AI provider in Settings to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="rounded-[var(--radius-md)] bg-[var(--bg-input)] p-3 space-y-2 text-[13px] text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">Supported providers</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />OpenAI (GPT-4o, GPT-4o mini)</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />Anthropic (Claude)</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />Local LLM (OpenAI-compatible)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiSetupOpen(false)} className="rounded-[var(--radius-full)]">
              Later
            </Button>
            <Button
              onClick={() => {
                setAiSetupOpen(false);
                onOpenChange(false);
                navigate('/settings');
              }}
              className="rounded-[var(--radius-full)]"
            >
              <Settings className="h-4 w-4 mr-1.5" />
              Go to Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
