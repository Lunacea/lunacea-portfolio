'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaLink, FaXTwitter } from 'react-icons/fa6';
import { SiBluesky } from 'react-icons/si';
import Icon from '@/shared/components/ui/Icon';

type ShareButtonsProps = {
  slug: string;
  title: string;
  absoluteUrl?: string;
};

export default function ShareButtons({ slug, title, absoluteUrl }: ShareButtonsProps) {
  const t = useTranslations('Blog');
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    // サーバー/クライアントで一致するURLを親から受け取る
    return absoluteUrl ?? `/blog/${encodeURIComponent(slug)}`;
  }, [absoluteUrl, slug]);

  const text = useMemo(() => `"${title}"`, [title]);

  const xUrl = useMemo(() => {
    const params = new URLSearchParams({ text: `${text} ${url}` });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }, [text, url]);

  const bskyUrl = useMemo(() => {
    const params = new URLSearchParams({ text: `${text} ${url}` });
    return `https://bsky.app/intent/compose?${params.toString()}`;
  }, [text, url]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback selection
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [url]);

  return (
    <div className="mt-8 flex items-center gap-3" aria-label={t('share')}>
      <a
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-accent/20 text-sm"
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        <Icon icon={<FaXTwitter />} />
        <span className="sr-only">X</span>
      </a>
      <a
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-accent/20 text-sm"
        href={bskyUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Bluesky"
      >
        <Icon icon={<SiBluesky />} />
        <span className="sr-only">Bluesky</span>
      </a>
      <button
        type="button"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-accent/20 text-sm"
        onClick={onCopy}
        aria-live="polite"
        aria-label={t('copy_link')}
        title={t('copy_link')}
      >
        <Icon icon={<FaLink />} />
        <span>{copied ? t('copied') : t('copy_link')}</span>
      </button>
    </div>
  );
}


