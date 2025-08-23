'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBGMStore } from '@/features/bgm/store';
import { usePathname } from '@/shared/libs/i18nNavigation';
import styles from './UserConsentModal.module.css';

export default function UserConsentModal() {
  const t = useTranslations('UserConsentModal');
  const pause = useBGMStore(state => state.pause);
  const hasUserConsent = useBGMStore(state => state.hasUserConsent);
  const grantConsent = useBGMStore(state => state.grantConsent);
  const denyConsent = useBGMStore(state => state.denyConsent);
  const pathname = usePathname();
  const isHome = pathname === '/' || /^(?:\/ja|\/en)?\/?$/.test(pathname);
  // 初回ページロード検知（セッション内で一度だけtrue）
  const [isFirstPageLoad, setIsFirstPageLoad] = useState(false);
  useEffect(() => {
    try {
      const visited = sessionStorage.getItem('visitedAnyRoute');
      if (!visited) {
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setIsFirstPageLoad(true);
        sessionStorage.setItem('visitedAnyRoute', '1');
      }
    } catch {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setIsFirstPageLoad(true);
    }
  }, []);
  // consent 未決定かつ (ホーム以外 or 初回ページロードのホーム) のとき表示
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setIsMounted(true);
  }, []);
  const shouldShowOverlay = isMounted && hasUserConsent === null && (!isHome || isFirstPageLoad);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rippleOrigin, setRippleOrigin] = useState<{ x: number; y: number } | null>(null);
  const rippleRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const onChoose = useCallback((event: React.MouseEvent, nextPlay: boolean) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setRippleOrigin({ x: centerX, y: centerY });
    setIsAnimating(true);
    setTimeout(() => {
      if (nextPlay) {
        // grantConsent 内で play() を呼ぶため、ここでは二重呼び出ししない
        grantConsent();
      } else {
        denyConsent();
        pause();
      }
      setIsAnimating(false);
    }, 600);
  }, [grantConsent, denyConsent, pause]);
  useEffect(() => {
    if (!rippleOrigin) {
      return;
    }
    if (rippleRef.current) {
      rippleRef.current.style.setProperty('--ripple-x', `${rippleOrigin.x}px`);
      rippleRef.current.style.setProperty('--ripple-y', `${rippleOrigin.y}px`);
    }
    if (glowRef.current) {
      glowRef.current.style.setProperty('--ripple-x', `${rippleOrigin.x}px`);
      glowRef.current.style.setProperty('--ripple-y', `${rippleOrigin.y}px`);
    }
  }, [rippleOrigin]);

  return (
    <div className={`${styles.modalRoot} ${(shouldShowOverlay || isAnimating) ? styles.visibleState : styles.hiddenState}`}>
      {isAnimating && rippleOrigin && (
        <>
          <div ref={rippleRef} className={styles.rippleContainer}>
            <div className={styles.mainRipple}></div>
            <div className={styles.secondaryRipple}></div>
          </div>
          <div className={styles.backgroundGlow}>
            <div ref={glowRef} className={styles.glowLayer}></div>
          </div>
        </>
      )}
      <div className={`${styles.content} ${(shouldShowOverlay || isAnimating) ? styles.contentVisible : styles.contentHidden}`}>
        <h3 className="text-lg font-heading font-semibold text-black dark:text-white mb-3 tracking-wide">LUNACEA Portfolio</h3>
        <p className="text-black/70 dark:text-white/70 text-sm leading-relaxed mb-8">{t('dialog_message_1')}</p>
        <div className="flex gap-3 justify-center">
          <button type="button" onClick={e => onChoose(e, true)} className="px-6 py-2 text-sm font-medium text-black dark:text-white hover:text-purple-300 transition-colors duration-200">{t('allow')}</button>
          <div className="w-px h-8 bg-black/20 dark:bg-white/20 self-center"></div>
          <button type="button" onClick={e => onChoose(e, false)} className="px-6 py-2 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black transition-colors duration-200">{t('deny')}</button>
        </div>
      </div>
    </div>
  );
}
