'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useBGMStore } from '@/stores/bgm';

export const UserConsentModal = () => {
  const t = useTranslations('UserConsentModal');

  const hasUserConsent = useBGMStore(state => state.hasUserConsent);
  const grantConsent = useBGMStore(state => state.grantConsent);
  const denyConsent = useBGMStore(state => state.denyConsent);

  const [isClosing, setIsClosing] = useState(false);
  const [rippleOrigin, setRippleOrigin] = useState<{ x: number; y: number } | null>(null);

  const handleConsent = useCallback((grant: boolean, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setRippleOrigin({ x: centerX, y: centerY });
    setIsClosing(true);

    // アニメーション完了後に実際にモーダルを閉じる
    setTimeout(() => {
      if (grant) {
        grantConsent();
      } else {
        denyConsent();
      }
    }, 1500);
  }, [grantConsent, denyConsent]);

  return (
    <div
      hidden={hasUserConsent !== null}
      className={`fixed inset-0 z-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center transition-all duration-1200 ease-out ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 優しい波エフェクト */}
      {isClosing && rippleOrigin && (
        <>
          {/* メイン波エフェクト */}
          <div
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{
              '--ripple-x': `${rippleOrigin.x}px`,
              '--ripple-y': `${rippleOrigin.y}px`,
            } as React.CSSProperties}
          >
            <div
              className="absolute rounded-full bg-black/3 dark:bg-white/3 left-[var(--ripple-x)] top-[var(--ripple-y)] -translate-x-1/2 -translate-y-1/2"
              style={{
                animation: 'gentle-ripple 1.5s ease-out forwards',
              }}
            >
            </div>
            <div
              className="absolute rounded-full bg-black/2 dark:bg-white/2 left-[var(--ripple-x)] top-[var(--ripple-y)] -translate-x-1/2 -translate-y-1/2"
              style={{
                animation: 'gentle-ripple-2 1.5s ease-out forwards',
                animationDelay: '0.2s',
              }}
            >
            </div>
          </div>

          {/* 背景の優しい光 */}
          <div className="fixed inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                '--ripple-x': `${rippleOrigin.x}px`,
                '--ripple-y': `${rippleOrigin.y}px`,
                'background': `radial-gradient(circle at var(--ripple-x) var(--ripple-y), rgba(255,255,255,0.01) 0%, transparent 60%)`,
                'animation': 'gentle-glow 1.5s ease-out forwards',
              } as React.CSSProperties}
            >
            </div>
          </div>
        </>
      )}

      <div className={`text-center max-w-sm mx-4 transition-all duration-1000 ease-out ${
        isClosing ? 'scale-98 opacity-0 translate-y-2' : 'scale-100 opacity-100 translate-y-0'
      }`}
      >
        <h3 className="text-lg font-heading font-semibold text-black dark:text-white mb-3 tracking-wide">
          LUNACEA Portfolio
        </h3>
        <p className="text-black/70 dark:text-white/70 text-sm leading-relaxed mb-8">
          {t('dialog_message_1')}
          <br />
          {t('dialog_message_2')}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={e => handleConsent(true, e)}
            disabled={isClosing}
            className="px-6 py-2 text-sm font-medium text-black dark:text-white hover:text-purple-300 transition-colors duration-200 disabled:pointer-events-none"
          >
            {t('allow')}
          </button>
          <div className="w-px h-8 bg-black/20 dark:bg-white/20 self-center"></div>
          <button
            type="button"
            onClick={e => handleConsent(false, e)}
            disabled={isClosing}
            className="px-6 py-2 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black transition-colors duration-200 disabled:pointer-events-none"
          >
            {t('deny')}
          </button>
        </div>
      </div>

      <style jsx>
        {`
        @keyframes gentle-ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 0;
          }
          30% {
            opacity: 0.8;
          }
          70% {
            opacity: 0.3;
          }
          100% {
            width: 300vmax;
            height: 300vmax;
            opacity: 0;
          }
        }
        
        @keyframes gentle-ripple-2 {
          0% {
            width: 0;
            height: 0;
            opacity: 0;
          }
          40% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.2;
          }
          100% {
            width: 350vmax;
            height: 350vmax;
            opacity: 0;
          }
        }
        
        @keyframes gentle-glow {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }
      `}
      </style>
    </div>
  );
};
