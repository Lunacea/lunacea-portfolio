'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { X } from 'lucide-react';

type TagInputProps = {
  value: string[];
  onChangeAction: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function TagInput({ value, onChangeAction, placeholder, disabled, className }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalized = useMemo(() => value.map(v => v.trim()).filter(v => v.length > 0), [value]);

  const addTag = useCallback((tag: string) => {
    const t = tag.trim();
    if (!t) return;
    if (normalized.includes(t)) return;
    onChangeAction([...normalized, t]);
    setDraft('');
  }, [normalized, onChangeAction]);

  const removeTag = useCallback((tag: string) => {
    onChangeAction(normalized.filter(t => t !== tag));
  }, [normalized, onChangeAction]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
      } else if (e.key === 'Backspace' && draft === '' && normalized.length > 0) {
        const last = normalized[normalized.length - 1];
        if (last) removeTag(last);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 border-0 border-b border-input p-0 rounded-none bg-transparent">
        {normalized.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-0">
            {normalized.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-sm rounded-full border border-border bg-transparent text-foreground">
                <span>{tag}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 p-0 text-xs"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => removeTag(tag)}
                  disabled={disabled}
                >
                  <X className="h-5 w-5" color="gray" />
                </Button>
              </span>
            ))}
          </div>
        )}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="border-0 focus-visible:ring-0 px-4 py-2 w-[14em] bg-transparent"
        />
      </div>
    </div>
  );
}


