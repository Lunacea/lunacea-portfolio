'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FaLink, FaXTwitter, FaFacebook } from 'react-icons/fa6';
import Icon from '@/shared/components/ui/Icon';

type NavigatorWithShare = Navigator & { share: (data: { title?: string; text?: string; url?: string }) => Promise<void> };

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

  const text = useMemo(() => `${title}`, [title]);

  const xUrl = useMemo(() => {
    const params = new URLSearchParams({ text, url });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }, [text, url]);

  const facebookUrl = useMemo(() => {
    const params = new URLSearchParams({ u: url });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }, [url]);

  const openSharePopup = useCallback((shareUrl: string, name: string) => {
    try {
      const width = 600;
      const height = 600;
      const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
      const dualScreenTop = window.screenTop ?? window.screenY ?? 0;
      const screenWidth = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
      const screenHeight = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;
      const left = Math.max(0, (screenWidth - width) / 2) + dualScreenLeft;
      const top = Math.max(0, (screenHeight - height) / 2) + dualScreenTop;
      const features = `noopener,noreferrer,menubar=no,toolbar=no,status=no,width=${width},height=${height},top=${top},left=${left}`;
      const newWindow = window.open(shareUrl, name, features);
      if (!newWindow) {
        // ポップアップブロック時は何もしない（ページ遷移はしない）
      }
    } catch {
      // 例外時も遷移はしない
    }
  }, []);

  const canWebShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const onShareX = useCallback(async () => {
    if (canWebShare) {
      try {
        await (navigator as NavigatorWithShare).share({ title, text: title, url });
        return;
      } catch {}
    }
    openSharePopup(xUrl, 'share-x');
  }, [canWebShare, title, url, xUrl, openSharePopup]);

  const onShareFacebook = useCallback(async () => {
    if (canWebShare) {
      try {
        await (navigator as NavigatorWithShare).share({ title, text: title, url });
        return;
      } catch {}
    }
    openSharePopup(facebookUrl, 'share-facebook');
  }, [canWebShare, title, url, facebookUrl, openSharePopup]);

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
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-black text-white border border-border hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 ease-out shadow-sm hover:shadow-md active:translate-y-[1px]"
        aria-label="Share on X"
        title="X"
        onClick={onShareX}
      >
        <Icon className="text-[18px]" icon={<FaXTwitter />} />
        <span className="sr-only">X</span>
      </button>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#1877F2] text-white hover:bg-[#1877F2]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 ease-out shadow-sm hover:shadow-md active:translate-y-[1px]"
        aria-label="Share on Facebook"
        title="Facebook"
        onClick={onShareFacebook}
      >
        <Icon className="text-[18px]" icon={<FaFacebook />} />
        <span className="sr-only">Facebook</span>
      </button>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-card text-foreground border border-border hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 ease-out shadow-sm hover:shadow-md active:translate-y-[1px]"
        onClick={onCopy}
        aria-live="polite"
        aria-label={copied ? t('copied') : t('copy_link')}
        title={copied ? t('copied') : t('copy_link')}
      >
        <Icon className="text-[18px]" icon={<FaLink />} />
        <span className="sr-only">{copied ? t('copied') : t('copy_link')}</span>
      </button>
    </div>
  );
}


