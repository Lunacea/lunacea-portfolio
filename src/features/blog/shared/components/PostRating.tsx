'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { FaRegHeart } from 'react-icons/fa';
import Icon from '@/shared/components/ui/Icon';

type Rating = { up: number; down: number; score: number; hasVoted?: boolean };

type Props = { slug: string };

export default function PostRating({ slug }: Props) {
  const t = useTranslations('Blog');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastActionAtRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetcher = useCallback(async (key: string) => {
    const res = await fetch(key, { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Failed');
    return json.data as Rating;
  }, []);

  const { data: rating, isLoading, mutate } = useSWR<Rating>(`/api/v1/ratings?slug=${encodeURIComponent(slug)}`, fetcher);

  async function vote(value: 'up') {
    // throttle: 600ms
    const now = Date.now();
    if (now - lastActionAtRef.current < 600) return;
    lastActionAtRef.current = now;

    // Optimistic UI
    const prev = rating;
    const currentlyVoted = !!prev?.hasVoted;
    const currentUp = Number(prev?.up ?? 0);
    const delta = currentlyVoted ? -1 : 1;
    const newUp = Math.max(0, currentUp + delta);
    const next: Rating = { up: newUp, down: 0, score: newUp, hasVoted: !currentlyVoted };
    void mutate(next, { revalidate: false });
    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/v1/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, value }),
      });
      if (!res.ok) {
        // revert on failure
        void mutate(prev, { revalidate: false });
        if (res.status === 429) setError('throttled');
        else setError('failed');
        return;
      }
      // サーバーから最新の集計を受け取り反映
      const json = await res.json();
      if (json?.data) {
        void mutate(json.data as Rating, { revalidate: false });
      } else {
        // 念のため再取得
        await mutate();
      }
    } catch {
      // revert on failure
      void mutate(prev, { revalidate: false });
      setError('failed');
    } finally {
      setSubmitting(false);
    }
  }

  const voted = !!rating?.hasVoted;
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        className={`inline-flex items-center justify-center w-9 h-9 rounded-full border focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 ${voted ? 'bg-pink-600 text-pink-50 border-pink-700 hover:bg-pink-600' : 'bg-card text-foreground border-border hover:bg-accent/20'}`}
        aria-label={t('like')}
        onClick={() => vote('up')}
        disabled={isSubmitting}
        title={t('like')}
      >
        <Icon icon={<FaRegHeart />} />
      </button>
      <span className={`text-sm ${voted ? 'text-pink-600' : 'text-muted-foreground'}`} aria-live="polite" suppressHydrationWarning>
        {mounted ? (isLoading ? '…' : (typeof rating?.up === 'number' ? rating.up : (rating ? Number(rating?.up ?? 0) : 0))) : ''}
      </span>
      {error === 'already' && (
        <p className="text-xs text-muted-foreground">{t('you_already_voted')}</p>
      )}
      {error === 'failed' && (
        <p className="text-xs text-red-600">{t('rating_failed')}</p>
      )}
    </div>
  );
}



